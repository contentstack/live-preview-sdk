import { describe, it, expect, vi } from "vitest";
import { updateFocussedState, updateFocussedStateOnMutation } from "../updateFocussedState";
import { VisualBuilder } from "../..";
import { addFocusOverlay, hideFocusOverlay } from "../../generators/generateOverlay";
import { mockGetBoundingClientRect } from "../../../__test__/utils";
import { act } from "@testing-library/preact";
import { singleLineFieldSchema } from "../../../__test__/data/fields";

vi.mock("../../generators/generateOverlay", () => ({
    addFocusOverlay: vi.fn(),
    hideFocusOverlay: vi.fn()
}));

vi.mock("../../utils/fieldSchemaMap", () => {
    return {
        FieldSchemaMap: {
            getFieldSchema: vi
                .fn()
                .mockImplementation((_content_type_uid, _fieldPath) => {
                    return singleLineFieldSchema;
                }),
        },
    };
});

describe("updateFocussedState", () => {
    beforeEach(() => {
        let previousSelectedEditableDOM: HTMLElement;
        previousSelectedEditableDOM = document.createElement("div");
        previousSelectedEditableDOM.setAttribute("data-cslp", "content_type_uid.entry_uid.locale.field_path");
        document.body.appendChild(previousSelectedEditableDOM);
        VisualBuilder.VisualBuilderGlobalState.value
                    .previousSelectedEditableDOM = previousSelectedEditableDOM;
    })
    afterEach(() => {
        document.body.innerHTML = "";
        VisualBuilder.VisualBuilderGlobalState.value
                    .previousSelectedEditableDOM = null;
        
    })
    it("should return early if required elements are not provided", async () => {
        const result = await updateFocussedState({
            editableElement: null,
            visualBuilderContainer: null,
            overlayWrapper: null,
            focusedToolbar: null,
            resizeObserver: null,
        });
        expect(result).toBeUndefined();
    });

    it("should hide focus overlay if newPreviousSelectedElement is not found", () => {
        const resizeObserverMock = { disconnect: vi.fn() } as unknown as ResizeObserver;
        const overlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const visualBuilderContainerMock = document.createElement("div");

        const spyQuerySelector = vi.spyOn(document, "querySelector").mockReturnValue(null);
        document.querySelector = vi.fn().mockReturnValue(null);

        updateFocussedState({
            editableElement: document.createElement("div"),
            visualBuilderContainer: visualBuilderContainerMock,
            overlayWrapper: overlayWrapperMock,
            focusedToolbar: focusedToolbarMock,
            resizeObserver: resizeObserverMock,
        });

        expect(hideFocusOverlay).toHaveBeenCalled();
        spyQuerySelector.mockRestore();

    });

    it("should update pseudo editable element styles", async () => {
        const editableElementMock = document.createElement("div");
        editableElementMock.setAttribute("data-cslp", "content_type_uid.entry_uid.locale.field_path");
        const visualBuilderContainerMock = document.createElement("div");
        const overlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const resizeObserverMock = { disconnect: vi.fn() } as unknown as ResizeObserver;

        const pseudoEditableElementMock = document.createElement("div");
        pseudoEditableElementMock.classList.add("visual-builder__pseudo-editable-element");
        visualBuilderContainerMock.appendChild(pseudoEditableElementMock);
        
        await act(async () => {
          await updateFocussedState({
              editableElement: editableElementMock,
              visualBuilderContainer: visualBuilderContainerMock,
              overlayWrapper: overlayWrapperMock,
              focusedToolbar: focusedToolbarMock,
              resizeObserver: resizeObserverMock,
          });
        })

        expect(pseudoEditableElementMock.style.visibility).toBe("visible");
    });

    it("should update position of toolbar", async () => {
        const editableElementMock = document.createElement("div");
        mockGetBoundingClientRect(editableElementMock)
        editableElementMock.setAttribute("data-cslp", "content_type_uid.entry_uid.locale.field_path");
        const visualBuilderContainerMock = document.createElement("div");
        const overlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const resizeObserverMock = { disconnect: vi.fn() } as unknown as ResizeObserver;

        const pseudoEditableElementMock = document.createElement("div");
        pseudoEditableElementMock.classList.add("visual-builder__pseudo-editable-element");
        visualBuilderContainerMock.appendChild(pseudoEditableElementMock);

        document.querySelector = vi.fn().mockReturnValue(editableElementMock);

        await updateFocussedState({
            editableElement: editableElementMock,
            visualBuilderContainer: visualBuilderContainerMock,
            overlayWrapper: overlayWrapperMock,
            focusedToolbar: focusedToolbarMock,
            resizeObserver: resizeObserverMock,
        });

        expect(focusedToolbarMock.style.top).toBe("49px");
        expect(focusedToolbarMock.style.left).toBe("8px");
    })
});

describe("updateFocussedStateOnMutation", () => {
    beforeEach(() => {
        let previousSelectedEditableDOM: HTMLElement;
        previousSelectedEditableDOM = document.createElement("div");
        previousSelectedEditableDOM.setAttribute("data-cslp", "content_type_uid.entry_uid.locale.field_path");
        document.body.appendChild(previousSelectedEditableDOM);
        VisualBuilder.VisualBuilderGlobalState.value
                    .previousSelectedEditableDOM = previousSelectedEditableDOM;
    })
    afterEach(() => {
        document.body.innerHTML = "";
        VisualBuilder.VisualBuilderGlobalState.value
                    .previousSelectedEditableDOM = null;
        
    })
    it("should return early if focusOverlayWrapper is not provided", () => {
        const result = updateFocussedStateOnMutation(null, null, null, null);
        expect(result).toBeUndefined();
    });

    it("should hide focus overlay if newSelectedElement is not found", () => {
        const resizeObserverMock = { disconnect: vi.fn() } as unknown as ResizeObserver;
        const focusOverlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const visualBuilderContainerMock = document.createElement("div");

        document.querySelector = vi.fn().mockReturnValue(null);

        updateFocussedStateOnMutation(
            focusOverlayWrapperMock,
            focusedToolbarMock,
            visualBuilderContainerMock,
            resizeObserverMock
        );

        expect(hideFocusOverlay).toHaveBeenCalled();
    });

    it("should update focus outline dimensions", () => {
        const focusOverlayWrapperMock = document.createElement("div");
        const focusOutlineMock = document.createElement("div");
        focusOutlineMock.classList.add("visual-builder__overlay--outline");
        focusOverlayWrapperMock.appendChild(focusOutlineMock);

        const selectedElementMock = document.createElement("div");
        selectedElementMock.getBoundingClientRect = vi.fn().mockReturnValue({
            top: 10,
            left: 10,
            width: 100,
            height: 100,
        });

        document.querySelector = vi.fn().mockReturnValue(selectedElementMock);

        updateFocussedStateOnMutation(
            focusOverlayWrapperMock,
            null,
            null,
            null
        );

        expect(focusOutlineMock.style.top).toBe("10px");
        expect(focusOutlineMock.style.left).toBe("10px");
        expect(focusOutlineMock.style.width).toBe("100px");
        expect(focusOutlineMock.style.height).toBe("100px");
    });
});