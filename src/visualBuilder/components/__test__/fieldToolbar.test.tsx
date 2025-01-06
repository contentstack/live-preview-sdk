import { act, cleanup, fireEvent, render, waitFor, screen, queryByTestId } from "@testing-library/preact";
import { CslpData } from "../../../cslp/types/cslp.types";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "../../utils/instanceHandlers";
import { ISchemaFieldMap } from "../../utils/types/index.types";
import FieldToolbarComponent from "../FieldToolbar";
import { mockMultipleLinkFieldSchema, singleLineFieldSchema } from "../../../__test__/data/fields";
import { asyncRender } from "../../../__test__/utils";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";

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

describe("MultipleFieldToolbarComponent", () => {
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
            <FieldToolbarComponent eventDetails={mockEventDetails} />
        );

        const variantIcon = await findByTestId(
            "visual-builder-canvas-variant-icon"
        );
        expect(variantIcon).toBeInTheDocument();
    });
});
