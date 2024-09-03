import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import { cleanIndividualFieldResidual } from "../utils/handleIndividualFields";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

import { VisualEditor } from "..";
import EventListenerHandlerParams from "../listeners/types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { FieldDataType } from "../utils/types/index.types";
import { getFieldType } from "../utils/getFieldType";
import { CslpData } from "../../cslp/types/cslp.types";
import { getMultilinePlaintext } from "../utils/getMultilinePlaintext";

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
                "div.visual-builder__pseudo-editable-element"
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

                let data = "innerText" in actualEditedElement
                                ? actualEditedElement.innerText
                                : actualEditedElement.textContent;

                const fieldMetadata = extractDetailsFromCslp(VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM.getAttribute(
                    "data-cslp"
                ) as string);

                FieldSchemaMap.getFieldSchema(fieldMetadata.content_type_uid, fieldMetadata.fieldPath).then((fieldSchema) => {
                    if(fieldSchema) {
                        const fieldType = getFieldType(fieldSchema);
                        if (fieldType && fieldType === FieldDataType.MULTILINE) {
                            data =  getMultilinePlaintext(actualEditedElement);
                            (actualEditedElement as HTMLElement).innerText = data as string;
                        }
                    }
                }).finally(() => {
                    liveEditorPostMessage?.send(
                        LiveEditorPostMessageEvents.UPDATE_FIELD,
                        {
                            data,
                            fieldMetadata
                        }
                    );
                })
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
