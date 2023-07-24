export interface ITitleContentTypeSchema {
    data_type: "text";
    display_name: string;
    field_metadata: {
        _default: true;
        version: string;
    };
    mandatory: true;
    uid: string;
    unique: true;
    multiple: false;
    non_localizable: false;
}

export interface ISingleLineTextBoxContentTypeSchema {
    data_type: "text";
    display_name: string;
    uid: string;
    field_metadata: {
        description: string;
        default_value: string;
        version: number;
    };
    format: string;
    error_messages: {
        format: string;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IMultiLineTextBoxContentTypeSchema {
    data_type: "text";
    display_name: string;
    uid: string;
    field_metadata: {
        description: string;
        default_value: string;
        multiline: true;
        version: number;
    };
    format: string;
    error_messages: {
        format: string;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IHTMLRTEContentTypeSchema {
    data_type: "text";
    display_name: string;
    uid: string;
    field_metadata: {
        allow_rich_text: true; // TODO: confirm whether this value is static.
        description: string;
        multiline: false; // TODO: confirm whether this value is static.
        rich_text_type: "advanced"; // TODO: get other values
        options: []; // TODO: find other values
        version: number;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IJSONRTEContentTypeSchema {
    data_type: "json";
    display_name: string;
    uid: string;
    field_metadata: {
        allow_json_rte: true;
        embed_entry: boolean;
        description: string;
        default_value: string;
        multiline: false; // TODO: confirm whether this value is static.
        rich_text_type: "advanced"; // TODO: get other values
        options: []; // TODO: find other values
    };
    format: string;
    error_messages: {
        format: string;
    };
    reference_to: ["sys_assets"]; // TODO: confirm if the value is static.
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IURLContentTypeSchema {
    data_type: "text";
    display_name: string;
    uid: "url";
    field_metadata: {
        _default: true;
        version: number;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IMarkdownContentTypeSchema {
    data_type: "text";
    display_name: string;
    uid: string;
    field_metadata: {
        description: string;
        markdown: true;
        version: number;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface ISelectContentTypeSchema {
    // TODO: play with the values for accurate schema
    data_type: "text";
    display_name: string;
    display_type: "dropdown" | "radio";
    enum: {
        advanced: boolean;
        choices: { value: string }[];
    };
    multiple: boolean;
    uid: string;
    field_metadata: {
        description: string;
        default_value: string;
        version: number;
    };
    mandatory: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface INumberContentTypeSchema {
    data_type: "number";
    display_name: string;
    uid: string;
    field_metadata: {
        description: string;
        default_value: string;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IBooleanContentTypeSchema {
    data_type: "boolean";
    display_name: string;
    uid: string;
    field_metadata: {
        description: string;
        default_value: boolean;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IDateContentTypeSchema {
    data_type: "isodate";
    display_name: string;
    uid: string;
    startDate: null | string;
    endDate: null | string;
    field_metadata: {
        description: string;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IFileContentTypeSchema {
    data_type: "file";
    display_name: string;
    uid: string;
    extensions: string[];
    field_metadata: {
        description: string;
        rich_text_type: "standard";
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface ILinkContentTypeSchema {
    data_type: "link";
    display_name: string;
    uid: string;
    field_metadata: {
        description: string;
        default_value: {
            title: string;
            url: string;
        };
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IReferenceContentTypeSchema {
    data_type: "reference";
    display_name: string;
    uid: string;
    reference_to: string[];
    field_metadata: {
        ref_multiple: boolean;
        ref_multiple_content_types: boolean;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export type IContentTypeCommonBlocks =
    | ISingleLineTextBoxContentTypeSchema
    | IMultiLineTextBoxContentTypeSchema
    | IHTMLRTEContentTypeSchema
    | IJSONRTEContentTypeSchema
    | IMarkdownContentTypeSchema
    | ISelectContentTypeSchema
    | INumberContentTypeSchema
    | IBooleanContentTypeSchema
    | IDateContentTypeSchema
    | IFileContentTypeSchema
    | ILinkContentTypeSchema
    | IModularBlocksContentTypeSchema
    | IGroupContentTypeSchema
    | IReferenceContentTypeSchema;

export type IContentTypeRootBlocks =
    | IContentTypeCommonBlocks
    | ITitleContentTypeSchema
    | IURLContentTypeSchema;

export interface IModularBlockSingleBlock {
    title: string;
    uid: string;
    schema: IContentTypeCommonBlocks[];
}

export interface IModularBlocksContentTypeSchema {
    data_type: "blocks";
    display_name: string;
    uid: string;
    blocks: IModularBlockSingleBlock[];
    field_metadata: {
        instruction: string;
        description: string;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IGroupContentTypeSchema {
    data_type: "group";
    display_name: string;
    uid: string;
    field_metadata: {
        description: string;
        instruction: string;
    };
    schema: IContentTypeCommonBlocks[];
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface IGlobalFieldContentTypeSchema {
    data_type: "global_field";
    display_name: string;
    uid: string;
    reference_to: string;
    field_metadata: {
        description: string;
    };
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
    schema: IContentTypeRootBlocks[];
}
