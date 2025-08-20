import { act, cleanup, fireEvent, render, waitFor, screen, queryByTestId } from "@testing-library/preact";
import { CslpData } from "../../../cslp/types/cslp.types";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "../../utils/instanceHandlers";
import { ISchemaFieldMap } from "../../utils/types/index.types";
import FieldToolbarComponent from "../FieldToolbar";
import { mockMultipleLinkFieldSchema, mockMultipleFileFieldSchema } from "../../../__test__/data/fields";
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
    default: vi.fn(() => <div>Comment Icon</div>)
  }));

vi.mock("../../utils/visualBuilderPostMessage", async () => {
    return {
        default: {
            send: vi.fn().mockImplementation((_eventName: string) => {
                return Promise.resolve({});
            }),
            on: vi.fn(),
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
    const mockEventDetails: VisualBuilderCslpEventDetails = {
        fieldMetadata: mockMultipleFieldMetadata,
        editableElement: {} as Element,
        cslpData: ""
    }

    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        targetElement = document.createElement("div");
        targetElement.setAttribute("data-testid", "mock-target-element");
        mockEventDetails['editableElement'] = targetElement;
        document.body.appendChild(targetElement);

        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue(
            mockMultipleLinkFieldSchema
        );
    });

    afterEach(() => {
        document.body.removeChild(targetElement);
        vi.clearAllMocks();
        cleanup();
    });

    test("renders toolbar buttons correctly", async () => {
        const { findByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        const moveLeftButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        const moveRightButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        const deleteButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );

        expect(moveLeftButton).toBeInTheDocument();
        expect(moveRightButton).toBeInTheDocument();
        expect(deleteButton).toBeInTheDocument();
    });

    test("calls handleMoveInstance with 'previous' when move left button is clicked", async () => {
        const { findByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        const moveLeftButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        expect(moveLeftButton).toBeInTheDocument();

        fireEvent.click(moveLeftButton);

        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata,
            "previous"
        );
    });

    test("calls handleMoveInstance with 'next' when move right button is clicked", async () => {
        const { findByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        const moveRightButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        expect(moveRightButton).toBeInTheDocument();

        fireEvent.click(moveRightButton);

        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata,
            "next"
        );
    });

    test("calls handleDeleteInstance when delete button is clicked", async () => {
        const { findByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        const deleteButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );
        expect(deleteButton).toBeInTheDocument();
        await act(() => {
            fireEvent.click(deleteButton);
        });

        await waitFor(() => {
            expect(handleDeleteInstance).toHaveBeenCalledWith(
                mockMultipleFieldMetadata
            );
        })
    });
    test("display variant icon instead of dropdown", async () => {
        mockEventDetails.fieldMetadata.variant = "variant";
        const { findByTestId } = await asyncRender(
            <FieldToolbarComponent eventDetails={mockEventDetails} hideOverlay={vi.fn()} />
        );

        const variantIcon = await findByTestId(
            "visual-builder-canvas-variant-icon"
        );
        expect(variantIcon).toBeInTheDocument();
    });

    describe("'Replace button' visibility for multiple file fields", () => {
        beforeEach(() => {
            vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue(
                mockMultipleFileFieldSchema
            );
        });

        test("'replace button' is hidden for parent wrapper of multiple file field", async () => {
            const parentWrapperMetadata: CslpData = {
                ...mockMultipleFieldMetadata,
                fieldPathWithIndex: "files",
                instance: {
                    fieldPathWithIndex: "files"
                },
            };

            const parentWrapperEventDetails = {
                ...mockEventDetails,
                fieldMetadata: parentWrapperMetadata
            };

            const { container } = await asyncRender(
                <FieldToolbarComponent
                    eventDetails={parentWrapperEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            const replaceButton = container.querySelector('[data-testid="visual-builder-replace-file"]');
            expect(replaceButton).not.toBeInTheDocument();
        });

        test("'replace button' is visible for individual field in multiple file field", async () => {
            const individualFieldMetadata: CslpData = {
                ...mockMultipleFieldMetadata,
                fieldPathWithIndex: "files",
                instance: {
                    fieldPathWithIndex: "files.0"
                },
            };

            const individualFieldEventDetails = {
                ...mockEventDetails,
                fieldMetadata: individualFieldMetadata
            };

            const { container } = await asyncRender(
                <FieldToolbarComponent
                    eventDetails={individualFieldEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            const replaceButton = container.querySelector('[data-testid="visual-builder-replace-file"]');
            expect(replaceButton).toBeInTheDocument();
        });
    });

    test("passes disabled state correctly to child components when field is disabled", async () => {
        // Mock isFieldDisabled to return disabled state
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: true,
            reason: "You have only read access to this field" as any,
        });

        const { findByTestId } = await asyncRender(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        await waitFor(async () => {
            const toolbar = await findByTestId(
                "visual-builder__focused-toolbar__multiple-field-toolbar"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // Check that move buttons are disabled
        const moveLeftButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        const moveRightButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        const deleteButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );

        expect(moveLeftButton).toBeDisabled();
        expect(moveRightButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();

        // Check that edit button is disabled if present
        const editButton = await findByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__edit-button"
        ).catch(() => null);
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
