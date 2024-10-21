import {
    act,
    cleanup,
    fireEvent,
    getByTestId,
    render,
} from "@testing-library/preact";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import AddInstanceButtonComponent from "../addInstanceButton";

describe("AddInstanceButtonComponent", () => {
    afterEach(cleanup);

    test("renders button with proper class and icon", async () => {
        const onClickCallback = vi.fn();
        await act(() => {
            render(
                <AddInstanceButtonComponent
                    value={[]}
                    fieldSchema={singleLineFieldSchema}
                    onClick={onClickCallback}
                />
            );
        })
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        expect(buttonElement).toBeInTheDocument();
        expect(buttonElement).toHaveClass("visual-builder__add-button");

        expect(buttonElement.querySelector("svg")).toBeTruthy();
        expect(buttonElement.querySelector("path")).toBeTruthy();
    });

    test("calls onClickCallback when button is clicked", async () => {
        const onClickCallback = vi.fn();
        await act(() => {
            render(
                <AddInstanceButtonComponent
                    value={[]}
                    fieldSchema={singleLineFieldSchema}
                    onClick={onClickCallback}
                />
            );
        })
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        fireEvent.click(buttonElement);
        expect(onClickCallback).toHaveBeenCalled();
    });
});
