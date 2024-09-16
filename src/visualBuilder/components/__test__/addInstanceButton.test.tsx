import {
    render,
    cleanup,
    fireEvent,
    getByTestId,
} from "@testing-library/preact";
import AddInstanceButtonComponent from "../addInstanceButton";

describe("AddInstanceButtonComponent", () => {
    afterEach(cleanup);

    test("renders button with proper class and icon", () => {
        const onClickCallback = vi.fn();
        render(
            <AddInstanceButtonComponent onClickCallback={onClickCallback} />
        );
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        expect(buttonElement).toBeInTheDocument();
        expect(buttonElement).toHaveClass("visual-builder__add-button");

        expect(buttonElement.querySelector("svg")).toBeTruthy();
        expect(buttonElement.querySelector("path")).toBeTruthy();
    });

    test("calls onClickCallback when button is clicked", () => {
        const onClickCallback = vi.fn();
        render(
            <AddInstanceButtonComponent onClickCallback={onClickCallback} />
        );
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        fireEvent.click(buttonElement);
        expect(onClickCallback).toHaveBeenCalled();
    });
});
