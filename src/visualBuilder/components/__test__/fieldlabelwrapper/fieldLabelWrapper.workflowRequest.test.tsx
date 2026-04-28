import { render, waitFor, act, findByTestId, screen } from "@testing-library/preact";
import { fireEvent } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../../fieldLabelWrapper";
import { VisualBuilderCslpEventDetails } from "../../../types/visualBuilder.types";
import { singleLineFieldSchema } from "../../../../__test__/data/fields";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import { fetchEntryPermissionsAndStageDetails } from "../../../utils/fetchEntryPermissionsAndStageDetails";
import { WORKFLOW_STAGES } from "../../../utils/constants";
import React from "preact/compat";
import Config from "../../../../configManager/configManager";
import { VisualBuilder } from "../../../index";
import { mockFieldMetadata } from "./fieldLabelWrapper.mocks";

const testFieldSchemaCache: Record<string, Record<string, any>> = {};

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
    fetchEntryPermissionsAndStageDetails: vi.fn(),
}));

vi.mock("../generators/generateCustomCursor", () => ({
    getFieldIcon: vi.fn().mockReturnValue("<svg>mock-icon</svg>"),
    FieldTypeIconsMap: {
        reference: "<svg>reference-icon</svg>",
    },
}));

vi.mock("../../../visualBuilder.style", async () => {
    const { mockStyles } = await import("./fieldLabelWrapper.mocks");
    return {
        visualBuilderStyles: vi.fn(() => mockStyles),
    };
});

vi.mock("../../VariantIndicator", () => ({
    VariantIndicator: () => <div data-testid="variant-indicator">Variant</div>,
}));

vi.mock("../../../utils/errorHandling", () => ({
    hasPostMessageError: vi.fn().mockReturnValue(false),
}));

const workflowRequestEditAccessResponse = {
    acl: {
        update: true,
        create: true,
        read: true,
        delete: true,
        publish: true,
    },
    workflowStage: {
        stage: { name: WORKFLOW_STAGES.REVIEW },
        permissions: {
            entry: {
                update: false,
            },
        },
        requestEditAccess: { canRequest: true, hasPending: false },
    },
    resolvedVariantPermissions: {
        update: true,
    },
};

describe("FieldLabelWrapperComponent — workflow request edit access", () => {
    const mockEventDetails: VisualBuilderCslpEventDetails = {
        editableElement: document.createElement("div"),
        cslpData: "",
        fieldMetadata: mockFieldMetadata,
    };

    const mockGetParentEditable = () => document.createElement("div");

    beforeEach(() => {
        vi.clearAllMocks();

        Config.get = () =>
            ({
                stackDetails: { masterLocale: "en-us" },
                editButton: { position: "bottom-right" },
            }) as ReturnType<typeof Config.get>;

        VisualBuilder.VisualBuilderGlobalState = {
            value: {
                locale: "en-us",
                variant: undefined,
                audienceMode: false,
            },
        } as typeof VisualBuilder.VisualBuilderGlobalState;

        vi.mocked(fetchEntryPermissionsAndStageDetails).mockResolvedValue(
            workflowRequestEditAccessResponse
        );

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

    it("renders Request Edit Access and workflow tooltip class when canRequest", async () => {
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
            { timeout: 10000 }
        );

        await waitFor(
            () => {
                expect(screen.getByText("Request Edit Access")).toBeTruthy();
            },
            { timeout: 10000 }
        );

        expect(
            container.querySelector(
                ".visual-builder__custom-tooltip--workflow-access"
            )
        ).toBeTruthy();
    });

    it("renders pending copy when hasPending", async () => {
        vi.mocked(fetchEntryPermissionsAndStageDetails).mockResolvedValue({
            ...workflowRequestEditAccessResponse,
            workflowStage: {
                stage: { name: WORKFLOW_STAGES.REVIEW },
                permissions: { entry: { update: false } },
                requestEditAccess: {
                    canRequest: false,
                    hasPending: true,
                },
            },
        });

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
            { timeout: 10000 }
        );

        await waitFor(
            () => {
                expect(
                    screen.getByText(/awaiting approval/i)
                ).toBeTruthy();
            },
            { timeout: 10000 }
        );

        expect(
            container.querySelector(
                ".visual-builder__custom-tooltip--workflow-access"
            )
        ).toBeTruthy();
    });

    it("sends OPEN_REQUEST_EDIT_ACCESS when Request Edit Access is clicked", async () => {
        render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        await waitFor(
            () => {
                expect(screen.getByText("Request Edit Access")).toBeTruthy();
            },
            { timeout: 10000 }
        );

        fireEvent.click(screen.getByText("Request Edit Access"));

        expect(visualBuilderPostMessage!.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.OPEN_REQUEST_EDIT_ACCESS,
            {
                entryUid: mockFieldMetadata.entry_uid,
                contentTypeUid: mockFieldMetadata.content_type_uid,
                locale: mockFieldMetadata.locale,
                variantUid: mockFieldMetadata.variant,
            }
        );
    });
});
