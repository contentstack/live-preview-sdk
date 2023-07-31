// @ts-nocheck
import { ISchemaFieldMap } from "./types/index.types";

export function getFieldType(fieldSchema: ISchemaFieldMap): string {
    switch (fieldSchema.data_type) {
        case "text": {
            if (fieldSchema?.field_metadata.multiline) {
                return "multiline";
            } else if (fieldSchema?.field_metadata.allow_rich_text) {
                return "html_rte";
            } else if (fieldSchema?.field_metadata.markdown) {
                return "markdown_rte";
            } else if (fieldSchema.enum) {
                return "select";
            } else {
                return "singleline";
            }
        }
        case "json": {
            if (fieldSchema.field_metadata.allow_json_rte) {
                return "json_rte";
            }
            break;
        }

        case "blocks": {
            return "modular_block";
        }
        case "link":
        case "isodate":
        case "boolean":
        case "block":
        case "number":
        case "reference":
        case "group":
        case "experience_container":
        case "file":
        case "global_field": {
            return fieldSchema.data_type;
        }
    }
}
