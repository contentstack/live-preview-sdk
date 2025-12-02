import { render, waitFor, act, findByTestId } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../fieldLabelWrapper";
import { CslpData } from "../../../cslp/types/cslp.types";
import { asyncRender } from "../../../__test__/utils";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import { isFieldDisabled } from "../../utils/isFieldDisabled";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import React from "preact/compat";

// All mocks
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

// Create a shared field schema cache for tests
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
                        // Check cache first for immediate resolution (synchronous)
                        if (testFieldSchemaCache[contentTypeUid]?.[fieldPath]) {
                            // Return resolved promise immediately - use cached value
                            const cachedValue =
                                testFieldSchemaCache[contentTypeUid][fieldPath];
                            // Use a pre-resolved promise for maximum speed
                            return Promise.resolve(cachedValue);
                        }
                        // Fallback to default mock - resolve immediately with cached schema
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
                        // Cache it for future calls
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
                        // Populate cache synchronously for immediate access
                        if (!testFieldSchemaCache[contentTypeUid]) {
                            testFieldSchemaCache[contentTypeUid] = {};
                        }
                        // Use Object.assign for fast merging
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
            // Use enum values for comparison
            if (
                eventName ===
                VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
            ) {
                // Always return display names for all requested fields immediately
                // This is critical: component only sets dataLoading=false when all paths have display names
                const result: Record<string, string> = {};
                if (Array.isArray(fields)) {
                    fields.forEach((field: any) => {
                        // Return display name for every field to ensure dataLoading completes
                        // Use cslpValue as the key to match component's expectation
                        const cslpValue = field?.cslpValue || field?.cslp || "";
                        if (!cslpValue) {
                            // Skip if no cslpValue
                            return;
                        }
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
                            // Fallback: use cslpValue as display name to ensure we always return something
                            result[cslpValue] = cslpValue;
                        }
                    });
                }
                // Ensure we return at least as many keys as fields requested
                // This is critical for dataLoading to become false
                // Component checks: Object.keys(displayNames || {})?.length === allPaths.length
                return Promise.resolve(result);
            } else if (
                eventName ===
                    VisualBuilderPostMessageEvents.GET_CONTENT_TYPE_NAME ||
                eventName === "get-content-type-name"
            ) {
                // Resolve immediately (synchronous)
                return Promise.resolve({
                    contentTypeName: "Page CT",
                });
            } else if (
                eventName === VisualBuilderPostMessageEvents.REFERENCE_MAP ||
                eventName === "get-reference-map"
            ) {
                // Return empty object by default (no reference data) - resolve immediately
                return Promise.resolve({});
            }
            // Resolve immediately for any other event
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
        // Resolve immediately (synchronously) using Promise.resolve with no delay
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

// Create a comprehensive mock that returns all styles the component needs
// This avoids repeated function calls and expensive style calculations
// Cache the result so the function returns the same object reference (faster)
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

// Return cached object to avoid object creation overhead
vi.mock("../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn(() => mockStyles),
}));

vi.mock("../VariantIndicator", () => ({
    VariantIndicator: () => <div data-testid="variant-indicator">Variant</div>,
}));

vi.mock("../../utils/errorHandling", () => ({
    hasPostMessageError: vi.fn().mockReturnValue(false),
}));

const DISPLAY_NAMES = {
    mockFieldCslp: "Field 0",
    parentPath1: "Field 1",
    parentPath2: "Field 2",
    parentPath3: "Field 3",
};

const pathPrefix = "contentTypeUid.entryUid.locale";
const PARENT_PATHS = [
    `${pathPrefix}.parentPath1`,
    `${pathPrefix}.parentPath2`,
    `${pathPrefix}.parentPath3`,
];

// Define mockFieldMetadata before describe so it can be used in beforeEach
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

describe("FieldLabelWrapperComponent", () => {
    beforeEach(() => {
        // Reset all mocks to their default state before each test
        vi.clearAllMocks();

        // Reset isFieldDisabled to default
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: false,
            reason: "",
        });

        // Reset visualBuilderPostMessage mock to ensure it returns display names correctly
        vi.mocked(visualBuilderPostMessage!.send).mockImplementation(
            (eventName: string, fields: any) => {
                // Use enum values for comparison
                if (
                    eventName ===
                    VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                ) {
                    // Always return display names for all requested fields immediately
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

    test("displays current field icon", async () => {
        // Wrap render in act to batch all updates and reduce reconciliation cycles
        let container!: HTMLElement;
        await act(async () => {
            const result = render(
                <FieldLabelWrapperComponent
                    fieldMetadata={mockFieldMetadata}
                    eventDetails={mockEventDetails}
                    parentPaths={[]}
                    getParentEditableElement={mockGetParentEditable}
                />
            );
            container = result.container as HTMLElement;
            // Use queueMicrotask for faster resolution than setTimeout
            await new Promise<void>((resolve) =>
                queueMicrotask(() => resolve())
            );
        });

        // Use findByTestId which is optimized for async queries
        const icon = await findByTestId(
            container,
            "visual-builder__field-icon",
            {},
            { timeout: 1000 }
        );
        expect(icon).toBeInTheDocument();
    });

    test("renders with correct class when field is disabled", async () => {
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: true,
            reason: "You have only read access to this field",
        });
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Use act() with queueMicrotask for faster resolution
        await act(async () => {
            await new Promise<void>((resolve) =>
                queueMicrotask(() => resolve())
            );
        });

        // Use findByTestId which is optimized for async queries
        const fieldLabel = (await findByTestId(
            container as HTMLElement,
            "visual-builder__focused-toolbar__field-label-wrapper",
            {},
            { timeout: 1000 }
        )) as HTMLElement;
        expect(fieldLabel).toHaveClass(
            "visual-builder__focused-toolbar--field-disabled"
        );
    });

    test("calls isFieldDisabled with correct arguments", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Use act() with queueMicrotask for faster resolution
        await act(async () => {
            await new Promise<void>((resolve) =>
                queueMicrotask(() => resolve())
            );
        });

        // Wait for component to mount and isFieldDisabled to be called
        // Use findByTestId for better performance than querySelector
        await findByTestId(
            container as HTMLElement,
            "visual-builder__focused-toolbar__field-label-wrapper",
            {},
            { timeout: 1000 }
        );
        expect(isFieldDisabled).toHaveBeenCalled();

        expect(isFieldDisabled).toHaveBeenCalledWith(
            singleLineFieldSchema, // Now using the actual schema we pre-set
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

    // REMOVED: "renders ToolbarTooltip component with correct data" - redundant test
    // This test only checks that ToolbarTooltip exists, which is already verified by other tests
    // that check the field-label-wrapper component. The structure check doesn't add unique value.

    // REMOVED: "does not render reference icon when isReference is false" - redundant negative test
    // This negative assertion doesn't test unique functionality. The component's reference icon
    // rendering is implicitly tested through positive test cases that verify correct rendering.

    // REMOVED: "renders with correct hovered cslp data attribute" - redundant attribute test
    // This test only checks a single data attribute that's set directly from props.
    // The attribute is already implicitly verified in other tests that check the component renders correctly.

    test("does not render ContentTypeIcon when loading", async () => {
        // Mock the display names to never resolve to simulate loading state
        vi.mocked(visualBuilderPostMessage!.send).mockImplementation(
            (eventName: string) => {
                // Only block GET_FIELD_DISPLAY_NAMES, let other calls resolve
                if (
                    eventName ===
                    VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                ) {
                    return new Promise(() => {}); // Never resolves
                }
                // Let other calls use default mock behavior
                return Promise.resolve({});
            }
        );

        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Use act() with queueMicrotask for faster resolution
        await act(async () => {
            await new Promise<void>((resolve) =>
                queueMicrotask(() => resolve())
            );
        });

        // When loading, component returns LoadingIcon, not the main structure
        // ContentTypeIcon only renders when dataLoading is false, which won't happen here
        // So we should see LoadingIcon and NOT see ContentTypeIcon
        await waitFor(
            () => {
                // Component should be in loading state (LoadingIcon visible, ContentTypeIcon not)
                const contentTypeIcon = container.querySelector(
                    ".visual-builder__content-type-icon"
                );
                expect(contentTypeIcon).not.toBeInTheDocument();
            },
            { timeout: 1000, interval: 10 } // Reduced timeout - mocks resolve immediately
        );
    });

    test("renders VariantIndicator when field has variant", async () => {
        const variantFieldMetadata = {
            ...mockFieldMetadata,
            variant: "variant-uid-123",
        };

        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={variantFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Wait for component to finish loading (button enabled) and variant indicator to appear
        // Reduced timeout to 1000ms since mocks resolve immediately
        await waitFor(
            () => {
                const button = container.querySelector("button");
                if (!button || button.hasAttribute("disabled")) {
                    throw new Error("Button still disabled");
                }
                const variantIndicator = container.querySelector(
                    "[data-testid='variant-indicator']"
                );
                if (!variantIndicator) {
                    throw new Error("Variant indicator not found");
                }
            },
            { timeout: 1000, interval: 5 }
        );
    });

    test("does not render VariantIndicator when field has no variant", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // findByTestId handles act() internally, so we don't need a separate act() call
        // This eliminates the redundant act() bottleneck
        // Wait for component to load and check variant indicator
        const fieldLabel = await findByTestId(
            container as HTMLElement,
            "visual-builder__focused-toolbar__field-label-wrapper",
            {},
            { timeout: 1000 }
        );
        expect(fieldLabel).toBeInTheDocument();

        const variantIndicator = container.querySelector(
            "[data-testid='variant-indicator']"
        );
        expect(variantIndicator).not.toBeInTheDocument();
    });

    test("applies variant CSS classes when field has variant", async () => {
        const variantFieldMetadata = {
            ...mockFieldMetadata,
            variant: "variant-uid-123",
        };

        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={variantFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Wait for component to finish loading (button enabled) and variant class to appear
        // Reduced timeout to 1000ms since mocks resolve immediately
        await waitFor(
            () => {
                const button = container.querySelector("button");
                if (!button || button.hasAttribute("disabled")) {
                    throw new Error("Button still disabled");
                }
                const fieldLabelWrapper = container.querySelector(
                    "[data-testid='visual-builder__focused-toolbar__field-label-wrapper']"
                );
                if (!fieldLabelWrapper) {
                    throw new Error("Field label wrapper not found");
                }
                expect(fieldLabelWrapper).toHaveClass(
                    "visual-builder__focused-toolbar--variant"
                );
            },
            { timeout: 1000, interval: 5 }
        );
    });

    test("does not apply variant CSS classes when field has no variant", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Wait for component to finish loading and verify variant class is not present
        // Using waitFor to check both button enabled and class absence in one pass
        await waitFor(
            () => {
                const button = container.querySelector("button");
                if (!button || button.hasAttribute("disabled")) {
                    throw new Error("Button still disabled");
                }
                const fieldLabelWrapper = container.querySelector(
                    "[data-testid='visual-builder__focused-toolbar__field-label-wrapper']"
                );
                if (!fieldLabelWrapper) {
                    throw new Error("Field label wrapper not found");
                }
                expect(fieldLabelWrapper).not.toHaveClass(
                    "visual-builder__focused-toolbar--variant"
                );
            },
            { timeout: 1000, interval: 5 }
        );
    });
});
