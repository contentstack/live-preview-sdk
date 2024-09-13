import { VisualEditorCslpEventDetails } from "../types/visualBuilder.types";
import {
    generateAddInstanceButton,
    getAddInstanceButtons,
} from "../generators/generateAddInstanceButtons";
import liveEditorPostMessage from "./visualBuilderPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";
import getChildrenDirection from "./getChildrenDirection";
import { hideOverlay } from "../generators/generateOverlay";
import { hideHoverOutline } from "../listeners/mouseHover";

const WAIT_FOR_NEW_INSTANCE_TIMEOUT = 4000;

/**
 * The function that handles the add instance buttons for multiple fields.
 * @param eventDetails The details containing the field metadata and cslp value.
 * @param elements The elements object that contain the editable element and visual editor wrapper.
 * @param config The configuration object that contains the expected field data and disabled state.
 * @returns void
 */
export function handleAddButtonsForMultiple(
    eventDetails: VisualEditorCslpEventDetails,
    elements: {
        editableElement: Element | null;
        visualEditorContainer: HTMLDivElement | null;
        resizeObserver: ResizeObserver;
    },
    config: {
        expectedFieldData: any;
        disabled: boolean;
        label: string | undefined;
    }
): void {
    const { editableElement, visualEditorContainer, resizeObserver } = elements;
    const { expectedFieldData, disabled, label } = config;

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

    const overlayWrapper = visualEditorContainer.querySelector(
        ".visual-builder__overlay__wrapper"
    );
    const focusedToolbar = visualEditorContainer.querySelector(
        ".visual-builder__focused-toolbar"
    );

    const hideOverlayAndHoverOutline = () => {
        hideHoverOutline(visualEditorContainer);
        hideOverlay({
            visualEditorContainer: visualEditorContainer,
            visualEditorOverlayWrapper: overlayWrapper as HTMLDivElement,
            focusedToolbar: focusedToolbar as HTMLDivElement,
            resizeObserver,
        });
    };

    if (disabled) {
        return;
    }

    // is whole field and not a single instance of the multiple field
    const isField =
        eventDetails.fieldMetadata.instance.fieldPathWithIndex ===
        eventDetails.fieldMetadata.fieldPathWithIndex;

    const prevIndex = isField
        ? 0
        : eventDetails.fieldMetadata.multipleFieldMetadata.index;
    const nextIndex = isField
        ? expectedFieldData.length
        : eventDetails.fieldMetadata.multipleFieldMetadata.index + 1;

    const parentCslp = isField ? eventDetails.cslpData : parentCslpValue;

    const onMessageSent = (index: number) => {
        hideOverlayAndHoverOutline();
        observeParentAndFocusNewInstance({
            parentCslp,
            index,
        });
    };

    const previousButton = generateAddInstanceButton(() => {
        liveEditorPostMessage
            ?.send(LiveEditorPostMessageEvents.ADD_INSTANCE, {
                fieldMetadata: eventDetails.fieldMetadata,
                index: prevIndex,
            })
            .then(onMessageSent.bind(null, prevIndex));
    }, label);

    const nextButton = generateAddInstanceButton(() => {
        liveEditorPostMessage
            ?.send(LiveEditorPostMessageEvents.ADD_INSTANCE, {
                fieldMetadata: eventDetails.fieldMetadata,
                index: nextIndex,
            })
            .then(onMessageSent.bind(null, nextIndex));
    }, label);

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

/**
 * This function that observes the parent element and focuses the newly added instance.
 *
 * @param parentCslp The parent cslp value.
 * @param index The index of the new instance.
 * @returns void
 *
 * We can evolve the retry logic, as different use cases arise.
 * Currently, if the new element is not found after the first mutation, we until
 * WAIT_FOR_NEW_INSTANCE_TIMEOUT, expecting that the new instance/block will be
 * found in later mutations and we can focus + disconnect then.
 * We also ensure there is only one setTimeout scheduled.
 */
export function observeParentAndFocusNewInstance({
    parentCslp,
    index,
}: {
    parentCslp: string;
    index: number;
}): void {
    const parent = document.querySelector(
        `[data-cslp='${parentCslp}']`
    ) as HTMLElement;

    if (parent) {
        const expectedCslp = [parentCslp, index].join(".");

        let hasObserverDisconnected = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const mutationObserver = new MutationObserver(
            (_mutations, observer) => {
                const newInstance = parent.querySelector(
                    `[data-cslp='${expectedCslp}']`
                ) as HTMLElement | null;
                if (newInstance) {
                    // this is how we also navigate to parent elements, but parent elements
                    // are never primitive fields, the instances can be and this steals
                    // focus from the form and puts it on the canvas.
                    // So currently for a singleline multiple field, the form opens but we
                    // come back to the canvas.
                    // TODO - maybe we should not focus the content-editable
                    // TODO - temp fix. We remove our empty block div once the new block arrives
                    // but we focus the element before that and then the block shifts.
                    // For some reason, the window resize event also does not trigger
                    setTimeout(() => newInstance.click(), 150);
                    observer.disconnect();
                    hasObserverDisconnected = true;
                    return;
                }
                if (!hasObserverDisconnected && !timeoutId) {
                    // disconnect the observer whether we found the new instance or not
                    // after timeout
                    timeoutId = setTimeout(() => {
                        observer.disconnect();
                        hasObserverDisconnected = false;
                    }, WAIT_FOR_NEW_INSTANCE_TIMEOUT);
                }
            }
        );
        mutationObserver.observe(parent, {
            childList: true,
            // watch subtrees as there may be wrapper elements
            subtree: true,
            // we don't need to watch for attribute changes
            attributes: false,
        });
    }
}
