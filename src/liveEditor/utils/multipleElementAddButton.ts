import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { FieldSchemaMap } from "./fieldSchemaMap";
import {
    generateAddInstanceButton,
    getAddInstanceButtons,
} from "../generators/generateAddInstanceButtons";
import { isFieldDisabled } from "./isFieldDisabled";
import liveEditorPostMessage from "./liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";
import getChildrenDirection from "./getChildrenDirection";

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
        visualEditorContainer: HTMLDivElement | null;
    }
): void {
    const { editableElement, visualEditorContainer } = elements;

    const parentCslpValue =
        eventDetails.fieldMetadata.multipleFieldMetadata?.parentDetails
            ?.parentCslpValue;

    if (!editableElement || !parentCslpValue) {
        return;
    }

    const direction = getChildrenDirection(editableElement, parentCslpValue);
    if (direction === "none" || !visualEditorContainer) {
        return;
    }

    const targetDOMDimension = editableElement.getBoundingClientRect();
    removeAddInstanceButtons(
        {
            visualEditorContainer: visualEditorContainer,
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

            if (!visualEditorContainer.contains(previousButton)) {
                visualEditorContainer.appendChild(previousButton);
            }

            if (!visualEditorContainer.contains(nextButton)) {
                visualEditorContainer.appendChild(nextButton);
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
        visualEditorContainer: HTMLDivElement | null;
        overlayWrapper: HTMLDivElement | null;
        eventTarget: EventTarget | null;
    },
    forceRemoveAll = false
): void {
    const { visualEditorContainer, overlayWrapper, eventTarget } = elements;

    if (!visualEditorContainer) {
        return;
    }

    if (forceRemoveAll) {
        const addInstanceButtons = getAddInstanceButtons(
            visualEditorContainer,
            true
        );

        addInstanceButtons?.forEach((button) => button.remove());
    }

    const addInstanceButtons = getAddInstanceButtons(visualEditorContainer);

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
