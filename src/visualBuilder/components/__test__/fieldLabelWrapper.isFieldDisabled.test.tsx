import { render, act, findByTestId } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../fieldLabelWrapper";
import { CslpData } from "../../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import { isFieldDisabled } from "../../utils/isFieldDisabled";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import React from "preact/compat";

// All mocks - same as main test file
vi.mock("../Tooltip", () => ({
    ToolbarTooltip: ({ children, data, disabled }: any) => (
        <div
            data-testid="toolbar-tooltip"
            data-disabled={disabled}
            data-content-type-name={data.contentTypeName}
            data-reference-field-name={data.referenceFieldName}
        >
            {children}
        </div>
    ),
}));

const testFieldSchemaCache: Record<string, Record<string, any>> = {};

vi.mock("../../utils/fieldSchemaMap", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../utils/fieldSchemaMap")>();
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
});

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn().mockImplementation((eventName: string, fields: any) => {
            if (
                eventName ===
                VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
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
        }),
    },
}));

vi.mock("../../utils/isFieldDisabled", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../utils/isFieldDisabled")>();
    return {
        ...actual,
        isFieldDisabled: vi
            .fn()
            .mockReturnValue({ isDisabled: false, reason: "" }),
    };
});

vi.mock("../../../cslp", () => ({
    extractDetailsFromCslp: vi.fn().mockImplementation((path) => {
        return {
            content_type_uid: "mockContentTypeUid",
            fieldPath: path,
            cslpValue: path,
        };
    }),
}));

vi.mock("../../utils/fetchEntryPermissionsAndStageDetails", () => ({
    fetchEntryPermissionsAndStageDetails: vi.fn().mockImplementation(() => {
        return Promise.resolve({
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
        });
    }),
}));

vi.mock("../generators/generateCustomCursor", () => ({
    getFieldIcon: vi.fn().mockReturnValue("<svg>mock-icon</svg>"),
    FieldTypeIconsMap: {
        reference: "<svg>reference-icon</svg>",
    },
}));

const mockStyles = {
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

vi.mock("../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn(() => mockStyles),
}));

vi.mock("../VariantIndicator", () => ({
    VariantIndicator: () => <div data-testid="variant-indicator">Variant</div>,
}));

vi.mock("../../utils/errorHandling", () => ({
    hasPostMessageError: vi.fn().mockReturnValue(false),
}));

const mockFieldMetadata: CslpData = {
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

describe("FieldLabelWrapperComponent - isFieldDisabled Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: false,
            reason: "",
        });
        vi.mocked(visualBuilderPostMessage!.send).mockImplementation(
            (eventName: string, fields: any) => {
                if (
                    eventName ===
                    VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                ) {
                    const result: Record<string, string> = {};
                    if (Array.isArray(fields)) {
                        fields.forEach((field: any) => {
                            const cslpValue =
                                field?.cslpValue || field?.cslp || "";
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
                    eventName ===
                        VisualBuilderPostMessageEvents.REFERENCE_MAP ||
                    eventName === "get-reference-map"
                ) {
                    return Promise.resolve({});
                }
                return Promise.resolve({});
            }
        );
        FieldSchemaMap.setFieldSchema(mockFieldMetadata.content_type_uid, {
            [mockFieldMetadata.fieldPath]: singleLineFieldSchema,
        });
    });

    afterEach(() => {
        FieldSchemaMap.clear();
        document.body.innerHTML = "";
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    const mockEventDetails: VisualBuilderCslpEventDetails = {
        editableElement: document.createElement("div"),
        cslpData: "",
        fieldMetadata: mockFieldMetadata,
    };

    const mockGetParentEditable = () => document.createElement("div");

    test("calls isFieldDisabled with correct arguments", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        await act(async () => {
            await new Promise<void>((resolve) =>
                queueMicrotask(() => resolve())
            );
        });

        await findByTestId(
            container as HTMLElement,
            "visual-builder__focused-toolbar__field-label-wrapper",
            {},
            { timeout: 1000 }
        );
        expect(isFieldDisabled).toHaveBeenCalled();

        expect(isFieldDisabled).toHaveBeenCalledWith(
            singleLineFieldSchema,
            mockEventDetails,
            {
                update: true,
            },
            {
                update: {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    publish: true,
                },
            },
            {
                stage: undefined,
                permissions: {
                    entry: {
                        update: true,
                    },
                },
            }
        );
    });
});

