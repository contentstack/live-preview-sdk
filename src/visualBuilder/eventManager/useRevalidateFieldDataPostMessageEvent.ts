import { VisualBuilder } from "..";
import { extractDetailsFromCslp } from "../../cslp";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { getFieldData } from "../utils/getFieldData";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

/**
 * Revalidates field data and schema after variant linking operations.
 * First tries to revalidate specific hovered field, then falls back to clearing all schemas,
 * and finally refreshes the iframe if all else fails.
 */
async function handleRevalidateFieldData(): Promise<void> {
    try {
        // Get the currently hovered or focused field
        const hoveredElement =
            VisualBuilder.VisualBuilderGlobalState.value
                .previousHoveredTargetDOM;
        const focusedElement =
            VisualBuilder.VisualBuilderGlobalState.value
                .previousSelectedEditableDOM;

        // Prefer hovered element, fallback to focused element
        const targetElement = hoveredElement || focusedElement;

        if (targetElement) {
            const cslp = targetElement.getAttribute("data-cslp");
            if (cslp) {
                const fieldMetadata = extractDetailsFromCslp(cslp);

                // Try to revalidate specific field schema and data
                try {
                    // Clear the entire content type schema from cache to force fresh fetch
                    FieldSchemaMap.clearContentTypeSchema(
                        fieldMetadata.content_type_uid
                    );

                    // Fetch fresh field schema and data
                    const [fieldSchema, fieldData] = await Promise.all([
                        FieldSchemaMap.getFieldSchema(
                            fieldMetadata.content_type_uid,
                            fieldMetadata.fieldPath
                        ),
                        getFieldData(
                            {
                                content_type_uid:
                                    fieldMetadata.content_type_uid,
                                entry_uid: fieldMetadata.entry_uid,
                                locale: fieldMetadata.locale,
                            },
                            fieldMetadata.fieldPathWithIndex
                        ),
                    ]);

                    if (fieldSchema && fieldData) {
                        return;
                    }
                } catch (fieldError) {
                    console.warn(
                        "Failed to revalidate content type:",
                        fieldMetadata.content_type_uid,
                        fieldError
                    );
                }
            }
        }

        // Fallback 1: Clear all field schema cache
        try {
            FieldSchemaMap.clear();
            return;
        } catch (clearError) {
            console.error("Failed to clear field schema cache:", clearError);
        }

        // Fallback 2: Refresh the entire iframe
        window.location.reload();
    } catch (error) {
        console.error("Error handling revalidate field data:", error);
        // Final fallback - refresh the page
        window.location.reload();
    }
}

export function useRevalidateFieldDataPostMessageEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.REVALIDATE_FIELD_DATA,
        handleRevalidateFieldData
    );
}
