/**
 * Shared mocks and constants for fieldLabelWrapper component tests
 *
 * Note: vi.mock() calls must remain in each test file (they are hoisted),
 * but the mock implementations and constants are shared here to avoid duplication.
 */

import { vi } from "vitest";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import { CslpData } from "../../../../cslp/types/cslp.types";
import React from "preact/compat";

// Shared field schema cache for tests
export const testFieldSchemaCache: Record<string, Record<string, any>> = {};

// Mock styles object
export const mockStyles = {
    "visual-builder__focused-toolbar--variant":
        "visual-builder__focused-toolbar--variant",
    "visual-builder__tooltip--persistent":
        "visual-builder__tooltip--persistent",
    "visual-builder__custom-tooltip": "visual-builder__custom-tooltip",
    "visual-builder__focused-toolbar__field-label-wrapper":
        "visual-builder__focused-toolbar__field-label-wrapper",
    "visual-builder__focused-toolbar--field-disabled":
        "visual-builder__focused-toolbar--field-disabled",
    "visual-builder__focused-toolbar__text":
        "visual-builder__focused-toolbar__text",
    "field-label-dropdown-open": "field-label-dropdown-open",
    "visual-builder__button": "visual-builder__button",
    "visual-builder__button-loader": "visual-builder__button-loader",
    "visual-builder__reference-icon-container":
        "visual-builder__reference-icon-container",
    "visual-builder__content-type-icon": "visual-builder__content-type-icon",
};

// Display names constants
export const DISPLAY_NAMES = {
    mockFieldCslp: "Field 0",
    parentPath1: "Field 1",
    parentPath2: "Field 2",
    parentPath3: "Field 3",
};

// Path constants
export const pathPrefix = "contentTypeUid.entryUid.locale";
export const PARENT_PATHS = [
    `${pathPrefix}.parentPath1`,
    `${pathPrefix}.parentPath2`,
    `${pathPrefix}.parentPath3`,
];

// Default mock field metadata
export const mockFieldMetadata: CslpData = {
    entry_uid: "mockEntryUid",
    content_type_uid: "mockContentTypeUid",
    cslpValue: "mockFieldCslp",
    locale: "",
    variant: undefined,
    fieldPath: "mockFieldPath",
    fieldPathWithIndex: "",
    multipleFieldMetadata: {
        index: 0,
        parentDetails: {
            parentPath: "",
            parentCslpValue: "",
        },
    },
    instance: {
        fieldPathWithIndex: "",
    },
};

/**
 * Creates a mock implementation for FieldSchemaMap
 */
export function createFieldSchemaMapMock(actual: any) {
    return {
        FieldSchemaMap: {
            ...actual.FieldSchemaMap,
            getFieldSchema: vi
                .fn()
                .mockImplementation(
                    (contentTypeUid: string, fieldPath: string) => {
                        if (testFieldSchemaCache[contentTypeUid]?.[fieldPath]) {
                            const cachedValue =
                                testFieldSchemaCache[contentTypeUid][fieldPath];
                            return Promise.resolve(cachedValue);
                        }
                        const defaultSchema = {
                            display_name: "Field 0",
                            data_type: "text",
                            field_metadata: {
                                description: "",
                                default_value: "",
                                version: 3,
                            },
                            uid: "test_field",
                        };
                        if (!testFieldSchemaCache[contentTypeUid]) {
                            testFieldSchemaCache[contentTypeUid] = {};
                        }
                        testFieldSchemaCache[contentTypeUid][fieldPath] =
                            defaultSchema;
                        return Promise.resolve(defaultSchema);
                    }
                ),
            setFieldSchema: vi
                .fn()
                .mockImplementation(
                    (
                        contentTypeUid: string,
                        schemaMap: Record<string, any>
                    ) => {
                        if (!testFieldSchemaCache[contentTypeUid]) {
                            testFieldSchemaCache[contentTypeUid] = {};
                        }
                        Object.assign(
                            testFieldSchemaCache[contentTypeUid],
                            schemaMap
                        );
                    }
                ),
            hasFieldSchema: vi
                .fn()
                .mockImplementation(
                    (contentTypeUid: string, fieldPath: string) => {
                        return !!testFieldSchemaCache[contentTypeUid]?.[
                            fieldPath
                        ];
                    }
                ),
            clear: vi.fn().mockImplementation(() => {
                Object.keys(testFieldSchemaCache).forEach(
                    (key) => delete testFieldSchemaCache[key]
                );
            }),
        },
    };
}

/**
 * Creates a mock implementation for visualBuilderPostMessage.send
 */
export function createVisualBuilderPostMessageMock() {
    return vi.fn().mockImplementation((eventName: string, fields: any) => {
        if (
            eventName === VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
        ) {
            const result: Record<string, string> = {};
            if (Array.isArray(fields)) {
                fields.forEach((field: any) => {
                    const cslpValue = field?.cslpValue || field?.cslp || "";
                    if (!cslpValue) return;
                    if (cslpValue === "mockFieldCslp") {
                        result[cslpValue] = "Field 0";
                    } else if (
                        cslpValue ===
                        "contentTypeUid.entryUid.locale.parentPath1"
                    ) {
                        result[cslpValue] = "Field 1";
                    } else if (
                        cslpValue ===
                        "contentTypeUid.entryUid.locale.parentPath2"
                    ) {
                        result[cslpValue] = "Field 2";
                    } else if (
                        cslpValue ===
                        "contentTypeUid.entryUid.locale.parentPath3"
                    ) {
                        result[cslpValue] = "Field 3";
                    } else {
                        result[cslpValue] = cslpValue;
                    }
                });
            }
            return Promise.resolve(result);
        } else if (
            eventName ===
                VisualBuilderPostMessageEvents.GET_CONTENT_TYPE_NAME ||
            eventName === "get-content-type-name"
        ) {
            return Promise.resolve({
                contentTypeName: "Page CT",
            });
        } else if (
            eventName === VisualBuilderPostMessageEvents.REFERENCE_MAP ||
            eventName === "get-reference-map"
        ) {
            return Promise.resolve({});
        }
        return Promise.resolve({});
    });
}

/**
 * Mock implementations for use in vi.mock() calls
 * Note: vi.mock() calls must be at the top level of each test file,
 * but these implementations can be reused
 */

// Tooltip mock component
export const mockToolbarTooltip = ({ children, data, disabled }: any) =>
    React.createElement(
        "div",
        {
            "data-testid": "toolbar-tooltip",
            "data-disabled": disabled,
            "data-content-type-name": data.contentTypeName,
            "data-reference-field-name": data.referenceFieldName,
        },
        children
    );

// VariantIndicator mock component
export const mockVariantIndicator = () =>
    React.createElement(
        "div",
        { "data-testid": "variant-indicator" },
        "Variant"
    );

// Default entry permissions response
export const mockEntryPermissionsResponse = {
    acl: {
        update: {
            create: true,
            read: true,
            update: true,
            delete: true,
            publish: true,
        },
    },
    workflowStage: {
        stage: undefined,
        permissions: {
            entry: {
                update: true,
            },
        },
    },
    resolvedVariantPermissions: {
        update: true,
    },
};
