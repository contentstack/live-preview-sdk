import {
    act,
    cleanup,
    fireEvent,
    render,
    waitFor,
    screen,
    queryByTestId,
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
import { asyncRender } from "../../../__test__/utils";
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
                return Promise.resolve({});
            }),
            on: vi.fn(() => ({ unregister: vi.fn() })),
        },
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

vi.mock("../FieldRevert/FieldRevertComponent", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../FieldRevert/FieldRevertComponent")>();
    
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
        // Mock FieldSchemaMap once for all tests
        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue(
            mockMultipleLinkFieldSchema
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
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    test.skip("renders toolbar buttons correctly", async () => {
        const { getByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Use getByTestId instead of findByTestId since elements should be immediately available
        const moveLeftButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        const moveRightButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        const deleteButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );

        expect(moveLeftButton).toBeInTheDocument();
        expect(moveRightButton).toBeInTheDocument();
        expect(deleteButton).toBeInTheDocument();
    });

    test.skip("calls handleMoveInstance with 'previous' when move left button is clicked", async () => {
        const { getByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        const moveLeftButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );

        fireEvent.click(moveLeftButton);

        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata,
            "previous"
        );
    });

    test.skip("calls handleMoveInstance with 'next' when move right button is clicked", async () => {
        const { getByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        const moveRightButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );

        fireEvent.click(moveRightButton);

        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata,
            "next"
        );
    });

    test.skip("calls handleDeleteInstance when delete button is clicked", async () => {
        const { getByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        const deleteButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );

        fireEvent.click(deleteButton);

        expect(handleDeleteInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata
        );
    });
    test.skip("display variant icon instead of dropdown", async () => {
        // Create a fresh copy with variant set to avoid mutation issues
        const variantEventDetails = {
            ...mockEventDetails,
            fieldMetadata: {
                ...mockEventDetails.fieldMetadata,
                variant: "variant",
            },
        };

        const { getByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={variantEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Give component a tick to fully render variant icon
        await new Promise((resolve) => setTimeout(resolve, 0));

        const variantIcon = getByTestId("visual-builder-canvas-variant-icon");
        expect(variantIcon).toBeInTheDocument();
    });

    describe("'Replace button' visibility for multiple file fields", () => {
        beforeAll(() => {
            // Override the mock for this describe block
            vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue(
                mockMultipleFileFieldSchema
            );
        });

        afterAll(() => {
            // Restore the original mock
            vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue(
                mockMultipleLinkFieldSchema
            );
        });

        test.skip("'replace button' is hidden for parent wrapper of multiple file field", async () => {
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

            const { container } = await asyncRender(
                <FieldToolbarComponent
                    eventDetails={parentWrapperEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            const replaceButton = container.querySelector(
                '[data-testid="visual-builder-replace-file"]'
            );
            expect(replaceButton).not.toBeInTheDocument();
        });

        test.skip("'replace button' is visible for individual field in multiple file field", async () => {
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

            const { container } = await asyncRender(
                <FieldToolbarComponent
                    eventDetails={individualFieldEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            const replaceButton = container.querySelector(
                '[data-testid="visual-builder-replace-file"]'
            );
            expect(replaceButton).toBeInTheDocument();
        });
    });

    test.skip("passes disabled state correctly to child components when field is disabled", async () => {
        // Mock isFieldDisabled to return disabled state
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: true,
            reason: "You have only read access to this field" as any,
        });

        const { getByTestId, queryByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        const toolbar = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar"
        );
        expect(toolbar).toBeInTheDocument();

        // Check that move buttons are disabled
        const moveLeftButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        const moveRightButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        const deleteButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );

        expect(moveLeftButton).toBeDisabled();
        expect(moveRightButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();

        // Check that edit button is disabled if present
        const editButton = queryByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__edit-button"
        );
        if (editButton) {
            expect(editButton).toBeDisabled();
        }

        // Check that replace button is disabled if present
        const replaceButton = document.querySelector(
            '[data-testid="visual-builder-replace-file"]'
        );
        if (replaceButton) {
            expect(replaceButton).toBeDisabled();
        }
    });
});
