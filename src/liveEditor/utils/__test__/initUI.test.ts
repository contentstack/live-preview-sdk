import "@testing-library/jest-dom/extend-expect";
import initUI from "../../components/index";

const mockResizeObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
};

describe("VisualEditorComponent", () => {

    test("should render the component", () => {
        initUI({
            resizeObserver: mockResizeObserver
        })

        const container = document.querySelector(".visual-editor__container");
        const cursor = document.querySelector(".visual-editor__cursor");
        const overlay = document.querySelector(".visual-editor__overlay__wrapper");
        const toolbar = document.querySelector(".visual-editor__focused-toolbar");

        // Check if all expected elements are rendered
        expect(container).toBeInTheDocument();
        expect(cursor).toBeInTheDocument();
        expect(overlay).toBeInTheDocument();
        expect(toolbar).toBeInTheDocument();
    });

});