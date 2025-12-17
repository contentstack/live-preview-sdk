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
    default: vi.fn(() => <div>Comment Icon</div>),
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
});
