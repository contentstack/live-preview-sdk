import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";
import { extractDetailsFromCslp } from "../../utils/cslpdata";
import { ISchemaIndividualFieldMap } from "./types/index.types";

/**
 * Returns the CSLP data of the closest ancestor element with a `data-cslp` attribute
 * to the target element of a mouse event.
 * @param event - The mouse event.
 * @param fieldSchemaMap - A map of field schemas.
 * @returns The CSLP data of the closest ancestor element with a `data-cslp` attribute,
 * along with metadata and schema information for the corresponding field.
 */
export function getCsDataOfElement(
    event: MouseEvent,
    fieldSchemaMap: Record<string, ISchemaIndividualFieldMap>
): VisualEditorCslpEventDetails | undefined {
    const targetElement = event.target as HTMLElement;
    if (!targetElement) {
        return;
    }
    const editableElement = targetElement.closest("[data-cslp]");

    if (!editableElement) {
        return;
    }
    const cslpData = editableElement.getAttribute("data-cslp");
    if (!cslpData) {
        return;
    }
    const fieldMetadata = extractDetailsFromCslp(cslpData);

    const fieldSchema =
        fieldSchemaMap[fieldMetadata.content_type_uid][fieldMetadata.fieldPath];

    return {
        editableElement: editableElement,
        cslpData,
        fieldMetadata,
        fieldSchema,
    };
}
