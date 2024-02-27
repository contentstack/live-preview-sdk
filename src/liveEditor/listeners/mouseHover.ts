import { throttle } from "lodash-es";
import { getCsDataOfElement } from "../utils/getCsDataOfElement";
import { handleAddButtonsForMultiple, removeAddInstanceButtons } from "../utils/multipleElementAddButton";
import { generateCustomCursor } from "../generators/generateCustomCursor";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import { getFieldType } from "../utils/getFieldType";

import EventListenerHandlerParams from "./params";
import VisualEditorGlobalUtils from "../globals";

function resetCustomCursor(customCursor: HTMLDivElement | null) : void {
    if (customCursor) {
        generateCustomCursor({
            fieldType: "empty",
            customCursor: customCursor,
        });
    }
};

function handleCursorPosition(event: MouseEvent, customCursor: HTMLDivElement | null) : void {
    
    if (customCursor) {
        const mouseY = event.clientY;
        const mouseX = event.clientX;

        customCursor.style.left = `${mouseX}px`;
        customCursor.style.top = `${mouseY}px`;
    }
};


export interface HandleMouseHoverParams extends Pick<EventListenerHandlerParams, "event" | "overlayWrapper" | "visualEditorContainer"> {
    customCursor: HTMLDivElement | null,
}


async function handleMouseHover(params: HandleMouseHoverParams) {
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
        if (VisualEditorGlobalUtils.previousHoveredTargetDOM !== editableElement) {
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
    
        if (VisualEditorGlobalUtils.previousHoveredTargetDOM === editableElement) {
            return;
        }
    
        const fieldSchema = await FieldSchemaMap.getFieldSchema(
            content_type_uid,
            fieldPath
        );
    
        if (
            fieldSchema.data_type === "block" ||
            fieldSchema.multiple ||
            (fieldSchema.data_type === "reference" &&
                // @ts-ignore
                fieldSchema.field_metadata.ref_multiple)
        ) {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: editableElement,
                visualEditorContainer: params.visualEditorContainer,
            });
        } else {
            removeAddInstanceButtons({
                eventTarget: params.event.target,
                visualEditorContainer: params.visualEditorContainer,
                overlayWrapper: params.overlayWrapper,
            });
        }
        VisualEditorGlobalUtils.previousHoveredTargetDOM = editableElement;
    }, 10)(params);
} 

export default handleMouseHover;