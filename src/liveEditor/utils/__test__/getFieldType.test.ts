import {
    IBooleanContentTypeSchema,
    ICustomFieldContentTypeSchema,
    IDateContentTypeSchema,
    IExperienceContainerContentTypeSchema,
    IFileContentTypeSchema,
    IGlobalFieldContentTypeSchema,
    IGroupContentTypeSchema,
    IHTMLRTEContentTypeSchema,
    IJSONRTEContentTypeSchema,
    ILinkContentTypeSchema,
    IMarkdownContentTypeSchema,
    IModularBlocksContentTypeSchema,
    IMultiLineTextBoxContentTypeSchema,
    INumberContentTypeSchema,
    IReferenceContentTypeSchema,
    ISelectContentTypeSchema,
    ISingleLineTextBoxContentTypeSchema,
    IURLContentTypeSchema,
} from "../../../types/contentTypeSchema.types";
import { getFieldType } from "../getFieldType";
import { FieldDataType, ISchemaFieldMap } from "../types/index.types";

describe("getFieldType", () => {
    test("should return multiline if it is multiline", () => {
        const data: IMultiLineTextBoxContentTypeSchema = {
            data_type: "text",
            display_name: "display_name",
            uid: "uid",
            field_metadata: {
                description: "",
                default_value: "",
                multiline: true,
                version: 0,
            },
            format: "",
            error_messages: {
                format: "",
            },
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("multiline");
    });

    test("should return html_rte if it is html_rte", () => {
        const data: IHTMLRTEContentTypeSchema = {
            data_type: "text",
            field_metadata: {
                allow_rich_text: true,
                description: "",
                multiline: false,
                rich_text_type: "advanced",
                options: [],
                version: 0,
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("html_rte");
    });

    test("should return markdown_rte if it is markdown_rte", () => {
        const data: IMarkdownContentTypeSchema = {
            data_type: "text",
            field_metadata: {
                description: "",
                markdown: true,
                version: 0,
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("markdown_rte");
    });

    test("should return select if it is select", () => {
        const data: ISelectContentTypeSchema = {
            data_type: "text",
            display_type: "dropdown",
            enum: {
                advanced: false,
                choices: [],
            },
            field_metadata: {
                description: "",
                default_value: "",
                version: 0,
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("select");
    });

    test("should return singleline if it is singleline", () => {
        const data: ISingleLineTextBoxContentTypeSchema = {
            data_type: "text",
            field_metadata: {
                description: "",
                default_value: "",
                version: 0,
            },
            format: "",
            error_messages: {
                format: "",
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("singleline");
    });

    test("should return json_rte if it is json_rte", () => {
        const data: IJSONRTEContentTypeSchema = {
            data_type: "json",
            field_metadata: {
                allow_json_rte: true,
                embed_entry: false,
                description: "",
                default_value: "",
                multiline: false,
                rich_text_type: "advanced",
                options: [],
            },
            format: "",
            error_messages: {
                format: "",
            },
            reference_to: ["sys_assets"],
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("json_rte");
    });

    test("should return number if it is number", () => {
        const data: INumberContentTypeSchema = {
            data_type: "number",
            field_metadata: {
                description: "",
                default_value: "",
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("number");
    });

    test("should return boolean if it is boolean", () => {
        const data: IBooleanContentTypeSchema = {
            data_type: "boolean",
            field_metadata: {
                description: "",
                default_value: false,
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("boolean");
    });

    test("should return isodate if it is isodate", () => {
        const data: IDateContentTypeSchema = {
            data_type: "isodate",
            startDate: null,
            endDate: null,
            field_metadata: {
                description: "",
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("isodate");
    });

    test("should return file if it is file", () => {
        const data: IFileContentTypeSchema = {
            data_type: "file",
            extensions: [],
            field_metadata: {
                description: "",
                rich_text_type: "standard",
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("file");
    });

    test("should return link if it is link", () => {
        const data: ILinkContentTypeSchema = {
            data_type: "link",
            field_metadata: {
                description: "",
                default_value: {
                    title: "",
                    url: "",
                },
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("link");
    });

    test("should return modular_block if it is modular_block", () => {
        const data: IModularBlocksContentTypeSchema = {
            data_type: "blocks",
            blocks: [],
            field_metadata: {
                instruction: "",
                description: "",
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("modular_block");
    });

    test("should return group if it is group", () => {
        const data: IGroupContentTypeSchema = {
            data_type: "group",
            field_metadata: {
                description: "",
                instruction: "",
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
            schema: [],
        };

        expect(getFieldType(data)).toBe("group");
    });

    test("should return reference if it is reference", () => {
        const data: IReferenceContentTypeSchema = {
            data_type: "reference",
            reference_to: [],
            field_metadata: {
                ref_multiple: false,
                ref_multiple_content_types: false,
            },
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("reference");
    });

    test("should return global_field if it is global_field", () => {
        const data: IGlobalFieldContentTypeSchema = {
            data_type: "global_field",
            reference_to: "",
            field_metadata: {
                description: "",
            },
            schema: [],
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("global_field");
    });

    test("should return experience_container if it is experience_container", () => {
        const data: IExperienceContainerContentTypeSchema = {
            data_type: "experience_container",
            field_metadata: {
                experience_uid: "",
                project_uid: "",
                enableDefaultVariation: false,
            },
            schema: [],
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("experience_container");
    });

    test("should return custom_field if it is custom_field", () => {
        const data: ICustomFieldContentTypeSchema = {
            extension_uid: "",
            field_metadata: {
                extension: true,
            },
            config: {},
            data_type: "number",
            uid: "",
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe("custom_field");
    });

    test("should return url if it is url", () => {
        const data: IURLContentTypeSchema = {
            data_type: "text",
            uid: "url",
            field_metadata: {
                _default: true,
                version: 0,
            },
            display_name: "",
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
        };

        expect(getFieldType(data)).toBe(FieldDataType.URL);
    });

    test("should return empty string if it is not any of the above", () => {
        const data = {} as unknown as ISchemaFieldMap;

        expect(getFieldType(data)).toBe("");
    });

    test("should return empty string if it is json but not rte or custom field", () => {
        const data = {
            data_type: "json",
            field_metadata: {}
        } as unknown as ISchemaFieldMap;

        expect(getFieldType(data)).toBe("");
    })
});
