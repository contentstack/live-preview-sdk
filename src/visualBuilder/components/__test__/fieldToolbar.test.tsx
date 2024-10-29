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

    beforeEach(() => {
        document.body.innerHTML = "";
        targetElement = document.createElement("div");
        targetElement.setAttribute("data-testid", "mock-target-element");
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
                fieldMetadata={mockMultipleFieldMetadata}
                editableElement={targetElement}
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

    test("renders toolbar buttons for multiple and not whole multiple field", async () => {
        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue({
            ...mockMultipleLinkFieldSchema,
            multiple: true,
        });

        const { findByTestId } = await asyncRender(
            <FieldToolbarComponent
                fieldMetadata={mockMultipleFieldMetadata}
                editableElement={targetElement}
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
        expect(screen.queryByText('Comment Icon')).not.toBeInTheDocument();;
    });

    test("renders toolbar without move buttons for non multiple", async () => {
        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue({
            ...mockMultipleLinkFieldSchema,
            multiple: false,
        });

        const { findByTestId, queryByTestId } = await asyncRender(
            <FieldToolbarComponent
                fieldMetadata={{...mockMultipleFieldMetadata,}}
                editableElement={targetElement}
            />
        );
        const moveLeftButton = await queryByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        const moveRightButton = await queryByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        const deleteButton = await queryByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );

        expect(screen.queryByText('Comment Icon')).toBeInTheDocument();
        expect(moveLeftButton).not.toBeInTheDocument();;
        expect(moveRightButton).not.toBeInTheDocument();;
        expect(deleteButton).not.toBeInTheDocument();;
    });

    test("renders all toolbar buttons for multiple and whole multiple field", async () => {
        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue({
            ...mockMultipleLinkFieldSchema,
            multiple: true,
        });

        const { findByTestId ,queryByTestId } = await asyncRender(
            <FieldToolbarComponent
                fieldMetadata={{
                    ...mockMultipleFieldMetadata,
                    fieldPathWithIndex:mockMultipleFieldMetadata.instance.fieldPathWithIndex,
                }}
                editableElement={targetElement}
            />
        );
        const moveLeftButton = await queryByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        const moveRightButton = await queryByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        const deleteButton = await queryByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );


        expect(deleteButton).not.toBeInTheDocument();;
        expect(moveLeftButton).not.toBeInTheDocument();;
        expect(moveRightButton).not.toBeInTheDocument();;
        expect(screen.queryByText('Comment Icon')).toBeInTheDocument();
    });

    test("calls handleMoveInstance with 'previous' when move left button is clicked", async () => {
        const { findByTestId } = await asyncRender(
            <FieldToolbarComponent
                fieldMetadata={mockMultipleFieldMetadata}
                editableElement={targetElement}
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
                fieldMetadata={mockMultipleFieldMetadata}
                editableElement={targetElement}
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
                fieldMetadata={mockMultipleFieldMetadata}
                editableElement={targetElement}
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
});
