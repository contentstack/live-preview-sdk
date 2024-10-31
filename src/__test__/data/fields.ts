import { ISchemaFieldMap } from "../../visualBuilder/utils/types/index.types";

export const singleLineFieldSchema = {
    data_type: "text",
    display_name: "Single Line Textbox",
    uid: "single_line",
    field_metadata: {
        description: "",
        default_value: "",
        version: 3,
    },
    format: "",
    error_messages: {
        format: "",
    },
    mandatory: false,
    multiple: true,
    non_localizable: false,
    unique: false,
} as ISchemaFieldMap;

export const mockMultipleLinkFieldSchema: ISchemaFieldMap = {
    data_type: "link",
    display_name: "Link",
    uid: "link",
    field_metadata: {
        description: "",
        default_value: {
            title: "Example",
            url: "https://www.example.com",
        },
    },
    mandatory: false,
    multiple: true,
    non_localizable: false,
    unique: false,
};
