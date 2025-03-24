import { ALLOWED_INLINE_EDITABLE_FIELD } from "./constants";
import { isFieldMultiple } from "./isFieldMultiple";
import { FieldDataType, VisualBuilderEditContext } from "./types/index.types";
import { enableInlineEditing } from "./enableInlineEditing";

/**
 * Handles inline editing for supported fields.
 */
export function handleInlineEditableField({
    fieldType,
    fieldSchema,
    fieldMetadata,
    expectedFieldData,
    editableElement,
    elements,
}: {
    fieldType: FieldDataType;
    fieldSchema: any;
    fieldMetadata: any;
    expectedFieldData: any;
    editableElement: HTMLElement;
    elements: VisualBuilderEditContext;
}) {
    if (!ALLOWED_INLINE_EDITABLE_FIELD.includes(fieldType)) return;

    // Instances of ALLOWED_INLINE_EDITABLE_FIELD will always have index at last
    const index = Number(
        fieldMetadata.instance.fieldPathWithIndex.split(".").at(-1)
    );
    const isInstance = Number.isFinite(index);

    // CASE 1: Handle inline editing for multiple field
    if (isFieldMultiple(fieldSchema)) {
        let expectedFieldInstanceData = null;
        if (Array.isArray(expectedFieldData)) {
            // CASE: Selected element is the multiple field itself.
            // Inline Editing not allowed on field, only allowed on instance.
            // (We recieve unreliable `multipleFieldMetadata` in this case)
            if (!isInstance) {
                return;
            }

            // CASE: Value does not exist for the provided instance's index
            if (index >= expectedFieldData.length) {
                // TODO: What should be the behavior here?
            } else {
                expectedFieldInstanceData = expectedFieldData.at(index);
            }
        }
        // CASE: ContentType's Field changed from single to multiple, while Entry's Field still single.
        else {
            expectedFieldInstanceData = expectedFieldData;
        }

        enableInlineEditing({
            fieldType,
            expectedFieldData: expectedFieldInstanceData,
            editableElement,
            elements,
        });
    }
    // CASE 2: Handle inline editing for a single field
    else {
        let expectedFieldInstanceData = null;
        // CASE: ContentType's Field changed from multiple to single, while Entry's Field still multiple.
        if (isInstance) {
            if (index !== 0) {
                // TODO: Handle this with UX
                // Let user know, CSLP is invalid due to change in Content Type
                return;
            }
            expectedFieldInstanceData = Array.isArray(expectedFieldData)
                ? expectedFieldData.at(0)
                : expectedFieldData;
        }
        enableInlineEditing({
            fieldType,
            expectedFieldData: expectedFieldInstanceData ?? expectedFieldData,
            editableElement,
            elements,
        });
    }
}
