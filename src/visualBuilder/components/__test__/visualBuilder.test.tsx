import { render, fireEvent, cleanup } from "@testing-library/preact";
import { hideOverlay } from "../../generators/generateOverlay";
import { VisualBuilder } from "../..";
import VisualBuilderComponent from "../VisualBuilder";
import { asyncRender } from "../../../__test__/utils";

vi.mock("../../generators/generateOverlay", () => ({
    hideOverlay: vi.fn(),
}));

const mockResizeObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
};

describe("VisualBuilderComponent", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    })
    afterEach(() => {
        cleanup();
    })
    test("renders VisualBuilderComponent correctly", async () => {
        const { getByTestId } = await asyncRender(
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

    test("hides overlay and unobserves element on click", async () => {
        const visualBuilderContainer = document.createElement("div");
        const { getByTestId } = await asyncRender(
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

    test("hides overlay without throwing error if VisualBuilderGlobalState is null", async () => {
        const visualBuilderContainer = document.createElement("div");
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            null;
        VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
            null;

        const { getByTestId } = await asyncRender(
            <VisualBuilderComponent
                visualBuilderContainer={visualBuilderContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        const overlayWrapper = getByTestId("visual-builder__overlay__wrapper");
        fireEvent.click(overlayWrapper);

        expect(() => {}).not.toThrow();
    });

    test("unobserves element if VisualBuilderGlobalState is null", async () => {
        const visualBuilderContainer = document.createElement("div");
        const targetElement = document.createElement("div");
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            targetElement;

        const { getByTestId } = await asyncRender(
            <VisualBuilderComponent
                visualBuilderContainer={visualBuilderContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        const overlayWrapper = getByTestId("visual-builder__overlay__wrapper");
        fireEvent.click(overlayWrapper);
    });
});
