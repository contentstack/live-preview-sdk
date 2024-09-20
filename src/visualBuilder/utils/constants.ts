import { FieldDataType } from "./types/index.types";

export const numericInputRegex = /^-?\d*(\.\d*)?([eE][-+]?\d*)?$/;

export const VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY = "data-cslp-field-type";

export const VISUAL_BUILDER_CHANNEL_ID = "visual-builder";

export const LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX = 2;

// Minimum distance from top edge to prevent toolbar from being hidden
export const TOP_EDGE_BUFFER = 42;
export const RIGHT_EDGE_BUFFER = 180;

export const TOOLBAR_EDGE_BUFFER = 8;

export const DATA_CSLP_ATTR_SELECTOR = "data-cslp";

export const WAIT_FOR_NEW_INSTANCE_TIMEOUT = 4000;

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
    FieldDataType.URL,
];

export const ALLOWED_REPLACE_FIELDS: FieldDataType[] = [
    FieldDataType.REFERENCE,
    FieldDataType.FILE,
];

export const DEFAULT_MULTIPLE_FIELDS: FieldDataType[] = [
    FieldDataType.GLOBAL_FIELD,
    FieldDataType.GROUP,
    FieldDataType.BLOCK,
];
