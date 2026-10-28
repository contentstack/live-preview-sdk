import {
    act,
    cleanup,
    fireEvent,
    render,
    waitFor,
    screen,
    findByTestId,
} from "@testing-library/preact";
import { CslpData } from "../../../cslp/types/cslp.types";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "../../utils/instanceHandlers";
import { ISchemaFieldMap } from "../../utils/types/index.types";
import FieldToolbarComponent from "../FieldToolbar";
import {
    mockMultipleLinkFieldSchema,
    mockMultipleFileFieldSchema,
    mockMultipleCustomFieldSchema,
    mockSingleCustomFieldSchema,
} from "../../../__test__/data/fields";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { isFieldDisabled } from "../../utils/isFieldDisabled";
import React from "preact/compat";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { FieldLocationIcon } from "../FieldLocationIcon";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";

vi.mock("../../utils/instanceHandlers", () => ({
    handleMoveInstance: vi.fn(),
    handleDeleteInstance: vi.fn(),
}));

//CommentIcon testcases are covered seperatly
vi.mock("../CommentIcon", () => ({
    default: vi.fn(() => <div data-testid="vb-comment-icon">Comment Icon</div>),
}));

vi.mock("../FieldLocationIcon", () => ({
    FieldLocationIcon: vi.fn(() => (
        <div data-testid="vb-field-location-icon">Field Location Icon</div>
    )),
}));

vi.mock("../../utils/visualBuilderPostMessage", () => {
    return {
        default: {
            send: vi.fn((eventName: string) => {
                // Return mock data for FIELD_LOCATION_DATA to prevent hanging
                if (eventName === "field-location-data") {
                    return Promise.resolve({ apps: [] });
                }
                // Return mock data for get-field-variant-status to speed up variant icon test
                if (eventName === "get-field-variant-status") {
                    return Promise.resolve({
                        isAddedInstances: false,
                        isBaseModified: false,
                        isDeletedInstances: false,
                        isOrderChanged: false,
                        fieldLevelCustomizations: false,
                    });
                }
                return Promise.resolve({});
            }),
            on: vi.fn(() => ({ unregister: vi.fn() })),
        },
    };
});

vi.mock("../FieldRevert/FieldRevertComponent", async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import("../FieldRevert/FieldRevertComponent")
        >();

    return {
        ...actual,
        getFieldVariantStatus: vi.fn().mockResolvedValue({
            isAddedInstances: false,
            isBaseModified: false,
            isDeletedInstances: false,
            isOrderChanged: false,
            fieldLevelCustomizations: false,
        }),
    };
});

vi.mock("../../utils/getDiscussionIdByFieldMetaData", () => {
    return {
        getDiscussionIdByFieldMetaData: vi.fn().mockResolvedValue({
            uid: "discussionId",
        }),
    };
});

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
}));

const mockMultipleFieldMetadata: CslpData = {
    entry_uid: "",
    content_type_uid: "",
    cslpValue: "",
    locale: "",
    variant: undefined,
    fieldPath: "",
    fieldPathWithIndex: "group.link",
    multipleFieldMetadata: {
        index: 0,
        parentDetails: {
            parentPath: "group",
            parentCslpValue: "entry.contentType.locale",
        },
    },
    instance: {
        fieldPathWithIndex: "group.link.0",
    },
};

describe("FieldToolbarComponent", () => {
    let targetElement: HTMLDivElement;
    let mockEventDetails: VisualBuilderCslpEventDetails;

    beforeAll(() => {
        // Mock FieldSchemaMap to resolve immediately (synchronously)
        // This ensures the promise resolves in the same tick, making tests faster
        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockImplementation(() => 
            Promise.resolve(mockMultipleLinkFieldSchema)
        );
    });

    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        targetElement = document.createElement("div");
        targetElement.setAttribute("data-testid", "mock-target-element");
        document.body.appendChild(targetElement);

        // Create fresh mockEventDetails for each test to avoid state pollution
        mockEventDetails = {
            fieldMetadata: mockMultipleFieldMetadata,
            editableElement: targetElement,
            cslpData: "",
        };

        // Reset mocks to default state
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: false,
            reason: "",
        });
        // Ensure mock resolves immediately
        vi.mocked(FieldSchemaMap.getFieldSchema).mockImplementation(() => 
            Promise.resolve(mockMultipleLinkFieldSchema)
        );
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    // REMOVED: "renders toolbar buttons correctly" - redundant test
    // This test only checks that buttons exist, which is already covered by the click handler tests below.
    // The click tests verify buttons exist AND work correctly, making this test unnecessary.

    test("calls handleMoveInstance with 'previous' when move left button is clicked", async () => {
        const { container } = render(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Use act() to ensure React processes all state updates from async operations
        await act(async () => {
            // Give React a tick to process useEffect and state updates
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Use findByTestId which is optimized for async queries
        const moveLeftButton = await findByTestId(
            container,
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button",
            {},
            { timeout: 1000 }
        ) as HTMLElement;

        fireEvent.click(moveLeftButton);

        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata,
            "previous"
        );
    });

    test("calls handleMoveInstance with 'next' when move right button is clicked", async () => {
        const { container } = render(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Use act() to ensure React processes all state updates
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const moveRightButton = await findByTestId(
            container,
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button",
            {},
            { timeout: 1000 }
        ) as HTMLElement;

        fireEvent.click(moveRightButton);

        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata,
            "next"
        );
    });

    test("calls handleDeleteInstance when delete button is clicked", async () => {
        const { container } = render(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Use act() to ensure React processes all state updates
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const deleteButton = await findByTestId(
            container,
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button",
            {},
            { timeout: 1000 }
        ) as HTMLElement;

        fireEvent.click(deleteButton);

        expect(handleDeleteInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata
        );
    });

    test("display variant icon instead of dropdown", async () => {
        // Create a fresh copy with variant set to avoid mutation issues
        const variantEventDetails = {
            ...mockEventDetails,
            fieldMetadata: {
                ...mockEventDetails.fieldMetadata,
                variant: "variant",
            },
        };

        const { container } = render(
            <FieldToolbarComponent
                eventDetails={variantEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Use act() to ensure React processes all state updates
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Use findByTestId which is optimized for async queries
        const icon = await findByTestId(
            container,
            "visual-builder-canvas-variant-icon",
            {},
            { timeout: 1000 }
        );
        expect(icon).toBeInTheDocument();
    });

    describe("CommentIcon and FieldLocationIcon visibility on restricted fields", () => {
        const wholeMultiMetadata: CslpData = {
            ...mockMultipleFieldMetadata,
            fieldPathWithIndex: "group.link",
            instance: { fieldPathWithIndex: "group.link" },
        };

        test("renders CommentIcon and FieldLocationIcon when field is not disabled", async () => {
            vi.mocked(isFieldDisabled).mockReturnValue({
                isDisabled: false,
                reason: "" as any,
            });

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={{
                        ...mockEventDetails,
                        fieldMetadata: wholeMultiMetadata,
                    }}
                    hideOverlay={vi.fn()}
                />
            );

            await act(async () => {
                await new Promise((r) => setTimeout(r, 0));
            });

            expect(
                await findByTestId(
                    container,
                    "vb-comment-icon",
                    {},
                    { timeout: 1000 }
                )
            ).toBeInTheDocument();
            expect(
                container.querySelector('[data-testid="vb-field-location-icon"]')
            ).toBeInTheDocument();
        });

        test("hides CommentIcon and FieldLocationIcon when field is disabled (update restrict)", async () => {
            vi.mocked(isFieldDisabled).mockReturnValue({
                isDisabled: true,
                reason: "You have only read access to this field" as any,
            });

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={{
                        ...mockEventDetails,
                        fieldMetadata: wholeMultiMetadata,
                    }}
                    hideOverlay={vi.fn()}
                />
            );

            await act(async () => {
                await new Promise((r) => setTimeout(r, 0));
            });

            await findByTestId(
                container,
                "visual-builder__focused-toolbar__multiple-field-toolbar",
                {},
                { timeout: 1000 }
            );

            expect(
                container.querySelector('[data-testid="vb-comment-icon"]')
            ).not.toBeInTheDocument();
            expect(
                container.querySelector('[data-testid="vb-field-location-icon"]')
            ).not.toBeInTheDocument();
        });
    });

    describe("Custom field multiple — toolbar visibility", () => {
        const customFieldInstanceMetadata: CslpData = {
            ...mockMultipleFieldMetadata,
            fieldPathWithIndex: "custom_field",
            multipleFieldMetadata: {
                index: 0,
                parentDetails: {
                    parentPath: "custom_field",
                    parentCslpValue: "entry.ct.en-us",
                },
            },
            instance: { fieldPathWithIndex: "custom_field.0" },
        };

        const customFieldWholeMetadata: CslpData = {
            ...mockMultipleFieldMetadata,
            fieldPathWithIndex: "custom_field",
            instance: { fieldPathWithIndex: "custom_field" },
        };

        test("renders info message for a multiple custom field instance", async () => {
            vi.mocked(FieldSchemaMap.getFieldSchema).mockImplementation(() =>
                Promise.resolve(mockMultipleCustomFieldSchema)
            );

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={{
                        ...mockEventDetails,
                        fieldMetadata: customFieldInstanceMetadata,
                    }}
                    hideOverlay={vi.fn()}
                />
            );

            await act(async () => {
                await new Promise((r) => setTimeout(r, 0));
            });

            expect(
                await findByTestId(
                    container,
                    "visual-builder__custom-field-instance-message",
                    {},
                    { timeout: 1000 }
                )
            ).toBeInTheDocument();

            expect(
                container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar"]'
                )
            ).not.toBeInTheDocument();
        });

        test("shows edit button for a multiple custom field whole-field selection", async () => {
            vi.mocked(FieldSchemaMap.getFieldSchema).mockImplementation(() =>
                Promise.resolve(mockMultipleCustomFieldSchema)
            );

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={{
                        ...mockEventDetails,
                        fieldMetadata: customFieldWholeMetadata,
                    }}
                    hideOverlay={vi.fn()}
                />
            );

            await act(async () => {
                await new Promise((r) => setTimeout(r, 0));
            });

            const editButton = await findByTestId(
                container,
                "visual-builder__focused-toolbar__multiple-field-toolbar__edit-button",
                {},
                { timeout: 1000 }
            );
            expect(editButton).toBeInTheDocument();
        });

        test("shows edit button for a single (non-multiple) custom field", async () => {
            vi.mocked(FieldSchemaMap.getFieldSchema).mockImplementation(() =>
                Promise.resolve(mockSingleCustomFieldSchema)
            );

            const singleCustomFieldMetadata: CslpData = {
                ...mockMultipleFieldMetadata,
                fieldPathWithIndex: "custom_field",
                multipleFieldMetadata: {
                    index: -1,
                    parentDetails: null,
                },
                instance: { fieldPathWithIndex: "custom_field" },
            };

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={{
                        ...mockEventDetails,
                        fieldMetadata: singleCustomFieldMetadata,
                    }}
                    hideOverlay={vi.fn()}
                />
            );

            await act(async () => {
                await new Promise((r) => setTimeout(r, 0));
            });

            const editButton = await findByTestId(
                container,
                "visual-builder__focused-toolbar__multiple-field-toolbar__edit-button",
                {},
                { timeout: 1000 }
            );
            expect(editButton).toBeInTheDocument();
        });
    });

    describe("'Replace button' visibility for multiple file fields", () => {
        beforeEach(() => {
            // Override the mock for this describe block - resolve immediately
            vi.mocked(FieldSchemaMap.getFieldSchema).mockImplementation(() => 
                Promise.resolve(mockMultipleFileFieldSchema)
            );
        });

        afterEach(() => {
            // Restore will happen in outer afterEach via clearAllMocks
        });

        test("'replace button' is hidden for parent wrapper of multiple file field", async () => {
            const parentWrapperMetadata: CslpData = {
                ...mockMultipleFieldMetadata,
                fieldPathWithIndex: "files",
                instance: {
                    fieldPathWithIndex: "files",
                },
            };

            const parentWrapperEventDetails = {
                ...mockEventDetails,
                fieldMetadata: parentWrapperMetadata,
            };

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={parentWrapperEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            // Use act() to ensure React processes all state updates
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Wait for toolbar to render first, then check button is not present
            const toolbar = await findByTestId(
                container,
                "visual-builder__focused-toolbar__multiple-field-toolbar",
                {},
                { timeout: 1000 }
            );
            expect(toolbar).toBeInTheDocument();
            
            const replaceButton = container.querySelector(
                '[data-testid="visual-builder-replace-file"]'
            );
            expect(replaceButton).not.toBeInTheDocument();
        });

        test("'replace button' is visible for individual field in multiple file field", async () => {
            const individualFieldMetadata: CslpData = {
                ...mockMultipleFieldMetadata,
                fieldPathWithIndex: "files",
                instance: {
                    fieldPathWithIndex: "files.0",
                },
            };

            const individualFieldEventDetails = {
                ...mockEventDetails,
                fieldMetadata: individualFieldMetadata,
            };

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={individualFieldEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            // Use act() to ensure React processes all state updates
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Use findByTestId which is optimized for async queries
            const replaceButton = await findByTestId(
                container,
                "visual-builder-replace-file",
                {},
                { timeout: 1000 }
            );
            expect(replaceButton).toBeInTheDocument();
        });

        test("passes disabled state correctly to child components when field is disabled", async () => {
            // Mock isFieldDisabled to return disabled state
            vi.mocked(isFieldDisabled).mockReturnValue({
                isDisabled: true,
                reason: "You have only read access to this field" as any,
            });

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={mockEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            // Use act() to ensure React processes all state updates
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Use findByTestId for toolbar, then query for buttons
            const toolbar = await findByTestId(
                container,
                "visual-builder__focused-toolbar__multiple-field-toolbar",
                {},
                { timeout: 1000 }
            );

            // Check that move buttons are disabled
            const moveLeftButton = container.querySelector(
                '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"]'
            );
            const moveRightButton = container.querySelector(
                '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"]'
            );
            const deleteButton = container.querySelector(
                '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"]'
            );

            expect(moveLeftButton).toBeInTheDocument();
            expect(moveRightButton).toBeInTheDocument();
            expect(deleteButton).toBeInTheDocument();
            expect(moveLeftButton).toBeDisabled();
            expect(moveRightButton).toBeDisabled();
            expect(deleteButton).toBeDisabled();

            // Check that edit button is disabled if present
            const editButton = container.querySelector(
                '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__edit-button"]'
            );
            if (editButton) {
                expect(editButton).toBeDisabled();
            }

            // Check that replace button is disabled if present
            const replaceButton = container.querySelector(
                '[data-testid="visual-builder-replace-file"]'
            );
            if (replaceButton) {
                expect(replaceButton).toBeDisabled();
            }
        });
    });

    describe("Select field toolbar", () => {
        const selectSchema = (multiple: boolean) =>
            ({
                data_type: "text",
                display_name: "Badges",
                uid: "badges",
                display_type: "dropdown",
                enum: {
                    advanced: false,
                    choices: [{ value: "a" }, { value: "b" }],
                },
                multiple,
                mandatory: false,
                non_localizable: false,
                unique: false,
                field_metadata: { description: "", default_value: "" },
            }) as unknown as ISchemaFieldMap;

        const EDIT_ID =
            "visual-builder__focused-toolbar__multiple-field-toolbar__edit-button";
        const PREFIX = "visual-builder__focused-toolbar__multiple-field-toolbar";

        const singleMetadata: CslpData = {
            ...mockMultipleFieldMetadata,
            fieldPath: "badges",
            fieldPathWithIndex: "badges",
            multipleFieldMetadata: { index: -1, parentDetails: null },
            instance: { fieldPathWithIndex: "badges" },
        };

        const renderSelect = async (
            schema: ISchemaFieldMap,
            fieldMetadata: CslpData
        ) => {
            vi.mocked(FieldSchemaMap.getFieldSchema).mockImplementation(() =>
                Promise.resolve(schema)
            );
            const utils = render(
                <FieldToolbarComponent
                    eventDetails={{ ...mockEventDetails, fieldMetadata }}
                    hideOverlay={vi.fn()}
                />
            );
            await act(async () => {
                await new Promise((r) => setTimeout(r, 0));
            });
            return utils;
        };

        test("single select shows edit button that opens the edit modal", async () => {
            const { container } = await renderSelect(
                selectSchema(false),
                singleMetadata
            );

            const editButton = await findByTestId(
                container,
                EDIT_ID,
                {},
                { timeout: 1000 }
            );
            fireEvent.click(editButton);

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
                { fieldMetadata: singleMetadata }
            );
        });

        test("multiple select value click shows edit without move or delete", async () => {
            const { container } = await renderSelect(selectSchema(true), {
                ...singleMetadata,
                fieldPathWithIndex: "badges",
                multipleFieldMetadata: {
                    index: 1,
                    parentDetails: {
                        parentPath: "badges",
                        parentCslpValue: "entry.ct.en-us",
                    },
                },
                instance: { fieldPathWithIndex: "badges.1" },
            });

            expect(
                await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
            ).toBeInTheDocument();
            for (const id of ["move-left", "move-right", "delete"]) {
                expect(
                    container.querySelector(
                        `[data-testid="${PREFIX}__${id}-button"]`
                    )
                ).not.toBeInTheDocument();
            }
        });

        test("multiple select value click sends whole-field metadata on edit", async () => {
            const valueMetadata: CslpData = {
                ...singleMetadata,
                multipleFieldMetadata: {
                    index: 1,
                    parentDetails: {
                        parentPath: "badges",
                        parentCslpValue: "entry.ct.en-us",
                    },
                },
                instance: { fieldPathWithIndex: "badges.1" },
            };
            const { container } = await renderSelect(
                selectSchema(true),
                valueMetadata
            );

            fireEvent.click(
                await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
            );

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
                {
                    fieldMetadata: {
                        ...valueMetadata,
                        instance: { fieldPathWithIndex: "badges" },
                        multipleFieldMetadata: {
                            ...valueMetadata.multipleFieldMetadata,
                            index: -1,
                        },
                    },
                }
            );
            expect(valueMetadata.instance.fieldPathWithIndex).toBe("badges.1");
        });

        test("multiple select whole-field click shows edit without move or delete", async () => {
            const { container } = await renderSelect(selectSchema(true), {
                ...singleMetadata,
                instance: { fieldPathWithIndex: "badges" },
            });

            expect(
                await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
            ).toBeInTheDocument();
            for (const id of ["move-left", "move-right", "delete"]) {
                expect(
                    container.querySelector(
                        `[data-testid="${PREFIX}__${id}-button"]`
                    )
                ).not.toBeInTheDocument();
            }
        });

        test("edit button is disabled when the select field is disabled", async () => {
            vi.mocked(isFieldDisabled).mockReturnValue({
                isDisabled: true,
                reason: "",
            } as ReturnType<typeof isFieldDisabled>);
            const { container } = await renderSelect(
                selectSchema(false),
                singleMetadata
            );

            expect(
                await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
            ).toBeDisabled();
        });
    });

    describe("Boolean field toolbar", () => {
        const booleanSchema = {
            data_type: "boolean",
            display_name: "Featured",
            uid: "featured",
            field_metadata: { description: "", default_value: false },
            multiple: false,
            mandatory: false,
            unique: false,
            non_localizable: false,
        } as unknown as ISchemaFieldMap;

        const fileSchema = {
            data_type: "file",
            display_name: "Cover",
            uid: "cover",
            field_metadata: { description: "", rich_text_type: "" },
            multiple: false,
            mandatory: false,
            unique: false,
            non_localizable: false,
        } as unknown as ISchemaFieldMap;

        const EDIT_ID =
            "visual-builder__focused-toolbar__multiple-field-toolbar__edit-button";
        const TOOLBAR_ID =
            "visual-builder__focused-toolbar__multiple-field-toolbar";

        const booleanMetadata: CslpData = {
            ...mockMultipleFieldMetadata,
            fieldPath: "featured",
            fieldPathWithIndex: "featured",
            multipleFieldMetadata: { index: -1, parentDetails: null },
            instance: { fieldPathWithIndex: "featured" },
        };

        const renderField = async (
            schema: ISchemaFieldMap,
            fieldMetadata: CslpData
        ) => {
            vi.mocked(FieldSchemaMap.getFieldSchema).mockImplementation(() =>
                Promise.resolve(schema)
            );
            const utils = render(
                <FieldToolbarComponent
                    eventDetails={{ ...mockEventDetails, fieldMetadata }}
                    hideOverlay={vi.fn()}
                />
            );
            await act(async () => {
                await new Promise((r) => setTimeout(r, 0));
            });
            return utils;
        };

        test("boolean field shows the edit button", async () => {
            const { container } = await renderField(
                booleanSchema,
                booleanMetadata
            );

            expect(
                await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
            ).toBeInTheDocument();
        });

        test("clicking the edit button opens the edit modal with the field metadata", async () => {
            const { container } = await renderField(
                booleanSchema,
                booleanMetadata
            );

            fireEvent.click(
                await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
            );

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
                { fieldMetadata: booleanMetadata }
            );
        });

        test("edit button is disabled when the boolean field is disabled", async () => {
            vi.mocked(isFieldDisabled).mockReturnValue({
                isDisabled: true,
                reason: "",
            } as ReturnType<typeof isFieldDisabled>);
            const { container } = await renderField(
                booleanSchema,
                booleanMetadata
            );

            expect(
                await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
            ).toBeDisabled();
        });

        test("boolean field has no replace button", async () => {
            const { container } = await renderField(
                booleanSchema,
                booleanMetadata
            );

            await findByTestId(container, EDIT_ID, {}, { timeout: 1000 });
            expect(
                container.querySelector(
                    '[data-testid="visual-builder-replace-boolean"]'
                )
            ).not.toBeInTheDocument();
        });

        test("a field type that is not editable in the modal keeps its toolbar without an edit button", async () => {
            const { container } = await renderField(fileSchema, {
                ...booleanMetadata,
                fieldPath: "cover",
                fieldPathWithIndex: "cover",
                instance: { fieldPathWithIndex: "cover" },
            });

            expect(
                await findByTestId(
                    container,
                    "visual-builder-replace-file",
                    {},
                    { timeout: 1000 }
                )
            ).toBeInTheDocument();
            expect(
                container.querySelector(`[data-testid="${TOOLBAR_ID}"]`)
            ).toBeInTheDocument();
            expect(
                container.querySelector(`[data-testid="${EDIT_ID}"]`)
            ).not.toBeInTheDocument();
        });
    });

    describe("Taxonomy field toolbar", () => {
        const taxonomySchema = {
            data_type: "taxonomy",
            display_name: "Taxonomies",
            uid: "taxonomies",
            multiple: true,
            mandatory: false,
            non_localizable: false,
            unique: false,
            taxonomies: [{ taxonomy_uid: "colors", non_localizable: false }],
        } as unknown as ISchemaFieldMap;

        const termMetadata: CslpData = {
            ...mockMultipleFieldMetadata,
            fieldPath: "taxonomies",
            fieldPathWithIndex: "taxonomies",
            multipleFieldMetadata: {
                index: 1,
                parentDetails: {
                    parentPath: "taxonomies",
                    parentCslpValue: "entry.ct.en-us",
                },
            },
            instance: { fieldPathWithIndex: "taxonomies.1" },
        };

        const TAX_EDIT_ID =
            "visual-builder__focused-toolbar__multiple-field-toolbar__edit-button";
        const TAX_PREFIX =
            "visual-builder__focused-toolbar__multiple-field-toolbar";

        const renderTaxonomy = async (fieldMetadata: CslpData) => {
            vi.mocked(FieldSchemaMap.getFieldSchema).mockImplementation(() =>
                Promise.resolve(taxonomySchema)
            );
            const view = render(
                <FieldToolbarComponent
                    eventDetails={{ ...mockEventDetails, fieldMetadata }}
                    hideOverlay={vi.fn()}
                />
            );
            await act(async () => {
                await new Promise((r) => setTimeout(r, 0));
            });
            return view;
        };

        const expectNoMoveOrDelete = (container: HTMLElement) => {
            for (const id of ["move-left", "move-right", "delete"]) {
                expect(
                    container.querySelector(
                        `[data-testid="${TAX_PREFIX}__${id}-button"]`
                    )
                ).not.toBeInTheDocument();
            }
        };

        test("term click shows edit without move or delete", async () => {
            const { container } = await renderTaxonomy(termMetadata);

            expect(
                await findByTestId(container, TAX_EDIT_ID, {}, { timeout: 1000 })
            ).toBeInTheDocument();
            expectNoMoveOrDelete(container);
        });

        test("term click inside a modular block keeps the parent index on edit", async () => {
            const blockTermMetadata: CslpData = {
                ...termMetadata,
                fieldPath: "blocks.section.taxonomies",
                fieldPathWithIndex: "blocks.0.section.taxonomies",
                multipleFieldMetadata: {
                    index: 2,
                    parentDetails: {
                        parentPath: "blocks.0.section.taxonomies",
                        parentCslpValue: "entry.ct.en-us",
                    },
                },
                instance: {
                    fieldPathWithIndex: "blocks.0.section.taxonomies.2",
                },
            };
            const { container } = await renderTaxonomy(blockTermMetadata);

            fireEvent.click(
                await findByTestId(container, TAX_EDIT_ID, {}, { timeout: 1000 })
            );

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
                {
                    fieldMetadata: {
                        ...blockTermMetadata,
                        instance: {
                            fieldPathWithIndex: "blocks.0.section.taxonomies",
                        },
                        multipleFieldMetadata: {
                            ...blockTermMetadata.multipleFieldMetadata,
                            index: -1,
                        },
                    },
                }
            );
            expect(blockTermMetadata.instance.fieldPathWithIndex).toBe(
                "blocks.0.section.taxonomies.2"
            );
            expect(blockTermMetadata.multipleFieldMetadata.index).toBe(2);
        });

        test("whole-list click shows edit without move or delete", async () => {
            const { container } = await renderTaxonomy({
                ...termMetadata,
                multipleFieldMetadata: { index: -1, parentDetails: null },
                instance: { fieldPathWithIndex: "taxonomies" },
            });

            expect(
                await findByTestId(container, TAX_EDIT_ID, {}, { timeout: 1000 })
            ).toBeInTheDocument();
            expectNoMoveOrDelete(container);
        });

        test("term click sends whole-field metadata on edit", async () => {
            const { container } = await renderTaxonomy(termMetadata);

            fireEvent.click(
                await findByTestId(container, TAX_EDIT_ID, {}, { timeout: 1000 })
            );

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
                {
                    fieldMetadata: {
                        ...termMetadata,
                        instance: { fieldPathWithIndex: "taxonomies" },
                        multipleFieldMetadata: {
                            ...termMetadata.multipleFieldMetadata,
                            index: -1,
                        },
                    },
                }
            );
            expect(termMetadata.instance.fieldPathWithIndex).toBe(
                "taxonomies.1"
            );
        });

        test("edit button is disabled when the taxonomy field is disabled", async () => {
            vi.mocked(isFieldDisabled).mockReturnValue({
                isDisabled: true,
                reason: "",
            } as ReturnType<typeof isFieldDisabled>);
            const { container } = await renderTaxonomy(termMetadata);

            expect(
                await findByTestId(container, TAX_EDIT_ID, {}, { timeout: 1000 })
            ).toBeDisabled();
        });
    });
});
