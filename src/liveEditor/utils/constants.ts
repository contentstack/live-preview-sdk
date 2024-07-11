import { FieldDataType } from "./types/index.types";

export const numericInputRegex = /^-?\d*(\.\d*)?([eE][-+]?\d*)?$/;

export const LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY = "data-cslp-field-type";

export const LIVE_EDITOR_CHANNEL_ID = "live-editor";

export const LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX = 2;

export const DATA_CSLP_ATTR_SELECTOR = "data-cslp";

/**
 * The field that can be directly modified using contenteditable=true.
 * This includes all text fields like title and numbers.
 */
export const ALLOWED_INLINE_EDITABLE_FIELD: FieldDataType[] = [
    FieldDataType.SINGLELINE,
    FieldDataType.MULTILINE,
    FieldDataType.NUMBER,
];

export const ALLOWED_MODAL_EDITABLE_FIELD: FieldDataType[] = [
    FieldDataType.HTML_RTE,
    FieldDataType.MARKDOWN_RTE,
    FieldDataType.JSON_RTE,
    FieldDataType.CUSTOM_FIELD,
    FieldDataType.LINK,
    FieldDataType.ISODATE,
];

// TODO - migrate asset here as well
export const ALLOWED_REPLACE_FIELDS: FieldDataType[] = [
    FieldDataType.REFERENCE,
];
