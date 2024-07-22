import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import {
    generateAddInstanceButton,
    getAddInstanceButtons,
} from "../generators/generateAddInstanceButtons";
import liveEditorPostMessage from "./liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";
import getChildrenDirection from "./getChildrenDirection";
import { hideOverlay } from "../generators/generateOverlay";
import { hideHoverOutline } from "../listeners/mouseHover";

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
    }
): void {
    const { editableElement, visualEditorContainer, resizeObserver } = elements;
    const { expectedFieldData, disabled } = config;

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
        ".visual-editor__overlay__wrapper"
    );
    const focusedToolbar = visualEditorContainer.querySelector(
        ".visual-editor__focused-toolbar"
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

    const previousButton = generateAddInstanceButton(() => {
        liveEditorPostMessage
            ?.send(LiveEditorPostMessageEvents.ADD_INSTANCE, {
                fieldMetadata: eventDetails.fieldMetadata,
                index: prevIndex,
            })
            .then(hideOverlayAndHoverOutline);
    });

    const nextButton = generateAddInstanceButton(() => {
        liveEditorPostMessage
            ?.send(LiveEditorPostMessageEvents.ADD_INSTANCE, {
                fieldMetadata: eventDetails.fieldMetadata,
                index: nextIndex,
            })
            .then(hideOverlayAndHoverOutline);
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
