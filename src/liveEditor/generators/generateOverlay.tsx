import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import { cleanIndividualFieldResidual } from "../utils/handleIndividualFields";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

import { VisualEditor } from "..";
import EventListenerHandlerParams from "../listeners/types";
import { LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX } from "../utils/constants";

/**
 * Adds a focus overlay to the target element.
 * @param targetElement - The element to add the focus overlay to.
 * @param focusOverlayWrapper - The HTMLDivElement that contains the focus overlay.
 * @returns void
 */
export function addFocusOverlay(
    targetElement: Element,
    focusOverlayWrapper: HTMLDivElement,
    disabled?: boolean
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
        topOverlayDOM.style.height = `${distanceFromTop - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`;
    }

    const bottomOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--bottom"
    );
    if (bottomOverlayDOM) {
        bottomOverlayDOM.style.top = `${
            targetElementDimension.bottom + window.scrollY + LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX
        }px`;
        bottomOverlayDOM.style.height = `${
            window.document.body.scrollHeight -
            targetElementDimension.bottom -
            window.scrollY -
            LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX
        }px`;
        bottomOverlayDOM.style.left = "0";
        bottomOverlayDOM.style.width = "100%";
    }

    const leftOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--left"
    );
    if (leftOverlayDOM) {
        leftOverlayDOM.style.left = "0";
        leftOverlayDOM.style.top = `${distanceFromTop - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`;
        leftOverlayDOM.style.height = `${targetElementDimension.height + 2*LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`;
        leftOverlayDOM.style.width = `${targetElementDimension.left - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`;
    }

    const rightOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--right"
    );
    if (rightOverlayDOM) {
        rightOverlayDOM.style.left = `${targetElementDimension.right + LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`;
        rightOverlayDOM.style.top = `${distanceFromTop - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`;
        rightOverlayDOM.style.height = `${targetElementDimension.height + 2*LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`;
        rightOverlayDOM.style.width = `${
            document.documentElement.clientWidth - targetElementDimension.right - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX
        }px`;
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
        outlineDOM.style.outlineColor = disabled ? "#909090" : "#715cdd";
    }
}

/**
 * Hides the focus overlay and performs necessary cleanup actions when the user clicks outside of the focused element.
 * @param event - The mouse event that triggered the function.
 * @param elements - An object containing references to the focus overlay wrapper, the previously selected editable DOM element, and the visual editor wrapper.
 */
export function hideFocusOverlay(elements: HideOverlayParams): void {
    const {
        visualEditorContainer,
        visualEditorOverlayWrapper,
        focusedToolbar,
        resizeObserver,
    } = elements;

    if (visualEditorOverlayWrapper) {
        visualEditorOverlayWrapper.classList.remove("visible");

        if (
            VisualEditor.VisualEditorGlobalState.value
                .previousSelectedEditableDOM
        ) {
            const pseudoEditableElement = visualEditorContainer?.querySelector(
                "div.visual-editor__pseudo-editable-element"
            );

            if (
                VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM.hasAttribute(
                    "contenteditable"
                ) ||
                pseudoEditableElement
            ) {
                const actualEditedElement =
                    pseudoEditableElement ||
                    (VisualEditor.VisualEditorGlobalState.value
                        .previousSelectedEditableDOM as HTMLElement);

                liveEditorPostMessage?.send(
                    LiveEditorPostMessageEvents.UPDATE_FIELD,
                    {
                        data:
                            "innerText" in actualEditedElement
                                ? actualEditedElement.innerText
                                : actualEditedElement.textContent,
                        fieldMetadata: extractDetailsFromCslp(
                            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM.getAttribute(
                                "data-cslp"
                            ) as string
                        ),
                    }
                );
            }

            cleanIndividualFieldResidual({
                overlayWrapper: visualEditorOverlayWrapper,
                visualEditorContainer: visualEditorContainer,
                focusedToolbar: focusedToolbar,
                resizeObserver: resizeObserver,
            });
        }
    }
}

interface HideOverlayParams
    extends Pick<
        EventListenerHandlerParams,
        "visualEditorContainer" | "focusedToolbar" | "resizeObserver"
    > {
    visualEditorOverlayWrapper: HTMLDivElement | null;
}

export function hideOverlay(params: HideOverlayParams): void {
    hideFocusOverlay({
        visualEditorContainer: params.visualEditorContainer,
        visualEditorOverlayWrapper: params.visualEditorOverlayWrapper,
        focusedToolbar: params.focusedToolbar,
        resizeObserver: params.resizeObserver,
    });

    if (!VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM)
        return;
    params.resizeObserver.unobserve(
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM
    );
    VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
        null;
}
