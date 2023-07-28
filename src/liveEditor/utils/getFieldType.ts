// @ts-nocheck
import { ISchemaFieldMap } from "./types/index.types";

export function getFieldType(fieldSchema: ISchemaFieldMap): string {
    if (
        fieldSchema.data_type === "text" &&
        fieldSchema?.field_metadata?.multiline
    ) {
        return "multiline";
    }
    if (
        fieldSchema.data_type === "text" &&
        fieldSchema?.field_metadata?.allow_rich_text
    ) {
        return "html_rte";
    }
    if (
        fieldSchema.data_type === "text" &&
        fieldSchema?.field_metadata?.markdown
    ) {
        return "markdown_rte";
    }
    if (fieldSchema.enum) {
        return "select";
    }
    if (fieldSchema.data_type === "text") {
        return "singleline";
    }
}
