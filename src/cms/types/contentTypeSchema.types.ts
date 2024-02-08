interface IContentTypeSchemaCommonData {
    uid: string;
    display_name: string;
    mandatory: boolean;
    multiple: boolean;
    non_localizable: boolean;
    unique: boolean;
}

export interface ITitleContentTypeSchema extends IContentTypeSchemaCommonData {
    data_type: "text";
    field_metadata: {
        _default: true;
        version: number;
    };
    mandatory: true;
    unique: true;
}

export interface ISingleLineTextBoxContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "text";
    field_metadata: {
        description: string;
        default_value: string;
        version: number;
    };
    format: string;
    error_messages: {
        format: string;
    };
}

export interface IMultiLineTextBoxContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "text";
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
}

export interface IHTMLRTEContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "text";
    field_metadata: {
        allow_rich_text: true; // TODO: confirm whether this value is static.
        description: string;
        multiline: false; // TODO: confirm whether this value is static.
        rich_text_type: "advanced" | "basic" | "custom";
        options: [];
        version: number;
    };
}

export interface IJSONRTEContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "json";
    field_metadata: {
        allow_json_rte: true;
        embed_entry: boolean;
        description: string;
        default_value: string;
        multiline: false; // TODO: confirm whether this value is static.
        rich_text_type: "advanced" | "basic" | "custom";
        options: [];
    };
    format: string;
    error_messages: {
        format: string;
    };
    reference_to: ["sys_assets"]; // TODO: confirm if the value is static.
}

export interface IURLContentTypeSchema extends IContentTypeSchemaCommonData {
    data_type: "text";
    uid: "url";
    field_metadata: {
        _default: true;
        version: number;
    };
}

export interface IMarkdownContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "text";
    field_metadata: {
        description: string;
        markdown: true;
        version: number;
    };
}

export interface ICustomFieldContentTypeSchema
    extends IContentTypeSchemaCommonData {
    extension_uid: string;
    field_metadata: {
        extension: true;
        is_asset?: boolean;
    };
    config: Record<string, unknown>;
    data_type:
        | "text"
        | "number"
        | "isodate"
        | "boolean"
        | "json"
        | "reference"
        | "file";
}

export interface ISelectContentTypeSchema extends IContentTypeSchemaCommonData {
    data_type: "text";
    display_type: "dropdown" | "radio";
    enum: {
        advanced: boolean;
        choices: { value: string }[];
    };
    field_metadata: {
        description: string;
        default_value: string;
        version: number;
    };
}

export interface INumberContentTypeSchema extends IContentTypeSchemaCommonData {
    data_type: "number";
    field_metadata: {
        description: string;
        default_value: string;
    };
}

export interface IBooleanContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "boolean";
    field_metadata: {
        description: string;
        default_value: boolean;
    };
}

export interface IDateContentTypeSchema extends IContentTypeSchemaCommonData {
    data_type: "isodate";
    startDate: null | string;
    endDate: null | string;
    field_metadata: {
        description: string;
    };
}

export interface IFileContentTypeSchema extends IContentTypeSchemaCommonData {
    data_type: "file";
    extensions: string[];
    field_metadata: {
        description: string;
        rich_text_type: "standard";
    };
}

export interface ILinkContentTypeSchema extends IContentTypeSchemaCommonData {
    data_type: "link";
    field_metadata: {
        description: string;
        default_value: {
            title: string;
            url: string;
        };
    };
}

export interface IReferenceContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "reference";
    reference_to: string[];
    field_metadata: {
        ref_multiple: boolean;
        ref_multiple_content_types: boolean;
    };
}

export interface IExperienceContainerContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "experience_container";
    field_metadata: {
        experience_uid: string;
        project_uid: string;
        enableDefaultVariation: boolean;
    };
    schema: IContentTypeCommonBlocks[];
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
    | ICustomFieldContentTypeSchema
    | ILinkContentTypeSchema
    | IModularBlocksContentTypeSchema
    | IGroupContentTypeSchema
    | IReferenceContentTypeSchema
    | IGlobalFieldContentTypeSchema
    | IExperienceContainerContentTypeSchema;

export type IContentTypeRootBlocks =
    | ISingleLineTextBoxContentTypeSchema
    | IMultiLineTextBoxContentTypeSchema
    | IHTMLRTEContentTypeSchema
    | IJSONRTEContentTypeSchema
    | IMarkdownContentTypeSchema
    | ISelectContentTypeSchema
    | ICustomFieldContentTypeSchema
    | INumberContentTypeSchema
    | IBooleanContentTypeSchema
    | IDateContentTypeSchema
    | IFileContentTypeSchema
    | ILinkContentTypeSchema
    | IModularBlocksContentTypeSchema
    | IGroupContentTypeSchema
    | IReferenceContentTypeSchema
    | IGlobalFieldContentTypeSchema
    | IExperienceContainerContentTypeSchema
    | ITitleContentTypeSchema
    | IURLContentTypeSchema;

export interface IModularBlockSingleBlock {
    title: string;
    uid: string;
    schema: IContentTypeCommonBlocks[];
}

export interface IModularBlocksContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "blocks";
    blocks: IModularBlockSingleBlock[];
    field_metadata: {
        instruction: string;
        description: string;
    };
}

export interface IGroupContentTypeSchema extends IContentTypeSchemaCommonData {
    data_type: "group";
    field_metadata: {
        description: string;
        instruction: string;
    };
    schema: IContentTypeCommonBlocks[];
}

export interface IGlobalFieldContentTypeSchema
    extends IContentTypeSchemaCommonData {
    data_type: "global_field";
    reference_to: string;
    field_metadata: {
        description: string;
    };
    schema: IContentTypeRootBlocks[];
}

export interface IPageSchema {
    created_at: string;
    updated_at: string;
    title: string;
    description: string;
    uid: string;
    _version: number;
    inbuilt_class: false;
    options: {
        is_page: boolean;
        singleton: boolean;
        title: string;
    };
    schema: IContentTypeRootBlocks[];
}
