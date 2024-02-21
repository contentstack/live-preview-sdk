import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { FieldSchemaMap } from "./fieldSchemaMap";
import {
    generateAddInstanceButton,
    getAddInstanceButtons,
} from "./instanceButtons";
import { isFieldDisabled } from "./isFieldDisabled";
import liveEditorPostMessage from "./liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

export function getChildrenDirection(
    editableElement: Element,
    parentCslpValue: string
): "none" | "horizontal" | "vertical" {
    if (!editableElement) {
        return "none";
    }

    const parentElement = editableElement.closest(
        `[data-cslp="${parentCslpValue}"]`
    );

    if (!parentElement) {
        return "none";
    }

    const [firstChildElement, secondChildElement, removeClone] =
        getChildElements(parentElement, parentCslpValue);

    if (!firstChildElement) return "none";

    // get horizontal and vertical position differences
    const firstChildBounds = firstChildElement.getBoundingClientRect();
    const secondChildBounds = secondChildElement.getBoundingClientRect();

    const deltaX = Math.abs(firstChildBounds.left - secondChildBounds.left);
    const deltaY = Math.abs(firstChildBounds.top - secondChildBounds.top);

    const dir = deltaX > deltaY ? "horizontal" : "vertical";

    // remove the clone that was created in case there was only one child
    removeClone();

    return dir;
}

/**
 * Gets the first and second child elements of the parent element.
 * @param parentElement The parent element that contains the child elements.
 * @param parentCslpValue The cslp value of the parent element.
 * @returns The first and second child elements and a function to remove the clone.
 */
function getChildElements(
    parentElement: Element,
    parentCslpValue: string
): [Element, Element, () => void] | [null, null, () => void] {
    const childElements = parentElement.querySelectorAll(
        `[data-cslp^="${parentCslpValue + "."}"]`
    );

    // filter out elements that does not end with "." + number
    const filteredChildElements = Array.from(childElements).filter(
        (childElement) =>
            childElement.getAttribute("data-cslp")?.match(/\.\d+$/) !== null
    );

    const firstChild = filteredChildElements.at(0);
    if (!firstChild) return [null, null, () => {}];

    const secondChild = filteredChildElements.at(1);
    if (secondChild) return [firstChild, secondChild, () => {}];

    // create a dummy clone to get the direction
    const firstChildClone = document.createElement(firstChild.tagName);
    firstChildClone.setAttribute(
        "class",
        firstChild.getAttribute("class") ?? ""
    );

    const HIDE_ELEMENT_CSS =
        "overflow: hidden !important; width: 0 !important; height: 0 !important; padding: 0 !important; border: 0 !important;";
    firstChildClone.setAttribute("style", HIDE_ELEMENT_CSS);

    parentElement.appendChild(firstChildClone);

    function removeClone() {
        parentElement.removeChild(firstChildClone);
    }

    return [firstChild, firstChildClone, removeClone];
}

/**
 * The function that handles the add instance buttons for multiple fields.
 * @param eventDetails The details containing the field metadata and cslp value.
 * @param elements The elements object that contain the editable element and visual editor wrapper.
 * @returns void
 */
export function handleAddButtonsForMultiple(
    eventDetails: VisualEditorCslpEventDetails,
    elements: {
        editableElement: Element | null;
        visualEditorWrapper: HTMLDivElement | null;
    }
): void {
    const { editableElement, visualEditorWrapper } = elements;

    console.log('[IN SDK] : handleAddButtonsForMultiple', visualEditorWrapper, typeof visualEditorWrapper);
    

    const parentCslpValue =
        eventDetails.fieldMetadata.multipleFieldMetadata?.parentDetails
            ?.parentCslpValue;

    if (!editableElement || !parentCslpValue) {
        return;
    }

    const direction = getChildrenDirection(editableElement, parentCslpValue);
    if (direction === "none" || !visualEditorWrapper) {
        return;
    }

    const targetDOMDimension = editableElement.getBoundingClientRect();
    removeAddInstanceButtons(
        {
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: null,
            overlayWrapper: null,
        },
        true
    );

    FieldSchemaMap.getFieldSchema(
        eventDetails.fieldMetadata.content_type_uid,
        eventDetails.fieldMetadata.fieldPath
    ).then((fieldSchemaMap) => {
        const { isDisabled: fieldDisabled } = isFieldDisabled(
            fieldSchemaMap,
            eventDetails
        );

        if (!fieldDisabled) {
            const previousButton = generateAddInstanceButton(() => {
                liveEditorPostMessage?.send(
                    LiveEditorPostMessageEvents.ADD_INSTANCE,
                    {
                        fieldMetadata: eventDetails.fieldMetadata,
                        index: eventDetails.fieldMetadata.multipleFieldMetadata
                            .index,
                    }
                );
            });
            const nextButton = generateAddInstanceButton(() => {
                liveEditorPostMessage?.send(
                    LiveEditorPostMessageEvents.ADD_INSTANCE,
                    {
                        fieldMetadata: eventDetails.fieldMetadata,
                        index:
                            eventDetails.fieldMetadata.multipleFieldMetadata
                                .index + 1,
                    }
                );
            });

            console.log('[IN SDK] : handleAddButtonsForMultiple : prevButton ', previousButton);
            console.log('[IN SDK] : handleAddButtonsForMultiple : nextButton ', nextButton);
            

            if (!visualEditorWrapper.contains(previousButton)) {
                visualEditorWrapper.appendChild(previousButton);
            }

            if (!visualEditorWrapper.contains(nextButton)) {
                visualEditorWrapper.appendChild(nextButton);
            }

            if (direction === "horizontal") {
                const middleHeight =
                    targetDOMDimension.top +
                    (targetDOMDimension.bottom - targetDOMDimension.top) / 2 +
                    window.scrollY;
                previousButton.style.left = `${targetDOMDimension.left}px`;
                previousButton.style.top = `${middleHeight}px`;

                nextButton.style.left = `${targetDOMDimension.right}px`;
                nextButton.style.top = `${middleHeight}px`;
            } else {
                const middleWidth =
                    targetDOMDimension.left +
                    (targetDOMDimension.right - targetDOMDimension.left) / 2;
                previousButton.style.left = `${middleWidth}px`;
                previousButton.style.top = `${
                    targetDOMDimension.top + window.scrollY
                }px`;

                nextButton.style.left = `${middleWidth}px`;
                nextButton.style.top = `${
                    targetDOMDimension.bottom + window.scrollY
                }px`;
            }
        }
    });
}

export function removeAddInstanceButtons(
    elements: {
        visualEditorWrapper: HTMLDivElement | null;
        overlayWrapper: HTMLDivElement | null;
        eventTarget: EventTarget | null;
    },
    forceRemoveAll = false
): void {
    const { visualEditorWrapper, overlayWrapper, eventTarget } = elements;

    if (!visualEditorWrapper) {
        return;
    }

    if (forceRemoveAll) {
        const addInstanceButtons = getAddInstanceButtons(
            visualEditorWrapper,
            true
        );

        addInstanceButtons.forEach((button) => button.remove());
    }

    const addInstanceButtons = getAddInstanceButtons(visualEditorWrapper);

    if (!addInstanceButtons) {
        return;
    }

    const [previousButton, nextButton] = addInstanceButtons;

    if (overlayWrapper?.classList.contains("visible")) {
        return;
    }

    if (
        eventTarget &&
        (previousButton.contains(eventTarget as Node) ||
            nextButton.contains(eventTarget as Node))
    ) {
        return;
    }

    nextButton.remove();
    previousButton.remove();
}
