import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/preact";
import { hideOverlay } from "../../generators/generateOverlay";
import { VisualEditor } from "../..";
import VisualEditorComponent from "../visualEditor";

jest.mock("../../generators/generateOverlay", () => ({
    hideOverlay: jest.fn(),
}));

const mockResizeObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
};

describe("VisualEditorComponent", () => {
    test("renders VisualEditorComponent correctly", () => {
        const { getByTestId } = render(
            <VisualEditorComponent
                visualEditorContainer={document.createElement("div")}
                resizeObserver={mockResizeObserver}
            />
        );

        expect(getByTestId("visual-editor__cursor")).toBeInTheDocument();
        expect(
            getByTestId("visual-editor__overlay__wrapper")
        ).toBeInTheDocument();
        expect(
            getByTestId("visual-editor__focused-toolbar")
        ).toBeInTheDocument();
    });

    test("hides overlay and unobserves element on click", () => {
        const visualEditorContainer = document.createElement("div");
        const { getByTestId } = render(
            <VisualEditorComponent
                visualEditorContainer={visualEditorContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        const overlayWrapper = getByTestId("visual-editor__overlay__wrapper");
        fireEvent.click(overlayWrapper);

        expect(hideOverlay).toHaveBeenCalledWith({
            visualEditorContainer,
            visualEditorOverlayWrapper: overlayWrapper,
            focusedToolbar: expect.any(HTMLDivElement),
            resizeObserver: mockResizeObserver,
        });
    });

    test("hides overlay without throwing error if VisualEditorGlobalState is null", () => {
        const visualEditorContainer = document.createElement("div");
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
            null;
        VisualEditor.VisualEditorGlobalState.value.previousHoveredTargetDOM =
            null;

        const { getByTestId } = render(
            <VisualEditorComponent
                visualEditorContainer={visualEditorContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        const overlayWrapper = getByTestId("visual-editor__overlay__wrapper");
        fireEvent.click(overlayWrapper);

        expect(() => {}).not.toThrow();
    });

    test("unobserves element if VisualEditorGlobalState is null", () => {
        const visualEditorContainer = document.createElement("div");
        const targetElement = document.createElement("div");
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
            targetElement;

        const { getByTestId } = render(
            <VisualEditorComponent
                visualEditorContainer={visualEditorContainer}
                resizeObserver={mockResizeObserver}
            />
        );

        const overlayWrapper = getByTestId("visual-editor__overlay__wrapper");
        fireEvent.click(overlayWrapper);
    });
});
