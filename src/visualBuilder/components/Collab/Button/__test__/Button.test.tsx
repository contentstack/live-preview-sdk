/** @jsxImportSource preact */
import { render, screen, fireEvent } from "@testing-library/preact";
import Button from "../Button";
import { iconComponents } from "../../../icons/index";

describe("Button Component", () => {
    it("renders Button with default props", () => {
        render(<Button testId="collab-button">Click Me</Button>);
        const button = screen.getByTestId("collab-button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("collab-button--primary");
        expect(button).toHaveTextContent("Click Me");
    });

    it("renders Button with custom className", () => {
        render(
            <Button testId="collab-button" className="custom-class">
                Custom Button
            </Button>
        );
        const button = screen.getByTestId("collab-button");
        expect(button).toHaveClass("custom-class");
    });

    it("renders Button with icon on the left", () => {
        render(
            <Button
                testId="collab-button"
                icon="RightMarkActive"
                iconAlignment="left"
            >
                Icon Button
            </Button>
        );
        const button = screen.getByTestId("collab-button");
        expect(button).toHaveTextContent("Icon Button");
        expect(button).toHaveClass("collab-button--icon-left");
    });

    it("renders Button with icon on the right", () => {
        render(
            <Button
                testId="collab-button"
                icon="RightMarkActive"
                iconAlignment="right"
            >
                Icon Button
            </Button>
        );
        const button = screen.getByTestId("collab-button");
        expect(button).toHaveClass("collab-button--icon-right");
    });

    it("renders Button as a link when href is provided", () => {
        render(
            <Button
                testId="collab-button"
                href="https://example.com"
                buttonType="secondary"
            >
                Link Button
            </Button>
        );
        const link = screen.getByTestId("collab-button");
        expect(link.tagName).toBe("A");
        expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("renders disabled Button", () => {
        render(
            <Button testId="collab-button" disabled>
                Disabled Button
            </Button>
        );
        const button = screen.getByTestId("collab-button");
        expect(button).toBeDisabled();
        expect(button).toHaveClass("collab-button--disabled");
    });

    it("fires onClick event when Button is clicked", () => {
        const onClickMock = vi.fn();
        render(
            <Button testId="collab-button" onClick={onClickMock}>
                Click Me
            </Button>
        );
        const button = screen.getByTestId("collab-button");
        fireEvent.click(button);
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it("renders Button with custom styles", () => {
        render(
            <Button testId="collab-button" style={{ backgroundColor: "blue" }}>
                Styled Button
            </Button>
        );
        const button = screen.getByTestId("collab-button");
        expect(button).toHaveStyle("background-color: rgb(0, 0, 255)");
    });

    it("renders Button with different sizes", () => {
        render(
            <Button testId="collab-button" size="small">
                Small Button
            </Button>
        );
        const button = screen.getByTestId("collab-button");
        expect(button).toHaveClass("collab-button--small");
    });
});
