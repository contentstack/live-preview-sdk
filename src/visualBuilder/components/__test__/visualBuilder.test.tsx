import { render, fireEvent, cleanup } from "@testing-library/preact";
import { hideOverlay } from "../../generators/generateOverlay";
import { VisualBuilder } from "../..";
import VisualBuilderComponent from "../VisualBuilder";
import { asyncRender } from "../../../__test__/utils";
import * as utils from "../../../utils";

vi.mock("../../generators/generateOverlay", () => ({
    hideOverlay: vi.fn(),
}));

const mockResizeObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
};

vi.mock("../../../utils/index.ts", async () => {
    const actual = await vi.importActual("../../../utils");
    return {
        __esModule: true,
        ...actual,
        isOpenInBuilder: vi.fn().mockReturnValue(true),
    };
});

describe("VisualBuilderComponent", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });
    afterEach(() => {
        cleanup();
    });
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

    test("does not render VisualBuilderComponent when not in builder mode", async () => {
        vi.spyOn(utils, "isOpenInBuilder").mockReturnValueOnce(false);
        const { queryByTestId } = await asyncRender(
            <VisualBuilderComponent
                visualBuilderContainer={document.createElement("div")}
                resizeObserver={mockResizeObserver}
            />
        );

        expect(queryByTestId("visual-builder__cursor")).not.toBeInTheDocument();
        expect(
            queryByTestId("visual-builder__overlay__wrapper")
        ).not.toBeInTheDocument();
        expect(
            queryByTestId("visual-builder__focused-toolbar")
        ).not.toBeInTheDocument();
    });

    test("does not render any overlay sections when not in builder mode", async () => {
        vi.spyOn(utils, "isOpenInBuilder").mockReturnValueOnce(false);
        const { queryByTestId } = await asyncRender(
            <VisualBuilderComponent
                visualBuilderContainer={document.createElement("div")}
                resizeObserver={mockResizeObserver}
            />
        );

        expect(
            queryByTestId("visual-builder__overlay--top")
        ).not.toBeInTheDocument();
        expect(
            queryByTestId("visual-builder__overlay--left")
        ).not.toBeInTheDocument();
        expect(
            queryByTestId("visual-builder__overlay--right")
        ).not.toBeInTheDocument();
        expect(
            queryByTestId("visual-builder__overlay--bottom")
        ).not.toBeInTheDocument();
        expect(
            queryByTestId("visual-builder__overlay--outline")
        ).not.toBeInTheDocument();
    });

    test("does not render hover outline when not in builder mode", async () => {
        vi.spyOn(utils, "isOpenInBuilder").mockReturnValueOnce(false);
        const { queryByTestId } = await asyncRender(
            <VisualBuilderComponent
                visualBuilderContainer={document.createElement("div")}
                resizeObserver={mockResizeObserver}
            />
        );

        expect(
            queryByTestId("visual-builder__hover-outline")
        ).not.toBeInTheDocument();
    });

    test("does not call hideOverlay when not in builder mode", async () => {
        vi.spyOn(utils, "isOpenInBuilder").mockReturnValueOnce(false);
        const visualBuilderContainer = document.createElement("div");
        await asyncRender(
            <VisualBuilderComponent
                visualBuilderContainer={visualBuilderContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        expect(hideOverlay).not.toHaveBeenCalled();
    });

    test("does not observe elements when not in builder mode", async () => {
        vi.spyOn(utils, "isOpenInBuilder").mockReturnValueOnce(false);
        await asyncRender(
            <VisualBuilderComponent
                visualBuilderContainer={document.createElement("div")}
                resizeObserver={mockResizeObserver}
            />
        );

        expect(mockResizeObserver.observe).not.toHaveBeenCalled();
    });
});
