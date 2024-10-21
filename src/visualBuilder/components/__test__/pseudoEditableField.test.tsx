import { render, cleanup } from "@testing-library/preact";
import PseudoEditableFieldComponent from "../pseudoEditableField";
import getStyleOfAnElement from "./../../utils/getStyleOfAnElement";
import { Mock } from "vitest";
import { asyncRender } from "../../../__test__/utils";

vi.mock("./../../utils/getStyleOfAnElement");

describe("PseudoEditableFieldComponent", () => {
    afterEach(cleanup);

    test("renders correctly with provided props", async () => {
        (getStyleOfAnElement as Mock).mockReturnValue({
            "font-size": "16px",
            color: "rgb(255, 0, 0)",
        });

        const editableElement = document.createElement("div");
        editableElement.textContent = "Editable Text";
        const config = { textContent: "Editable Text" };

        const { getByTestId } = await asyncRender(
            <PseudoEditableFieldComponent
                editableElement={editableElement}
                config={config}
            />
        );

        const pseudoEditableElement = getByTestId(
            "visual-builder__pseudo-editable-element"
        );
        expect(pseudoEditableElement).toBeInTheDocument();
        expect(pseudoEditableElement).toHaveStyle("font-size: 16px");
        expect(pseudoEditableElement).toHaveStyle("color: rgb(255, 0, 0)");
        expect(pseudoEditableElement).toHaveTextContent("Editable Text");
    });
});
