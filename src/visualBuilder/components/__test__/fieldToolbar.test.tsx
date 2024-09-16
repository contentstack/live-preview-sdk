import { render, cleanup, fireEvent } from "@testing-library/preact";
import FieldToolbarComponent from "../FieldToolbar";
import {
    handleMoveInstance,
    handleDeleteInstance,
} from "../../utils/instanceHandlers";

import { CslpData } from "../../../cslp/types/cslp.types";
import { ISchemaFieldMap } from "../../utils/types/index.types";

vi.mock("../../utils/instanceHandlers", () => ({
    handleMoveInstance: vi.fn(),
    handleDeleteInstance: vi.fn(),
}));

// TODO - add mock field schema

const mockFieldMetadata: CslpData = {
    entry_uid: "",
    content_type_uid: "",
    cslpValue: "",
    locale: "",
    variant: undefined,
    fieldPath: "",
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

const mockLinkFieldSchema: ISchemaFieldMap = {
    data_type: "link",
    display_name: "Link",
    uid: "link",
    field_metadata: {
        description: "",
        default_value: {
            title: "Example",
            url: "https://www.example.com",
        },
    },
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
};

describe("MultipleFieldToolbarComponent", () => {
    let targetElement: HTMLDivElement;

    beforeEach(() => {
        targetElement = document.createElement("div");
        targetElement.setAttribute("data-testid", "mock-target-element");
        document.body.appendChild(targetElement);
    });

    afterEach(() => {
        document.body.removeChild(targetElement);
        cleanup();
    });

    test("renders toolbar buttons correctly", () => {
        const { getByTestId } = render(
            <FieldToolbarComponent
                fieldMetadata={mockFieldMetadata}
                editableElement={targetElement}
            />
        );

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

    test("calls handleMoveInstance with 'previous' when move left button is clicked", () => {
        const { getByTestId } = render(
            <FieldToolbarComponent
                fieldMetadata={mockFieldMetadata}
                editableElement={targetElement}
            />
        );

        const moveLeftButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        expect(moveLeftButton).toBeInTheDocument();

        fireEvent.click(moveLeftButton);

        expect(handleMoveInstance).toHaveBeenCalled();
        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockFieldMetadata,
            "previous"
        );
    });

    test("calls handleMoveInstance with 'next' when move right button is clicked", () => {
        const { getByTestId } = render(
            <FieldToolbarComponent
                fieldMetadata={mockFieldMetadata}
                editableElement={targetElement}
            />
        );

        const moveRightButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        expect(moveRightButton).toBeInTheDocument();

        fireEvent.click(moveRightButton);

        expect(handleMoveInstance).toHaveBeenCalled();
        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockFieldMetadata,
            "next"
        );
    });

    test("calls handleDeleteInstance when delete button is clicked", () => {
        const { getByTestId } = render(
            <FieldToolbarComponent
                fieldMetadata={mockFieldMetadata}
                editableElement={targetElement}
            />
        );

        const deleteButton = getByTestId(
            "visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
        );
        expect(deleteButton).toBeInTheDocument();

        fireEvent.click(deleteButton);

        expect(handleDeleteInstance).toHaveBeenCalled();
        expect(handleDeleteInstance).toHaveBeenCalledWith(mockFieldMetadata);
    });
});
