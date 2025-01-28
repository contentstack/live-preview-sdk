/** @jsxImportSource preact */
import { render, screen } from "@testing-library/preact";
import ButtonGroup from "../ButtonGroup";

describe("ButtonGroup Component", () => {
    it("renders ButtonGroup with default props", () => {
        render(<ButtonGroup testId="collab-button-group" />);
        const buttonGroup = screen.getByTestId("collab-button-group");
        expect(buttonGroup).toBeInTheDocument();
        expect(buttonGroup).toHaveClass("collab-button-group");
    });

    it("applies custom className", () => {
        render(
            <ButtonGroup
                testId="collab-button-group"
                className="custom-class"
            />
        );
        const buttonGroup = screen.getByTestId("collab-button-group");
        expect(buttonGroup).toHaveClass("custom-class");
    });

    it("renders children inside ButtonGroup", () => {
        render(
            <ButtonGroup testId="collab-button-group">
                <button>Button 1</button>
                <button>Button 2</button>
            </ButtonGroup>
        );
        const buttonGroup = screen.getByTestId("collab-button-group");
        expect(buttonGroup).toContainHTML("<button>Button 1</button>");
        expect(buttonGroup).toContainHTML("<button>Button 2</button>");
    });

    it("applies inline styles", () => {
        render(
            <ButtonGroup
                testId="collab-button-group"
                style={{ display: "flex", justifyContent: "center" }}
            />
        );
        const buttonGroup = screen.getByTestId("collab-button-group");
        expect(buttonGroup).toHaveStyle("display: flex");
        expect(buttonGroup).toHaveStyle("justify-content: center");
    });
});
