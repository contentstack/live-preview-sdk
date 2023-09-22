import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";
import {
    generateReplaceAssetButton,
    removeReplaceAssetButton,
} from "./assetButton";
import { LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY } from "./constants";
import { getFieldType } from "./getFieldType";
import { handleFieldInput, handleFieldKeyDown } from "./handleFieldMouseDown";
import liveEditorPostMessage from "./liveEditorPostMessage";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "./multipleElementAddButton";
import { FieldDataType } from "./types/index.types";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

/**
 * It handles all the fields based on their data type and its "multiple" property.
 * @param eventDetails The event details object that contain cslp and field metadata.
 * @param elements The elements object that contain the visual editor wrapper.
 */
export function handleIndividualFields(
    eventDetails: VisualEditorCslpEventDetails,
    elements: {
        visualEditorWrapper: HTMLDivElement;
        lastEditedField: Element | null;
    }
): void {
    const { fieldSchema, editableElement } = eventDetails;
    const { visualEditorWrapper, lastEditedField } = elements;
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
                visualEditorWrapper: visualEditorWrapper,
            });
        }

        // * fields could be handled as they are in a single instance
        if (eventDetails.fieldMetadata.multipleFieldMetadata.index > -1) {
            handleSingleField();
        }
        return;
    } else {
        handleSingleField();
    }

    /**
     * Handles all the fields based on their data type.
     */
    function handleSingleField() {
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
            editableElement.setAttribute("contenteditable", "true");
            editableElement.addEventListener("input", handleFieldInput);
            editableElement.addEventListener("keydown", handleFieldKeyDown);

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

            visualEditorWrapper?.appendChild(replaceButton);
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
    previousSelectedEditableDOM: Element;
    visualEditorWrapper: HTMLDivElement | null;
}): void {
    const { overlayWrapper, previousSelectedEditableDOM, visualEditorWrapper } =
        elements;

    removeAddInstanceButtons({
        eventTarget: null,
        visualEditorWrapper: visualEditorWrapper,
        overlayWrapper: overlayWrapper,
    });

    removeReplaceAssetButton(visualEditorWrapper);

    previousSelectedEditableDOM.removeAttribute(
        LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
    );
    previousSelectedEditableDOM.removeAttribute("contenteditable");
    previousSelectedEditableDOM.removeEventListener("input", handleFieldInput);
    previousSelectedEditableDOM.removeEventListener(
        "keydown",
        handleFieldKeyDown
    );
}
