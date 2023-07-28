import {
    IHTMLRTEContentTypeSchema,
    IMarkdownContentTypeSchema,
    IMultiLineTextBoxContentTypeSchema,
    ISelectContentTypeSchema,
    ISingleLineTextBoxContentTypeSchema,
} from "../../../types/contentTypeSchema.types";
import { getFieldType } from "../getFieldType";

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
});
