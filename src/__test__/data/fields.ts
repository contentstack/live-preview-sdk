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

export const mockMultipleFileFieldSchema: ISchemaFieldMap = {
    data_type: "file",
    display_name: "File",
    uid: "file",
    extensions: [],
    field_metadata: {
        description: "",
        rich_text_type: "standard"
    },
    mandatory: false,
    multiple: true,
    non_localizable: false,
    unique: false,
};

export const mockMultipleCustomFieldSchema: ISchemaFieldMap = {
    extension_uid: "test_extension_uid",
    field_metadata: { extension: true },
    config: {},
    data_type: "number",
    display_name: "Custom Field",
    uid: "custom_field",
    mandatory: false,
    multiple: true,
    non_localizable: false,
    unique: false,
} as unknown as ISchemaFieldMap;

export const mockSingleCustomFieldSchema: ISchemaFieldMap = {
    extension_uid: "test_extension_uid",
    field_metadata: { extension: true },
    config: {},
    data_type: "number",
    display_name: "Custom Field",
    uid: "custom_field",
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
} as unknown as ISchemaFieldMap;
