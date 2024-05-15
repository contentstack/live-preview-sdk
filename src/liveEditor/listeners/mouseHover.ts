import { throttle } from "lodash-es";
import { getCsDataOfElement } from "../utils/getCsDataOfElement";
import {
    removeAddInstanceButtons,
} from "../utils/multipleElementAddButton";
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
    if(!params.event || !params.event.target) return;

    addHoverOutline(params.event.target);
}

async function handleMouseHover(params: HandleMouseHoverParams): Promise<void> {
    throttle(async (params) => {
        const eventDetails = getCsDataOfElement(params.event);
        if (!eventDetails) {
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

        const { content_type_uid, fieldPath } = fieldMetadata;

        if (params.customCursor) {
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

            params.customCursor.classList.add("visible");
            handleCursorPosition(params.event, params.customCursor);
        }

        if(!editableElement.classList.contains('visual-editor__empty-block-parent') 
            && !editableElement.classList.contains('visual-editor__empty-block')){
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
