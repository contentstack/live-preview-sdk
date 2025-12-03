import { render, waitFor, act, findByTestId } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../../fieldLabelWrapper";
import { VisualBuilderCslpEventDetails } from "../../../types/visualBuilder.types";
import { singleLineFieldSchema } from "../../../../__test__/data/fields";
import { isFieldDisabled } from "../../../utils/isFieldDisabled";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import React from "preact/compat";
// Import shared mocks and constants
import {
    mockStyles,
    DISPLAY_NAMES,
    PARENT_PATHS,
    mockFieldMetadata,
    mockEntryPermissionsResponse,
} from "./fieldLabelWrapper.mocks";

// Local cache for this test file (can't use imported cache in vi.mock due to hoisting)
const testFieldSchemaCache: Record<string, Record<string, any>> = {};

// All mocks - inline implementations (can't use imported functions in vi.mock due to hoisting)
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

vi.mock("../../../utils/fieldSchemaMap", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../utils/fieldSchemaMap")>();
    // Inline implementation - can't use imported function due to vi.mock hoisting
    // Using local cache variable defined above
    return {
        FieldSchemaMap: {
            ...actual.FieldSchemaMap,
            getFieldSchema: vi
                .fn()
                .mockImplementation(
                    (contentTypeUid: string, fieldPath: string) => {
                        if (testFieldSchemaCache[contentTypeUid]?.[fieldPath]) {
                            return Promise.resolve(
                                testFieldSchemaCache[contentTypeUid][fieldPath]
                            );
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

vi.mock("../../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn().mockImplementation((eventName: string, fields: any) => {
            // Inline implementation - can't use imported function due to vi.mock hoisting
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

vi.mock("../../../utils/isFieldDisabled", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../../utils/isFieldDisabled")>();
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

vi.mock("../../../utils/fetchEntryPermissionsAndStageDetails", () => ({
    fetchEntryPermissionsAndStageDetails: vi.fn().mockImplementation(() => {
        return Promise.resolve(mockEntryPermissionsResponse);
    }),
}));

vi.mock("../generators/generateCustomCursor", () => ({
    getFieldIcon: vi.fn().mockReturnValue("<svg>mock-icon</svg>"),
    FieldTypeIconsMap: {
        reference: "<svg>reference-icon</svg>",
    },
}));

vi.mock("../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn(() => mockStyles),
}));

vi.mock("../../VariantIndicator", () => ({
    VariantIndicator: () => <div data-testid="variant-indicator">Variant</div>,
}));

vi.mock("../../../utils/errorHandling", () => ({
    hasPostMessageError: vi.fn().mockReturnValue(false),
}));

describe("FieldLabelWrapperComponent - Render Fields", () => {
    beforeEach(() => {
        // Reset all mocks to their default state before each test
        vi.clearAllMocks();

        // Reset isFieldDisabled to default
        (isFieldDisabled as any).mockReturnValue({
            isDisabled: false,
            reason: "",
        });

        // Reset visualBuilderPostMessage mock - inline implementation
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

        // Pre-set field schema in cache to avoid async fetch delay
        // This makes FieldSchemaMap.getFieldSchema resolve immediately from cache
        FieldSchemaMap.setFieldSchema(mockFieldMetadata.content_type_uid, {
            [mockFieldMetadata.fieldPath]: singleLineFieldSchema,
        });
    });

    afterEach(() => {
        // Clean up field schema cache after each test
        FieldSchemaMap.clear();
        // Clean up DOM after each test to prevent state pollution
        document.body.innerHTML = "";
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    // mockFieldMetadata is now defined above the describe block

    const mockEventDetails: VisualBuilderCslpEventDetails = {
        editableElement: document.createElement("div"),
        cslpData: "",
        fieldMetadata: mockFieldMetadata,
    };

    const mockGetParentEditable = () => document.createElement("div");

    test("renders current field and parent fields correctly", async () => {
        // Wrap render in act to batch all updates and reduce reconciliation cycles
        let container!: HTMLElement;
        await act(async () => {
            const result = render(
                <FieldLabelWrapperComponent
                    fieldMetadata={mockFieldMetadata}
                    eventDetails={mockEventDetails}
                    parentPaths={PARENT_PATHS}
                    getParentEditableElement={mockGetParentEditable}
                />
            );
            container = result.container as HTMLElement;
            // Use queueMicrotask for faster resolution than setTimeout
            await new Promise<void>((resolve) =>
                queueMicrotask(() => resolve())
            );
        });

        // Use waitFor with shorter timeout since mocks resolve immediately
        await waitFor(
            () => {
                const text = Array.from(container.querySelectorAll("*")).find(
                    (el) => el.textContent === DISPLAY_NAMES.mockFieldCslp
                );
                if (!text) throw new Error("Text not found");
                expect(text).toBeInTheDocument();
            },
            { timeout: 1000, interval: 10 }
        );
    });
});
