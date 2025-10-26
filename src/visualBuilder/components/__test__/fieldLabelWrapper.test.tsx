import { waitFor } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../fieldLabelWrapper";
import { CslpData } from "../../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import { asyncRender } from "../../../__test__/utils";
import { isFieldDisabled } from "../../utils/isFieldDisabled";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
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
    )
}));

vi.mock("../../utils/fieldSchemaMap", () => ({
    FieldSchemaMap: {
        getFieldSchema: vi.fn().mockResolvedValue({
            display_name: "Field 0",
            data_type: "text",
            field_metadata: {},
            uid: "test_field"
        }),
    },
}));

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn().mockImplementation((eventName: string, fields: any) => {
            if (eventName === "GET_FIELD_DISPLAY_NAMES") {
                // Always return display names for all requested fields
                const result: Record<string, string> = {};
                fields.forEach((field: any) => {
                    if (field.cslpValue === "mockFieldCslp") {
                        result[field.cslpValue] = "Field 0";
                    } else if (field.cslpValue === "contentTypeUid.entryUid.locale.parentPath1") {
                        result[field.cslpValue] = "Field 1";
                    } else if (field.cslpValue === "contentTypeUid.entryUid.locale.parentPath2") {
                        result[field.cslpValue] = "Field 2";
                    } else if (field.cslpValue === "contentTypeUid.entryUid.locale.parentPath3") {
                        result[field.cslpValue] = "Field 3";
                    } else {
                        result[field.cslpValue] = field.cslpValue; // fallback
                    }
                });
                return Promise.resolve(result);
            } else if(eventName === "GET_CONTENT_TYPE_NAME") {
                return Promise.resolve({
                    contentTypeName: "Page CT",
                });
            } else if(eventName === "REFERENCE_MAP") {
                return Promise.resolve({
                    "mockEntryUid": [
                        {
                            contentTypeUid: "mockContentTypeUid",
                            contentTypeTitle: "Page CT",
                            referenceFieldName: "Reference Field",
                        }
                    ]
                });
            }
            return Promise.resolve({});
        }),
    },
}));

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
}));

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
    fetchEntryPermissionsAndStageDetails: async () => ({
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
        "visual-builder__focused-toolbar--variant": "visual-builder__focused-toolbar--variant"
    }),
}));

vi.mock("../VariantIndicator", () => ({
    VariantIndicator: () => <div data-testid="variant-indicator">Variant</div>
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
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: false,
            reason: "",
        });

        // Reset the mock implementation to the default one
        vi.mocked(visualBuilderPostMessage!.send).mockImplementation((eventName: string, fields: any) => {
            if (eventName === "GET_FIELD_DISPLAY_NAMES") {
                // Always return display names for all requested fields
                const result: Record<string, string> = {};
                fields.forEach((field: any) => {
                    if (field.cslpValue === "mockFieldCslp") {
                        result[field.cslpValue] = "Field 0";
                    } else if (field.cslpValue === "contentTypeUid.entryUid.locale.parentPath1") {
                        result[field.cslpValue] = "Field 1";
                    } else if (field.cslpValue === "contentTypeUid.entryUid.locale.parentPath2") {
                        result[field.cslpValue] = "Field 2";
                    } else if (field.cslpValue === "contentTypeUid.entryUid.locale.parentPath3") {
                        result[field.cslpValue] = "Field 3";
                    } else {
                        result[field.cslpValue] = field.cslpValue; // fallback
                    }
                });
                return Promise.resolve(result);
            } else if(eventName === "GET_CONTENT_TYPE_NAME") {
                return Promise.resolve({
                    contentTypeName: "Page CT",
                });
            } else if(eventName === "REFERENCE_MAP") {
                return Promise.resolve({
                    "mockEntryUid": [
                        {
                            contentTypeUid: "mockContentTypeUid",
                            contentTypeTitle: "Page CT",
                            referenceFieldName: "Reference Field",
                        }
                    ]
                });
            }
            return Promise.resolve({});
        });
    });

    afterEach(() => {
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
        const { findByText } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={PARENT_PATHS}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const currentField = await findByText(DISPLAY_NAMES.mockFieldCslp, {}, { timeout: 15000 });
        expect(currentField).toBeVisible();
    }, { timeout: 20000 });

    test("displays current field icon", async () => {
        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const fieldIcon = await findByTestId("visual-builder__field-icon");
        expect(fieldIcon).toBeInTheDocument();
    });

    test("renders with correct class when field is disabled", async () => {
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: true,
            reason: "You have only read access to this field",
        });
        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const fieldLabel = await findByTestId(
            "visual-builder__focused-toolbar__field-label-wrapper"
        );

        await waitFor(() => {
            expect(fieldLabel).toHaveClass(
                "visual-builder__focused-toolbar--field-disabled"
            );
        });
    });

    test("calls isFieldDisabled with correct arguments", async () => {
        const mockFieldSchema = { ...singleLineFieldSchema };

        vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue(
            mockFieldSchema
        );

        await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // wait for component to mount
        await waitFor(() => {
            expect(
                document.querySelector(
                    ".visual-builder__focused-toolbar__field-label-container"
                )
            ).toBeInTheDocument();
        });

        expect(isFieldDisabled).toHaveBeenCalledWith(
            mockFieldSchema,
            mockEventDetails,
            undefined,
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
        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );
        
        // Check that the ToolbarTooltip wrapper is rendered
        const tooltipWrapper = await findByTestId("toolbar-tooltip", { timeout: 15000 });
        expect(tooltipWrapper).toBeInTheDocument();
        
        // Check that the main field label wrapper is rendered
        const fieldLabelWrapper = await findByTestId("visual-builder__focused-toolbar__field-label-wrapper", { timeout: 15000 });
        expect(fieldLabelWrapper).toBeInTheDocument();
    }, { timeout: 20000 });

    test("does not render reference icon when isReference is false", async () => {
        const { container } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        await waitFor(() => {
            const referenceIconContainer = container.querySelector(".visual-builder__reference-icon-container");
            expect(referenceIconContainer).not.toBeInTheDocument();
        });
    });

    test("renders with correct hovered cslp data attribute", async () => {
        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const fieldLabelWrapper = await findByTestId("visual-builder__focused-toolbar__field-label-wrapper");
        expect(fieldLabelWrapper).toHaveAttribute("data-hovered-cslp", mockFieldMetadata.cslpValue);
    });

    test("does not render ContentTypeIcon when loading", async () => {
        // Mock the display names to never resolve to simulate loading state
        vi.mocked(visualBuilderPostMessage!.send).mockImplementation(() => {
            return new Promise(() => {}); // Never resolves
        });

        const { container } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Wait a bit to ensure the component has time to render
        await new Promise(resolve => setTimeout(resolve, 100));

        const contentTypeIcon = container.querySelector(".visual-builder__content-type-icon");
        expect(contentTypeIcon).not.toBeInTheDocument();
    });

    test("renders VariantIndicator when field has variant", async () => {
        const variantFieldMetadata = {
            ...mockFieldMetadata,
            variant: "variant-uid-123"
        };

        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={variantFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const variantIndicator = await findByTestId("variant-indicator");
        expect(variantIndicator).toBeInTheDocument();
    });

    test("does not render VariantIndicator when field has no variant", async () => {
        const { container } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        await waitFor(() => {
            const variantIndicator = container.querySelector("[data-testid='variant-indicator']");
            expect(variantIndicator).not.toBeInTheDocument();
        });
    });

    test("applies variant CSS classes when field has variant", async () => {
        const variantFieldMetadata = {
            ...mockFieldMetadata,
            variant: "variant-uid-123"
        };

        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={variantFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const fieldLabelWrapper = await findByTestId("visual-builder__focused-toolbar__field-label-wrapper");
        
        await waitFor(() => {
            expect(fieldLabelWrapper).toHaveClass("visual-builder__focused-toolbar--variant");
        });
    });

    test("does not apply variant CSS classes when field has no variant", async () => {
        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const fieldLabelWrapper = await findByTestId("visual-builder__focused-toolbar__field-label-wrapper");
        
        await waitFor(() => {
            expect(fieldLabelWrapper).not.toHaveClass("visual-builder__focused-toolbar--variant");
        });
    });
});
