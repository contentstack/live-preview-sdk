import "@testing-library/jest-dom/extend-expect";
import { render, cleanup } from "@testing-library/preact";
import PseudoEditableFieldComponent from "../pseudoEditableField";
import getStyleOfAnElement from "./../../utils/getStyleOfAnElement";

jest.mock("./../../utils/getStyleOfAnElement");

describe("PseudoEditableFieldComponent", () => {
    afterEach(cleanup);

    test("renders correctly with provided props", () => {
        (getStyleOfAnElement as jest.Mock).mockReturnValue({
            "font-size": "16px",
            color: "red",
        });

        const editableElement = document.createElement("div");
        editableElement.textContent = "Editable Text";
        const config = { textContent: "Editable Text" };

        const { getByTestId } = render(
            <PseudoEditableFieldComponent
                editableElement={editableElement}
                config={config}
            />
        );

        const pseudoEditableElement = getByTestId(
            "visual-editor__pseudo-editable-element"
        );
        expect(pseudoEditableElement).toBeInTheDocument();
        expect(pseudoEditableElement).toHaveStyle("font-size: 16px");
        expect(pseudoEditableElement).toHaveStyle("color: red");
        expect(pseudoEditableElement).toHaveTextContent("Editable Text");
    });
});
