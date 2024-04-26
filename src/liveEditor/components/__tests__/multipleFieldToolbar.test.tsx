import "@testing-library/jest-dom/extend-expect";
import { render, cleanup, fireEvent } from "@testing-library/preact";

import MultipleFieldToolbarComponent from "../multipleFieldToolbar";
import {
    handleMoveInstance,
    handleDeleteInstance,
} from "../../utils/instanceHandlers";

import { CslpData } from "../../../cslp/types/cslp.types";

jest.mock("../../utils/instanceHandlers", () => ({
    handleMoveInstance: jest.fn(),
    handleDeleteInstance: jest.fn(),
}));

const mockFieldMetadata: CslpData = {
    entry_uid: "",
    content_type_uid: "",
    cslpValue: "",
    locale: "",
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
            <MultipleFieldToolbarComponent
                fieldMetadata={mockFieldMetadata}
                targetElement={targetElement}
            />
        );

        const moveLeftButton = getByTestId(
            "visual-editor__focused-toolbar__multiple-field-toolbar__move-left-button"
        );
        const moveRightButton = getByTestId(
            "visual-editor__focused-toolbar__multiple-field-toolbar__move-right-button"
        );
        const deleteButton = getByTestId(
            "visual-editor__focused-toolbar__multiple-field-toolbar__delete-button"
        );

        expect(moveLeftButton).toBeInTheDocument();
        expect(moveRightButton).toBeInTheDocument();
        expect(deleteButton).toBeInTheDocument();
    });

    test("calls handleMoveInstance with 'previous' when move left button is clicked", () => {
        const { getByTestId } = render(
            <MultipleFieldToolbarComponent
                fieldMetadata={mockFieldMetadata}
                targetElement={targetElement}
            />
        );

        const moveLeftButton = getByTestId(
            "visual-editor__focused-toolbar__multiple-field-toolbar__move-left-button"
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
            <MultipleFieldToolbarComponent
                fieldMetadata={mockFieldMetadata}
                targetElement={targetElement}
            />
        );

        const moveRightButton = getByTestId(
            "visual-editor__focused-toolbar__multiple-field-toolbar__move-right-button"
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
            <MultipleFieldToolbarComponent
                fieldMetadata={mockFieldMetadata}
                targetElement={targetElement}
            />
        );

        const deleteButton = getByTestId(
            "visual-editor__focused-toolbar__multiple-field-toolbar__delete-button"
        );
        expect(deleteButton).toBeInTheDocument();

        fireEvent.click(deleteButton);

        expect(handleDeleteInstance).toHaveBeenCalled();
        expect(handleDeleteInstance).toHaveBeenCalledWith(mockFieldMetadata);
    });
});
