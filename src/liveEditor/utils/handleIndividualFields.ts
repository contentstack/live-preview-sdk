import { VisualEditor } from "..";
import {
    generateReplaceAssetButton,
    removeReplaceAssetButton,
} from "../generators/generateAssetButton";
import {
    generatePseudoEditableElement,
    isEllipsisActive,
} from "../generators/generatePseudoEditableField";
import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import {
    ALLOWED_INLINE_EDITABLE_FIELD,
    LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY,
} from "./constants";
import { FieldSchemaMap } from "./fieldSchemaMap";
import { getExpectedFieldData } from "./getExpectedFieldData";
import { getFieldType } from "./getFieldType";
import { handleFieldInput, handleFieldKeyDown } from "./handleFieldMouseDown";
import { isFieldDisabled } from "./isFieldDisabled";
import liveEditorPostMessage from "./liveEditorPostMessage";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "./multipleElementAddButton";
import { normalizeNonBreakingSpace } from "./normalizeNonBreakingSpace";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

/**
 * It handles all the fields based on their data type and its "multiple" property.
 * @param eventDetails The event details object that contain cslp and field metadata.
 * @param elements The elements object that contain the visual editor wrapper.
 */
export async function handleIndividualFields(
    eventDetails: VisualEditorCslpEventDetails,
    elements: {
        visualEditorContainer: HTMLDivElement;
        resizeObserver: ResizeObserver;
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

    const { isDisabled: disabled } = isFieldDisabled(fieldSchema, eventDetails);

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
            // TODO this internally does a getFieldSchema message again, which is not necessary
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: eventDetails.editableElement,
                visualEditorContainer: visualEditorContainer,
            });
        }

        // * fields could be handled as they are in a single instance
        if (eventDetails.fieldMetadata.multipleFieldMetadata.index > -1) {
            handleSingleField(
                {
                    editableElement,
                    visualEditorContainer,
                    resizeObserver: elements.resizeObserver,
                },
                { expectedFieldData, disabled }
            );
        }
    } else {
        handleSingleField(
            {
                editableElement,
                visualEditorContainer,
                resizeObserver: elements.resizeObserver,
            },
            { expectedFieldData, disabled }
        );
    }

    /**
     * Handles all the fields based on their data type.
     */
    function handleSingleField(
        elements: {
            editableElement: Element;
            visualEditorContainer: HTMLDivElement;
            resizeObserver: ResizeObserver;
        },
        config: { expectedFieldData: string; disabled?: boolean }
    ) {
        const { editableElement, visualEditorContainer } = elements;

        if (config.disabled) {
            return;
        }

        // * title, single single_line, single multi_line, single number
        if (ALLOWED_INLINE_EDITABLE_FIELD.includes(fieldType)) {
            let actualEditableField = editableElement as HTMLElement;

            const textContent =
                editableElement.innerHTML || editableElement.textContent || "";

            // ensure non-breaking space (nbsp) is replaced with space and
            // all whitespace chars are standardized
            const fieldData = normalizeNonBreakingSpace(textContent);
            const expectedData = normalizeNonBreakingSpace(
                config.expectedFieldData
            );
            if (
                fieldData !== expectedData ||
                isEllipsisActive(editableElement as HTMLElement)
            ) {
                // TODO: Testing will be don in the E2E.
                const pseudoEditableField = generatePseudoEditableElement(
                    { editableElement: editableElement as HTMLElement },
                    { textContent: config.expectedFieldData }
                );

                (editableElement as HTMLElement).style.visibility = "hidden";

                // set field type attribute to the pseudo editable field
                // ensures proper keydown handling similar to the actual editable field
                pseudoEditableField.setAttribute(
                    LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY,
                    fieldType
                );
                visualEditorContainer.appendChild(pseudoEditableField);
                actualEditableField = pseudoEditableField;

                // we will unobserve this in hideOverlay
                elements.resizeObserver.observe(pseudoEditableField);
            }

            actualEditableField.setAttribute("contenteditable", "true");
            actualEditableField.addEventListener("input", handleFieldInput);
            actualEditableField.addEventListener("keydown", handleFieldKeyDown);
            // focus on the contenteditable element to start accepting input
            actualEditableField.focus();

            return;
        }
    }

    liveEditorPostMessage?.send(LiveEditorPostMessageEvents.OPEN_QUICK_FORM, {
        fieldMetadata: eventDetails.fieldMetadata,
        cslpData: eventDetails.cslpData,
    });
}

export function cleanIndividualFieldResidual(elements: {
    overlayWrapper: HTMLDivElement;
    visualEditorContainer: HTMLDivElement | null;
    focusedToolbar: HTMLDivElement | null;
    resizeObserver: ResizeObserver;
}): void {
    const { overlayWrapper, visualEditorContainer, focusedToolbar } = elements;

    removeAddInstanceButtons(
        {
            eventTarget: null,
            visualEditorContainer: visualEditorContainer,
            overlayWrapper: overlayWrapper,
        },
        true
    );

    const previousSelectedEditableDOM =
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM;
    if (previousSelectedEditableDOM) {
        previousSelectedEditableDOM.removeAttribute(
            LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
        );
        previousSelectedEditableDOM.removeAttribute("contenteditable");
        previousSelectedEditableDOM.removeEventListener(
            "input",
            handleFieldInput
        );
        previousSelectedEditableDOM.removeEventListener(
            "keydown",
            handleFieldKeyDown
        );

        elements.resizeObserver.unobserve(previousSelectedEditableDOM);
    }

    const pseudoEditableElement = visualEditorContainer?.querySelector(
        ".visual-editor__pseudo-editable-element"
    );
    if (pseudoEditableElement) {
        elements.resizeObserver.unobserve(pseudoEditableElement);
        pseudoEditableElement.remove();
        if (previousSelectedEditableDOM) {
            (previousSelectedEditableDOM as HTMLElement).style.removeProperty(
                "visibility"
            );
        }
    }

    if (focusedToolbar) {
        focusedToolbar.innerHTML = "";
    }
}
