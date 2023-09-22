import { extractDetailsFromCslp } from "../../utils/cslpdata";
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
    const topOverlayDOM = focusOverlayWrapper.querySelector(
        ".visual-editor__overlay--top"
    ) as HTMLDivElement | null;

    if (topOverlayDOM) {
        topOverlayDOM.style.top = "0";
        topOverlayDOM.style.left = "0";
        topOverlayDOM.style.width = "100%";
        topOverlayDOM.style.height = `${distanceFromTop}px`;
    }

    const bottomOverlayDOM = focusOverlayWrapper.querySelector(
        ".visual-editor__overlay--bottom"
    ) as HTMLDivElement | null;
    if (bottomOverlayDOM) {
        bottomOverlayDOM.style.top = `${
            targetElementDimension.bottom + window.scrollY
        }px`;
        bottomOverlayDOM.style.height = `${
            window.document.body.scrollHeight -
            targetElementDimension.bottom -
            window.scrollY
        }px`;
        bottomOverlayDOM.style.left = "0";
        bottomOverlayDOM.style.width = "100%";
    }

    const leftOverlayDOM = focusOverlayWrapper.querySelector(
        ".visual-editor__overlay--left"
    ) as HTMLDivElement | null;
    if (leftOverlayDOM) {
        leftOverlayDOM.style.left = "0";
        leftOverlayDOM.style.top = `${distanceFromTop}px`;
        leftOverlayDOM.style.height = `${targetElementDimension.height}px`;
        leftOverlayDOM.style.width = `${targetElementDimension.left}px`;
    }

    const rightOverlayDOM = focusOverlayWrapper.querySelector(
        ".visual-editor__overlay--right"
    ) as HTMLDivElement | null;
    if (rightOverlayDOM) {
        rightOverlayDOM.style.left = `${targetElementDimension.right}px`;
        rightOverlayDOM.style.top = `${distanceFromTop}px`;
        rightOverlayDOM.style.height = `${targetElementDimension.height}px`;
        rightOverlayDOM.style.width = `${
            window.innerWidth - targetElementDimension.right
        }px`;
    }

    const outlineDOM = focusOverlayWrapper.querySelector(
        ".visual-editor__overlay--outline"
    ) as HTMLDivElement | null;
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
export function hideFocusOverlay(
    event: MouseEvent,
    elements: {
        previousSelectedEditableDOM: Element | null;
        visualEditorWrapper: HTMLDivElement | null;
    }
): void {
    const targetElement = event.target as Element;
    const { previousSelectedEditableDOM, visualEditorWrapper } = elements;

    if (targetElement?.classList.contains("visual-editor__overlay")) {
        const focusOverlayWrapper = targetElement.closest(
            ".visual-editor__overlay__wrapper"
        ) as HTMLDivElement;

        focusOverlayWrapper.classList.remove("visible");

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
                overlayWrapper: focusOverlayWrapper,
                previousSelectedEditableDOM: previousSelectedEditableDOM,
                visualEditorWrapper: visualEditorWrapper,
            });
        }
    }
}
