import { throttle } from "lodash-es";
import { getCsDataOfElement } from "../utils/getCsDataOfElement";
import { removeAddInstanceButtons } from "../utils/multipleElementAddButton";
import { generateCustomCursor } from "../generators/generateCustomCursor";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import { getFieldType } from "../utils/getFieldType";

import EventListenerHandlerParams from "./types";
import { VisualEditor } from "..";
import { addHoverOutline } from "../generators/generateHoverOutline";

export interface HandleMouseHoverParams
    extends Pick<
        EventListenerHandlerParams,
        "event" | "overlayWrapper" | "visualEditorContainer"
    > {
    customCursor: HTMLDivElement | null;
}

function resetCustomCursor(customCursor: HTMLDivElement | null): void {
    if (customCursor) {
        generateCustomCursor({
            fieldType: "empty",
            customCursor: customCursor,
        });
    }
}

function handleCursorPosition(
    event: MouseEvent,
    customCursor: HTMLDivElement | null
): void {
    if (customCursor) {
        const mouseY = event.clientY;
        const mouseX = event.clientX;

        customCursor.style.left = `${mouseX}px`;
        customCursor.style.top = `${mouseY}px`;
    }
}

function addOutline(params: any): void {
    if (!params.event || !params.event.target) return;

    addHoverOutline(params.event.target);
}

function hideDefaultCursor(): void {
    if (
        document?.body &&
        !document.body.classList.contains(
            "visual-editor__default-cursor--disabled"
        )
    )
        document.body.classList.add("visual-editor__default-cursor--disabled");
}

function showDefaultCursor(): void {
    if (
        document?.body &&
        document.body.classList.contains(
            "visual-editor__default-cursor--disabled"
        )
    )
        document.body.classList.remove(
            "visual-editor__default-cursor--disabled"
        );
}

function hideCustomCursor(customCursor: HTMLDivElement | null): void {
    showDefaultCursor();
    customCursor?.classList.remove("visible");
}

function showCustomCursor(customCursor: HTMLDivElement | null): void {
    hideDefaultCursor();
    customCursor?.classList.add("visible");
}

function isOverlay(target: HTMLElement): boolean {
    return target.classList.contains("visual-editor__overlay");
}

function isContentEditable(target: HTMLElement): boolean {
    if (target.hasAttribute("contenteditable"))
        return target.getAttribute("contenteditable") === "true";
    return false;
}

async function handleMouseHover(params: HandleMouseHoverParams): Promise<void> {
    throttle(async (params) => {
        const eventDetails = getCsDataOfElement(params.event);
        if (!eventDetails) {
            if (
                isOverlay(params.event.target) ||
                isContentEditable(params.event.target)
            ) {
                hideCustomCursor(params.customCursor);
                return;
            }
            resetCustomCursor(params.customCursor);
            removeAddInstanceButtons({
                eventTarget: params.event.target,
                visualEditorContainer: params.visualEditorContainer,
                overlayWrapper: params.overlayWrapper,
            });
            handleCursorPosition(params.event, params.customCursor);
            return;
        }

        const { editableElement, fieldMetadata } = eventDetails;
        const { content_type_uid, fieldPath } = fieldMetadata;

        if (
            VisualEditor.VisualEditorGlobalState.value
                .previousSelectedEditableDOM &&
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM.isSameNode(
                editableElement
            )
        ) {
            hideCustomCursor(params.customCursor);
            return;
        }

        if (params.customCursor) {
            if (
                VisualEditor.VisualEditorGlobalState.value
                    .previousHoveredTargetDOM !== editableElement
            ) {
                resetCustomCursor(params.customCursor);
                removeAddInstanceButtons({
                    eventTarget: params.event.target,
                    visualEditorContainer: params.visualEditorContainer,
                    overlayWrapper: params.overlayWrapper,
                });
            }

            if (!FieldSchemaMap.hasFieldSchema(content_type_uid, fieldPath)) {
                generateCustomCursor({
                    fieldType: "loading",
                    customCursor: params.customCursor,
                });
            }

            /**
             * We called it seperately inside the code block to ensure that
             * the code will not wait for the promise to resolve.
             * If we get a cache miss, we will send a message to the iframe
             * without blocking the code.
             */
            FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath).then(
                (fieldSchema) => {
                    if (!params.customCursor) return;
                    const { isDisabled: fieldDisabled } = isFieldDisabled(
                        fieldSchema,
                        eventDetails
                    );
                    const fieldType = getFieldType(fieldSchema);
                    generateCustomCursor({
                        fieldType,
                        customCursor: params.customCursor,
                        fieldDisabled,
                    });
                }
            );

            handleCursorPosition(params.event, params.customCursor);
            showCustomCursor(params.customCursor);
        }

        if (
            !editableElement.classList.contains(
                "visual-editor__empty-block-parent"
            ) &&
            !editableElement.classList.contains("visual-editor__empty-block")
        ) {
            addOutline(params);
        }

        if (
            VisualEditor.VisualEditorGlobalState.value
                .previousHoveredTargetDOM === editableElement
        ) {
            return;
        }

        VisualEditor.VisualEditorGlobalState.value.previousHoveredTargetDOM =
            editableElement;
    }, 10)(params);
}

export default handleMouseHover;
