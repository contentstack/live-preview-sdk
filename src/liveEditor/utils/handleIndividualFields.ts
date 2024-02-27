import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import {
    generateReplaceAssetButton,
    removeReplaceAssetButton,
} from "../generators/generateAssetButton";
import { LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY } from "./constants";
import { FieldSchemaMap } from "./fieldSchemaMap";
import { getExpectedFieldData, isEllipsisActive } from "../generators/generatePseudoEditableField";
import { getFieldType } from "./getFieldType";
import { handleFieldInput, handleFieldKeyDown } from "./handleFieldMouseDown";
import liveEditorPostMessage from "./liveEditorPostMessage";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "./multipleElementAddButton";
import { FieldDataType } from "./types/index.types";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";
import { generatePseudoEditableElement } from "../generators/generatePseudoEditableField";
import VisualEditorGlobalUtils from "../globals";

/**
 * It handles all the fields based on their data type and its "multiple" property.
 * @param eventDetails The event details object that contain cslp and field metadata.
 * @param elements The elements object that contain the visual editor wrapper.
 */
export async function handleIndividualFields(
    eventDetails: VisualEditorCslpEventDetails,
    elements: {
        visualEditorContainer: HTMLDivElement;
        lastEditedField: Element | null;
    }
): Promise<void> {
    const { fieldMetadata, editableElement } = eventDetails;
    const { visualEditorContainer, lastEditedField } = elements;
    const { content_type_uid, fieldPath } = fieldMetadata;

    const [fieldSchema, expectedFieldData] = await Promise.all([
        FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath),
        getExpectedFieldData(fieldMetadata),
    ]);

    const fieldType = getFieldType(fieldSchema);

    editableElement.setAttribute(
        LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY,
        fieldType
    );

    if (
        // @ts-ignore
        fieldSchema?.multiple ||
        (fieldSchema.data_type === "reference" &&
            // @ts-ignore
            fieldSchema.field_metadata.ref_multiple)
    ) {
        if (lastEditedField !== editableElement) {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: eventDetails.editableElement,
                visualEditorContainer: visualEditorContainer,
            });
        }

        // * fields could be handled as they are in a single instance
        if (eventDetails.fieldMetadata.multipleFieldMetadata.index > -1) {
            handleSingleField(
                { editableElement, visualEditorContainer },
                { expectedFieldData }
            );
        }
        return;
    } else {
        handleSingleField(
            { editableElement, visualEditorContainer },
            { expectedFieldData }
        );
    }

    /**
     * Handles all the fields based on their data type.
     */
    function handleSingleField(
        elements: {
            editableElement: Element;
            visualEditorContainer: HTMLDivElement;
        },
        config: { expectedFieldData: string }
    ) {
        const { editableElement, visualEditorContainer } = elements;
        /**
         * The field that can be directly modified using contenteditable=true.
         * This includes all text fields like title and numbers.
         */
        const ALLOWED_INLINE_EDITABLE_FIELD: FieldDataType[] = [
            FieldDataType.SINGLELINE,
            FieldDataType.MULTILINE,
            FieldDataType.NUMBER,
        ];

        // * title, single single_line, single multi_line, single number
        if (ALLOWED_INLINE_EDITABLE_FIELD.includes(fieldType)) {
            let actualEditableField = editableElement;
            
            const actualFieldData =
            editableElement.innerHTML || editableElement.textContent || "";
            if (
                actualFieldData !== config.expectedFieldData ||
                isEllipsisActive(editableElement as HTMLElement)
            ) {
                // TODO: Testing will be don in the E2E.
                const pseudoEditableField = generatePseudoEditableElement(
                    { editableElement: editableElement as HTMLElement },
                    { textContent: config.expectedFieldData }
                );

                (editableElement as HTMLElement).style.visibility = "hidden";

                visualEditorContainer.appendChild(pseudoEditableField);
                actualEditableField = pseudoEditableField;
            }

            actualEditableField.setAttribute("contenteditable", "true");
            actualEditableField.addEventListener("input", handleFieldInput);
            actualEditableField.addEventListener("keydown", handleFieldKeyDown);

            return;
        }

        if (fieldSchema.data_type === "file") {
            const replaceButton = generateReplaceAssetButton(
                editableElement,
                () => {
                    liveEditorPostMessage?.send(
                        LiveEditorPostMessageEvents.OPEN_ASSET_MODAL,
                        {
                            fieldMetadata: eventDetails.fieldMetadata,
                        }
                    );
                }
            );
            
            return;
        }

        liveEditorPostMessage?.send(
            LiveEditorPostMessageEvents.OPEN_QUICK_FORM,
            {
                fieldMetadata: eventDetails.fieldMetadata,
                cslpData: eventDetails.cslpData,
            }
        );
    }
}

export function cleanIndividualFieldResidual(elements: {
    overlayWrapper: HTMLDivElement;
    visualEditorContainer: HTMLDivElement | null;
    focusedToolbar: HTMLDivElement | null;
}): void {
    
    const {
        overlayWrapper,
        visualEditorContainer,
        focusedToolbar,
    } = elements;

    removeAddInstanceButtons({
        eventTarget: null,
        visualEditorContainer: visualEditorContainer,
        overlayWrapper: overlayWrapper,
    });

    removeReplaceAssetButton(visualEditorContainer);

    const pseudoEditableElement = visualEditorContainer?.querySelector(
        ".visual-editor__pseudo-editable-element"
    );

    VisualEditorGlobalUtils.previousSelectedEditableDOM!.removeAttribute(
        LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
    );
    VisualEditorGlobalUtils.previousSelectedEditableDOM!.removeAttribute("contenteditable");
    VisualEditorGlobalUtils.previousSelectedEditableDOM!.removeEventListener("input", handleFieldInput);
    VisualEditorGlobalUtils.previousSelectedEditableDOM!.removeEventListener(
        "keydown",
        handleFieldKeyDown
    );

    if (pseudoEditableElement) {
        pseudoEditableElement.remove();
        console.log('[IN SDK] : DEBUG CLEAR INDIVIDUAL FIELD : ', pseudoEditableElement, VisualEditorGlobalUtils);
        
        (VisualEditorGlobalUtils.previousSelectedEditableDOM! as HTMLElement).style.removeProperty(
            "visibility"
        );
    }

    if (focusedToolbar) {
        focusedToolbar.innerHTML = "";
    }
}
