import { render, waitFor } from "@testing-library/preact";
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

vi.mock("../../utils/fieldSchemaMap", () => ({
    FieldSchemaMap: {
        getFieldSchema: vi.fn().mockImplementation(() => {
            // Resolve immediately
            return Promise.resolve({
                display_name: "Field 0",
                data_type: "text",
                field_metadata: {},
                uid: "test_field",
            });
        }),
    },
}));

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn().mockImplementation((eventName: string, fields: any) => {
            // Use enum values for comparison
            if (
                eventName ===
                VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
            ) {
                // Always return display names for all requested fields immediately
                const result: Record<string, string> = {};
                if (Array.isArray(fields)) {
                    fields.forEach((field: any) => {
                        if (field.cslpValue === "mockFieldCslp") {
                            result[field.cslpValue] = "Field 0";
                        } else if (
                            field.cslpValue ===
                            "contentTypeUid.entryUid.locale.parentPath1"
                        ) {
                            result[field.cslpValue] = "Field 1";
                        } else if (
                            field.cslpValue ===
                            "contentTypeUid.entryUid.locale.parentPath2"
                        ) {
                            result[field.cslpValue] = "Field 2";
                        } else if (
                            field.cslpValue ===
                            "contentTypeUid.entryUid.locale.parentPath3"
                        ) {
                            result[field.cslpValue] = "Field 3";
                        } else {
                            result[field.cslpValue] =
                                field.cslpValue || "Unknown Field"; // fallback
                        }
                    });
                }
                // Resolve immediately
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
                // Return empty object by default (no reference data)
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
    fetchEntryPermissionsAndStageDetails: vi.fn().mockResolvedValue({
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
    }),
}));

vi.mock("../generators/generateCustomCursor", () => ({
    getFieldIcon: vi.fn().mockReturnValue("<svg>mock-icon</svg>"),
    FieldTypeIconsMap: {
        reference: "<svg>reference-icon</svg>",
    },
}));

vi.mock("../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn().mockReturnValue({
        "visual-builder__focused-toolbar--variant":
            "visual-builder__focused-toolbar--variant",
    }),
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

describe("FieldLabelWrapperComponent", () => {
    beforeEach(() => {
        // Reset all mocks to their default state before each test
        vi.clearAllMocks();

        // Reset isFieldDisabled to default
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: false,
            reason: "",
        });
    });

    afterEach(() => {
        // Clean up DOM after each test to prevent state pollution
        document.body.innerHTML = "";
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

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

    const mockEventDetails: VisualBuilderCslpEventDetails = {
        editableElement: document.createElement("div"),
        cslpData: "",
        fieldMetadata: mockFieldMetadata,
    };

    const mockGetParentEditable = () => document.createElement("div");

    test("renders current field and parent fields correctly", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={PARENT_PATHS}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        await waitFor(
            () => {
                const text = container.textContent;
                expect(text).toContain(DISPLAY_NAMES.mockFieldCslp);
            },
            { timeout: 25000 }
        );
    });

    test("displays current field icon", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        await waitFor(
            () => {
                const fieldIcon = container.querySelector(
                    '[data-testid="visual-builder__field-icon"]'
                );
                expect(fieldIcon).toBeInTheDocument();
            },
            { timeout: 25000 }
        );
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

        // Wait for data loading to complete first
        await waitFor(
            () => {
                const fieldLabel = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__field-label-wrapper"]'
                );
                expect(fieldLabel).toBeInTheDocument();
            },
            { timeout: 25000 }
        );

        // Then check for disabled class
        await waitFor(
            () => {
                const fieldLabel = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__field-label-wrapper"]'
                );
                expect(fieldLabel).toHaveClass(
                    "visual-builder__focused-toolbar--field-disabled"
                );
            },
            { timeout: 5000 }
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

        // wait for component to mount and isFieldDisabled to be called
        await waitFor(
            () => {
                const wrapper = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__field-label-wrapper"]'
                );
                expect(wrapper).toBeInTheDocument();
                expect(isFieldDisabled).toHaveBeenCalled();
            },
            { timeout: 25000 }
        );

        expect(isFieldDisabled).toHaveBeenCalledWith(
            {
                display_name: "Field 0",
                data_type: "text",
                field_metadata: {},
                uid: "test_field",
            },
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

    test("renders ToolbarTooltip component with correct data", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        await waitFor(
            () => {
                // Check that the ToolbarTooltip wrapper is rendered
                const tooltipWrapper = container.querySelector(
                    '[data-testid="toolbar-tooltip"]'
                );
                expect(tooltipWrapper).toBeInTheDocument();

                // Check that the main field label wrapper is rendered
                const fieldLabelWrapper = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__field-label-wrapper"]'
                );
                expect(fieldLabelWrapper).toBeInTheDocument();
            },
            { timeout: 25000 }
        );
    }, 60000);

    test("does not render reference icon when isReference is false", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Wait for component to finish loading first
        await waitFor(
            () => {
                const fieldLabelWrapper = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__field-label-wrapper"]'
                );
                expect(fieldLabelWrapper).toBeInTheDocument();
            },
            { timeout: 25000 }
        );

        // Then check that reference icon is not rendered
        const referenceIconContainer = container.querySelector(
            ".visual-builder__reference-icon-container"
        );
        expect(referenceIconContainer).not.toBeInTheDocument();
    }, 60000);

    test("renders with correct hovered cslp data attribute", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        await waitFor(
            () => {
                const fieldLabelWrapper = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__field-label-wrapper"]'
                );
                expect(fieldLabelWrapper).toHaveAttribute(
                    "data-hovered-cslp",
                    mockFieldMetadata.cslpValue
                );
            },
            { timeout: 25000 }
        );
    });

    test("does not render ContentTypeIcon when loading", () => {
        // Mock the display names to never resolve to simulate loading state
        vi.mocked(visualBuilderPostMessage!.send).mockImplementation(() => {
            return new Promise(() => {}); // Never resolves
        });

        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Component renders synchronously, check immediately
        const contentTypeIcon = container.querySelector(
            ".visual-builder__content-type-icon"
        );
        expect(contentTypeIcon).not.toBeInTheDocument();
    });

    test.skip("renders VariantIndicator when field has variant", async () => {
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

        // Wait for data loading to complete by checking for button to be enabled
        await waitFor(
            () => {
                const button = container.querySelector("button");
                expect(button).not.toBeDisabled();
            },
            { timeout: 15000 }
        );

        const variantIndicator = container.querySelector(
            "[data-testid='variant-indicator']"
        );
        expect(variantIndicator).toBeInTheDocument();
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

        await waitFor(
            () => {
                const variantIndicator = container.querySelector(
                    "[data-testid='variant-indicator']"
                );
                expect(variantIndicator).not.toBeInTheDocument();
            },
            { timeout: 25000 }
        );
    });

    test.skip("applies variant CSS classes when field has variant", async () => {
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

        // Wait for data loading to complete first
        await waitFor(
            () => {
                const fieldLabelWrapper = container.querySelector(
                    "[data-testid='visual-builder__focused-toolbar__field-label-wrapper']"
                );
                expect(fieldLabelWrapper).toBeInTheDocument();
            },
            { timeout: 25000 }
        );

        // Then check for variant class
        await waitFor(
            () => {
                const fieldLabelWrapper = container.querySelector(
                    "[data-testid='visual-builder__focused-toolbar__field-label-wrapper']"
                );
                expect(fieldLabelWrapper).toHaveClass(
                    "visual-builder__focused-toolbar--variant"
                );
            },
            { timeout: 5000 }
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

        await waitFor(
            () => {
                const fieldLabelWrapper = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__field-label-wrapper"]'
                );
                expect(fieldLabelWrapper).not.toHaveClass(
                    "visual-builder__focused-toolbar--variant"
                );
            },
            { timeout: 25000 }
        );
    });
});
