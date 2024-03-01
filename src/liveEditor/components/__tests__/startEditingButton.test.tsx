import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/preact";
import StartEditingButtonComponent from "../startEditingButton";

jest.mock("../../utils/getLiveEditorRedirectionUrl", () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue(new URL("https://example.com")),
}));

describe("StartEditingButtonComponent", () => {
    it("renders correctly with EditIcon and Start Editing text", () => {
        const { getByText, getByTestId } = render(
            <StartEditingButtonComponent />
        );

        const editIcon = getByTestId("visual-editor__edit-icon");
        const startEditingText = getByText("Start Editing");

        expect(editIcon).toBeInTheDocument();
        expect(startEditingText).toBeInTheDocument();
    });

    it("renders anchor element with correct href", () => {
        const { getByTestId } = render(<StartEditingButtonComponent />);
        const startEditingButton = getByTestId("vcms-start-editing-btn");

        expect(startEditingButton).toHaveAttribute(
            "href",
            "https://example.com/"
        );
    });

    it("updates href attribute when clicked", () => {
        const { getByTestId } = render(<StartEditingButtonComponent />);
        const startEditingButton = getByTestId("vcms-start-editing-btn");

        fireEvent.click(startEditingButton);

        expect(startEditingButton).toHaveAttribute(
            "href",
            "https://example.com/"
        );
    });
});
