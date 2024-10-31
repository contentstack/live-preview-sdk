import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import { cleanIndividualFieldResidual } from "../utils/handleIndividualFields";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

import { VisualBuilder } from "..";
import EventListenerHandlerParams from "../listeners/types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { FieldDataType } from "../utils/types/index.types";
import { getFieldType } from "../utils/getFieldType";
import { CslpData } from "../../cslp/types/cslp.types";
import { getMultilinePlaintext } from "../utils/getMultilinePlaintext";
import { showAllHiddenHighlightedCommentIcons } from "./generateHighlightedComment";

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
    if (
        targetElementDimension.width === 0 ||
        targetElementDimension.height === 0
    )
        return;
    focusOverlayWrapper.classList.add("visible");

    const distanceFromTop = targetElementDimension.top + window.scrollY;
    const topOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--top"
    );

    if (topOverlayDOM) {
        topOverlayDOM.style.top = "0";
        topOverlayDOM.style.left = "0";
        topOverlayDOM.style.width = "100%";
        topOverlayDOM.style.height = `calc(${distanceFromTop}px)`;
    }

    const bottomOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--bottom"
    );
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

    const leftOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--left"
    );
    if (leftOverlayDOM) {
        leftOverlayDOM.style.left = "0";
        leftOverlayDOM.style.top = `${distanceFromTop}px`;
        leftOverlayDOM.style.height = `${targetElementDimension.height}px`;
        leftOverlayDOM.style.width = `${targetElementDimension.left}px`;
    }

    const rightOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--right"
    );
    if (rightOverlayDOM) {
        rightOverlayDOM.style.left = `${targetElementDimension.right}px`;
        rightOverlayDOM.style.top = `${distanceFromTop}px`;
        rightOverlayDOM.style.height = `${targetElementDimension.height}px`;
        rightOverlayDOM.style.width = `${
            document.documentElement.clientWidth - targetElementDimension.right
        }px`;
    }

    const outlineDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--outline"
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
 * @param elements - An object containing references to the focus overlay wrapper, the previously selected editable DOM element, and the visual builder wrapper.
 */
export function hideFocusOverlay(elements: HideOverlayParams): void {
    const {
        visualBuilderContainer,
        visualBuilderOverlayWrapper,
        focusedToolbar,
        resizeObserver,
        noTrigger,
    } = elements;

    if (visualBuilderOverlayWrapper) {
        visualBuilderOverlayWrapper.classList.remove("visible");

        // Cleanup overlay styles: Top, Right, Bottom, Left & Outline
        visualBuilderOverlayWrapper.childNodes.forEach((childNode) => {
            if (childNode instanceof Element) {
                childNode.removeAttribute("style");
            }
        });

        if (!noTrigger) {
            sendFieldEvent({
                visualBuilderContainer,
                eventType: VisualBuilderPostMessageEvents.UPDATE_FIELD,
            });
        } else {
            const { previousSelectedEditableDOM, focusFieldValue } =
                VisualBuilder.VisualBuilderGlobalState.value || {};
            if (
                previousSelectedEditableDOM &&
                "innerText" in previousSelectedEditableDOM &&
                focusFieldValue != null
            ) {
                previousSelectedEditableDOM.innerText = focusFieldValue;
            }
        }
        VisualBuilder.VisualBuilderGlobalState.value.focusFieldValue = null;
        cleanIndividualFieldResidual({
            overlayWrapper: visualBuilderOverlayWrapper,
            visualBuilderContainer: visualBuilderContainer,
            focusedToolbar: focusedToolbar,
            resizeObserver: resizeObserver,
        });
    }
}
interface ISendFieldEventParams {
    visualBuilderContainer: HTMLElement | null;
    eventType:
        | VisualBuilderPostMessageEvents.UPDATE_FIELD
        | VisualBuilderPostMessageEvents.SYNC_FIELD;
}
export function sendFieldEvent(options: ISendFieldEventParams): void {
    const { visualBuilderContainer, eventType } = options;
    const previousSelectedEditableDOM =
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM;
    const pseudoEditableElement = visualBuilderContainer?.querySelector(
        "div.visual-builder__pseudo-editable-element"
    );
    if (
        previousSelectedEditableDOM &&
        (previousSelectedEditableDOM.hasAttribute("contenteditable") ||
            pseudoEditableElement)
    ) {
        const actualEditedElement =
            pseudoEditableElement ||
            (previousSelectedEditableDOM as HTMLElement);

        let data =
            "innerText" in actualEditedElement
                ? actualEditedElement.innerText
                : actualEditedElement.textContent;

        const fieldMetadata = extractDetailsFromCslp(
            previousSelectedEditableDOM.getAttribute("data-cslp") as string
        );

        FieldSchemaMap.getFieldSchema(
            fieldMetadata.content_type_uid,
            fieldMetadata.fieldPath
        )
            .then((fieldSchema) => {
                if (
                    fieldSchema &&
                    eventType === VisualBuilderPostMessageEvents.UPDATE_FIELD
                ) {
                    const fieldType = getFieldType(fieldSchema);
                    if (fieldType && fieldType === FieldDataType.MULTILINE) {
                        data = getMultilinePlaintext(actualEditedElement);
                        (actualEditedElement as HTMLElement).innerText =
                            data as string;
                    }
                }
            })
            .finally(() => {
                visualBuilderPostMessage?.send(eventType, {
                    data,
                    fieldMetadata,
                });
            });
    }
}
interface HideOverlayParams
    extends Pick<
        EventListenerHandlerParams,
        "visualBuilderContainer" | "focusedToolbar" | "resizeObserver"
    > {
    visualBuilderOverlayWrapper: HTMLDivElement | null;
    noTrigger?: boolean;
}

export function hideOverlay(params: HideOverlayParams): void {
    hideFocusOverlay({
        visualBuilderContainer: params.visualBuilderContainer,
        visualBuilderOverlayWrapper: params.visualBuilderOverlayWrapper,
        focusedToolbar: params.focusedToolbar,
        resizeObserver: params.resizeObserver,
        noTrigger: Boolean(params.noTrigger),
    });
    showAllHiddenHighlightedCommentIcons();
    if (
        !VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM
    )
        return;
    params.resizeObserver.unobserve(
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM
    );
    VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
        null;
}
