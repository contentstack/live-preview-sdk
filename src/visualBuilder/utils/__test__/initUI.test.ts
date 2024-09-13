import initUI from "../../components/index";

const mockResizeObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
};

describe("VisualBuilderComponent", () => {
    test("should render the component", () => {
        initUI({
            resizeObserver: mockResizeObserver,
        });

        const container = document.querySelector(".visual-builder__container");
        const cursor = document.querySelector(".visual-builder__cursor");
        const overlay = document.querySelector(
            ".visual-builder__overlay__wrapper"
        );
        const toolbar = document.querySelector(
            ".visual-builder__focused-toolbar"
        );

        // Check if all expected elements are rendered
        expect(container).toBeInTheDocument();
        expect(cursor).toBeInTheDocument();
        expect(overlay).toBeInTheDocument();
        expect(toolbar).toBeInTheDocument();
    });
});
