import { render, fireEvent } from "@testing-library/preact";
import { hideOverlay } from "../../generators/generateOverlay";
import { VisualBuilder } from "../..";
import VisualBuilderComponent from "../VisualBuilder";

vi.mock("../../generators/generateOverlay", () => ({
    hideOverlay: vi.fn(),
}));

const mockResizeObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
};

describe("VisualBuilderComponent", () => {
    test("renders VisualBuilderComponent correctly", () => {
        const { getByTestId } = render(
            <VisualBuilderComponent
                visualBuilderContainer={document.createElement("div")}
                resizeObserver={mockResizeObserver}
            />
        );

        expect(getByTestId("visual-builder__cursor")).toBeInTheDocument();
        expect(
            getByTestId("visual-builder__overlay__wrapper")
        ).toBeInTheDocument();
        expect(
            getByTestId("visual-builder__focused-toolbar")
        ).toBeInTheDocument();
    });

    test("hides overlay and unobserves element on click", () => {
        const visualBuilderContainer = document.createElement("div");
        const { getByTestId } = render(
            <VisualBuilderComponent
                visualBuilderContainer={visualBuilderContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        const overlayWrapper = getByTestId("visual-builder__overlay__wrapper");
        fireEvent.click(overlayWrapper);

        expect(hideOverlay).toHaveBeenCalledWith({
            visualBuilderContainer,
            visualBuilderOverlayWrapper: overlayWrapper,
            focusedToolbar: expect.any(HTMLDivElement),
            resizeObserver: mockResizeObserver,
        });
    });

    test("hides overlay without throwing error if VisualBuilderGlobalState is null", () => {
        const visualBuilderContainer = document.createElement("div");
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            null;
        VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
            null;

        const { getByTestId } = render(
            <VisualBuilderComponent
                visualBuilderContainer={visualBuilderContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        const overlayWrapper = getByTestId("visual-builder__overlay__wrapper");
        fireEvent.click(overlayWrapper);

        expect(() => {}).not.toThrow();
    });

    test("unobserves element if VisualBuilderGlobalState is null", () => {
        const visualBuilderContainer = document.createElement("div");
        const targetElement = document.createElement("div");
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            targetElement;

        const { getByTestId } = render(
            <VisualBuilderComponent
                visualBuilderContainer={visualBuilderContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        const overlayWrapper = getByTestId("visual-builder__overlay__wrapper");
        fireEvent.click(overlayWrapper);
    });
});
