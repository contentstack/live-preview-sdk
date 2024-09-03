// @ts-nocheck
import { ISchemaFieldMap, FieldDataType } from "./types/index.types";

export function getFieldType(fieldSchema: ISchemaFieldMap): FieldDataType {
    if (Object.hasOwnProperty.call(fieldSchema, "extension_uid")) {
        return FieldDataType.CUSTOM_FIELD;
    }

    switch (fieldSchema.data_type) {
        case "text": {
            if (fieldSchema?.field_metadata.multiline) {
                return FieldDataType.MULTILINE;
            } else if (fieldSchema?.field_metadata.allow_rich_text) {
                return FieldDataType.HTML_RTE;
            } else if (fieldSchema?.field_metadata.markdown) {
                return FieldDataType.MARKDOWN_RTE;
            } else if (fieldSchema.enum) {
                return FieldDataType.SELECT;
            } else if (
                fieldSchema.uid === "url" &&
                fieldSchema.field_metadata._default
            ) {
                return FieldDataType.URL;
            } else {
                return FieldDataType.SINGLELINE;
            }
        }
        case "json": {
            if (fieldSchema.field_metadata.allow_json_rte) {
                return FieldDataType.JSON_RTE;
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
        case "taxonomy":
        case "global_field": {
            return FieldDataType[fieldSchema.data_type.toUpperCase()];
        }
    }

    return "";
}
