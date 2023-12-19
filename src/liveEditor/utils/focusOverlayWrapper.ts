import { extractDetailsFromCslp } from "../../utils/cslpdata";
import { LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX } from "./constants";
import { cleanIndividualFieldResidual } from "./handleIndividualFields";
import liveEditorPostMessage from "./liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

/**
 * Adds a focus overlay to the target element.
 * @param targetElement - The element to add the focus overlay to.
 * @param focusOverlayWrapper - The HTMLDivElement that contains the focus overlay.
 * @returns void
 */
export function addFocusOverlay(
    targetElement: Element,
    focusOverlayWrapper: HTMLDivElement
): void {
    const targetElementDimension = targetElement.getBoundingClientRect();

    focusOverlayWrapper.classList.add("visible");

    const distanceFromTop = targetElementDimension.top + window.scrollY;
    const topOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--top"
    );

    if (topOverlayDOM) {
        topOverlayDOM.style.top = "0";
        topOverlayDOM.style.left = "0";
        topOverlayDOM.style.width = "100%";
        topOverlayDOM.style.height = `calc(${distanceFromTop}px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
    }

    const bottomOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--bottom"
    );
    if (bottomOverlayDOM) {
        bottomOverlayDOM.style.top = `calc(${
            targetElementDimension.bottom + window.scrollY
        }px + ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        bottomOverlayDOM.style.height = `calc(${
            window.document.body.scrollHeight -
            targetElementDimension.bottom -
            window.scrollY
        }px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        bottomOverlayDOM.style.left = "0";
        bottomOverlayDOM.style.width = "100%";
    }

    const leftOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--left"
    );
    if (leftOverlayDOM) {
        leftOverlayDOM.style.left = "0";
        leftOverlayDOM.style.top = `calc(${distanceFromTop}px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        leftOverlayDOM.style.height = `calc(${
            targetElementDimension.height
        }px + ${2 * LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        leftOverlayDOM.style.width = `calc(${targetElementDimension.left}px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
    }

    const rightOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--right"
    );
    if (rightOverlayDOM) {
        rightOverlayDOM.style.left = `calc(${targetElementDimension.right}px + ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        rightOverlayDOM.style.top = `calc(${distanceFromTop}px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        rightOverlayDOM.style.height = `calc(${
            targetElementDimension.height
        }px + ${2 * LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        rightOverlayDOM.style.width = `calc(${
            window.innerWidth - targetElementDimension.right
        }px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
    }

    const outlineDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--outline"
    );
    if (outlineDOM) {
        outlineDOM.style.top = `${
            targetElementDimension.top + window.scrollY
        }px`;
        outlineDOM.style.height = `${targetElementDimension.height}px`;
        outlineDOM.style.width = `${targetElementDimension.width}px`;
        outlineDOM.style.left = `${targetElementDimension.left}px`;
    }
}

/**
 * Hides the focus overlay and performs necessary cleanup actions when the user clicks outside of the focused element.
 * @param event - The mouse event that triggered the function.
 * @param elements - An object containing references to the focus overlay wrapper, the previously selected editable DOM element, and the visual editor wrapper.
 */
export function hideFocusOverlay(elements: {
    previousSelectedEditableDOM: Element | null;
    visualEditorWrapper: HTMLDivElement | null;
    visualEditorOverlayWrapper: HTMLDivElement | null;
}): void {
    const {
        previousSelectedEditableDOM,
        visualEditorWrapper,
        visualEditorOverlayWrapper,
    } = elements;

    if (visualEditorOverlayWrapper) {
        visualEditorOverlayWrapper.classList.remove("visible");

        if (previousSelectedEditableDOM) {
            if (previousSelectedEditableDOM.hasAttribute("contenteditable")) {
                liveEditorPostMessage?.send(
                    LiveEditorPostMessageEvents.UPDATE_FIELD,
                    {
                        data: previousSelectedEditableDOM.innerHTML,
                        fieldMetadata: extractDetailsFromCslp(
                            previousSelectedEditableDOM.getAttribute(
                                "data-cslp"
                            ) as string
                        ),
                    }
                );
            }

            cleanIndividualFieldResidual({
                overlayWrapper: visualEditorOverlayWrapper,
                previousSelectedEditableDOM: previousSelectedEditableDOM,
                visualEditorWrapper: visualEditorWrapper,
            });
        }
    }
}
