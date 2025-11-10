import { describe, it, expect, vi } from "vitest";
import {
    updateFocussedState,
    updateFocussedStateOnMutation,
} from "../updateFocussedState";
import { VisualBuilder } from "../..";
import {
    addFocusOverlay,
    hideFocusOverlay,
    wasFocusOverlayDisabled,
} from "../../generators/generateOverlay";
import { addFocusedToolbar } from "../../listeners/mouseClick";
import { mockGetBoundingClientRect } from "../../../__test__/utils";
import { act } from "@testing-library/preact";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import { getEntryPermissionsCached } from "../getEntryPermissionsCached";
import { getWorkflowStageDetails } from "../getWorkflowStageDetails";
import { isFieldDisabled } from "../isFieldDisabled";

vi.mock("../../generators/generateOverlay", () => ({
    addFocusOverlay: vi.fn(),
    hideFocusOverlay: vi.fn(),
    wasFocusOverlayDisabled: vi.fn(),
    hideOverlay: vi.fn(),
}));

vi.mock("../../listeners/mouseClick", () => ({
    addFocusedToolbar: vi.fn(),
}));

vi.mock("../getEntryPermissionsCached", () => ({
    getEntryPermissionsCached: vi.fn(),
}));

vi.mock("../getWorkflowStageDetails", () => ({
    getWorkflowStageDetails: vi.fn(),
}));

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
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
        previousSelectedEditableDOM.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        document.body.appendChild(previousSelectedEditableDOM);
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            previousSelectedEditableDOM;
    });
    afterEach(() => {
        document.body.innerHTML = "";
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            null;
    });
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
        const resizeObserverMock = {
            disconnect: vi.fn(),
        } as unknown as ResizeObserver;
        const overlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const visualBuilderContainerMock = document.createElement("div");

        const spyQuerySelector = vi
            .spyOn(document, "querySelector")
            .mockReturnValue(null);
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
        editableElementMock.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        const visualBuilderContainerMock = document.createElement("div");
        const overlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const resizeObserverMock = {
            disconnect: vi.fn(),
        } as unknown as ResizeObserver;

        const pseudoEditableElementMock = document.createElement("div");
        pseudoEditableElementMock.classList.add(
            "visual-builder__pseudo-editable-element"
        );
        visualBuilderContainerMock.appendChild(pseudoEditableElementMock);

        await act(async () => {
            await updateFocussedState({
                editableElement: editableElementMock,
                visualBuilderContainer: visualBuilderContainerMock,
                overlayWrapper: overlayWrapperMock,
                focusedToolbar: focusedToolbarMock,
                resizeObserver: resizeObserverMock,
            });
        });

        expect(pseudoEditableElementMock.style.visibility).toBe("visible");
    });

    it("should update position of toolbar", async () => {
        const editableElementMock = document.createElement("div");
        mockGetBoundingClientRect(editableElementMock);
        editableElementMock.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        const visualBuilderContainerMock = document.createElement("div");
        const overlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const resizeObserverMock = {
            disconnect: vi.fn(),
        } as unknown as ResizeObserver;

        const pseudoEditableElementMock = document.createElement("div");
        pseudoEditableElementMock.classList.add(
            "visual-builder__pseudo-editable-element"
        );
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
    });

    it("should handle entry permissions and field disabled state", async () => {
        const editableElementMock = document.createElement("div");
        editableElementMock.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        const visualBuilderContainerMock = document.createElement("div");
        const overlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const resizeObserverMock = {
            disconnect: vi.fn(),
        } as unknown as ResizeObserver;

        const mockEntryPermissions = {
            create: true,
            read: true,
            update: false,
            delete: true,
            publish: true,
        };

        const mockWorkflowStageDetails = {
            permissions: {
                entry: {
                    update: true,
                },
            },
            stage: undefined,
        };

        vi.mocked(getEntryPermissionsCached).mockResolvedValue(
            mockEntryPermissions
        );

        vi.mocked(getWorkflowStageDetails).mockResolvedValue(
            mockWorkflowStageDetails
        );

        await act(async () => {
            await updateFocussedState({
                editableElement: editableElementMock,
                visualBuilderContainer: visualBuilderContainerMock,
                overlayWrapper: overlayWrapperMock,
                focusedToolbar: focusedToolbarMock,
                resizeObserver: resizeObserverMock,
            });
        });

        expect(getEntryPermissionsCached).toHaveBeenCalledWith({
            entryUid: "entry_uid",
            contentTypeUid: "content_type_uid",
            locale: "locale",
        });

        expect(isFieldDisabled).toHaveBeenCalledWith(
            singleLineFieldSchema,
            {
                editableElement: editableElementMock,
                fieldMetadata: expect.any(Object),
            },
            mockEntryPermissions,
            mockWorkflowStageDetails
        );

        expect(addFocusOverlay).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            overlayWrapperMock,
            expect.any(Boolean)
        );
    });
});

describe("updateFocussedStateOnMutation", () => {
    beforeEach(() => {
        let previousSelectedEditableDOM: HTMLElement;
        previousSelectedEditableDOM = document.createElement("div");
        previousSelectedEditableDOM.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        document.body.appendChild(previousSelectedEditableDOM);
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            previousSelectedEditableDOM;
        // Clear all mocks before each test
        vi.clearAllMocks();
    });
    afterEach(() => {
        document.body.innerHTML = "";
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            null;
    });
    it("should return early if focusOverlayWrapper is not provided", () => {
        const result = updateFocussedStateOnMutation(null, null, null, null);
        expect(result).toBeUndefined();
    });

    it("should hide focus overlay if newSelectedElement is not found", () => {
        const resizeObserverMock = {
            disconnect: vi.fn(),
        } as unknown as ResizeObserver;
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

    /**
     * Test: Should re-initialize overlay using wasFocusOverlayDisabled and addFocusOverlay.
     * This validates the refactored behavior where overlay is fully re-initialized
     * instead of manually updating dimensions, ensuring disabled state is preserved.
     */
    it("should re-initialize overlay using wasFocusOverlayDisabled and addFocusOverlay", () => {
        const focusOverlayWrapperMock = document.createElement("div");
        const outlineMock = document.createElement("div");
        outlineMock.classList.add("visual-builder__overlay--outline");
        outlineMock.style.outlineColor = "#909090"; // disabled state
        focusOverlayWrapperMock.appendChild(outlineMock);

        const selectedElementMock = document.createElement("div");
        selectedElementMock.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        mockGetBoundingClientRect(selectedElementMock);

        document.querySelector = vi.fn().mockReturnValue(selectedElementMock);
        vi.mocked(wasFocusOverlayDisabled).mockReturnValue(true);

        updateFocussedStateOnMutation(
            focusOverlayWrapperMock,
            null,
            null,
            null
        );

        // Verify wasFocusOverlayDisabled was called to check previous state
        expect(wasFocusOverlayDisabled).toHaveBeenCalledWith(
            focusOverlayWrapperMock
        );
        // Verify addFocusOverlay was called with the disabled state preserved
        expect(addFocusOverlay).toHaveBeenCalledWith(
            selectedElementMock,
            focusOverlayWrapperMock,
            true
        );
    });

    /**
     * Test: Should call addFocusedToolbar when toolbar is empty and resizeObserver exists.
     * This validates the new toolbar initialization logic when toolbar needs to be created.
     */
    it("should call addFocusedToolbar when toolbar is empty", () => {
        const focusOverlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        // Toolbar is empty (no children)
        const visualBuilderContainerMock = document.createElement("div");
        const resizeObserverMock = {
            disconnect: vi.fn(),
            unobserve: vi.fn(),
        } as unknown as ResizeObserver;

        const selectedElementMock = document.createElement("div");
        selectedElementMock.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        mockGetBoundingClientRect(selectedElementMock);

        document.querySelector = vi.fn().mockReturnValue(selectedElementMock);
        vi.mocked(wasFocusOverlayDisabled).mockReturnValue(false);

        VisualBuilder.VisualBuilderGlobalState.value.focusElementObserver = null;
        VisualBuilder.VisualBuilderGlobalState.value.isFocussed = false;

        updateFocussedStateOnMutation(
            focusOverlayWrapperMock,
            focusedToolbarMock,
            visualBuilderContainerMock,
            resizeObserverMock
        );

        // Verify addFocusedToolbar was called with correct parameters
        expect(addFocusedToolbar).toHaveBeenCalledWith({
            eventDetails: expect.objectContaining({
                editableElement: selectedElementMock,
                cslpData: "content_type_uid.entry_uid.locale.field_path",
                fieldMetadata: expect.any(Object),
            }),
            focusedToolbar: focusedToolbarMock,
            hideOverlay: expect.any(Function),
            isVariant: false,
        });
    });

    /**
     * Test: Should position toolbar when it already has content.
     * This validates the optimization where existing toolbar is repositioned
     * instead of being recreated, avoiding unnecessary re-renders.
     */
    it("should position toolbar when it already has content", () => {
        const focusOverlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        // Toolbar has content (add a child)
        const toolbarChild = document.createElement("div");
        focusedToolbarMock.appendChild(toolbarChild);
        const visualBuilderContainerMock = document.createElement("div");
        const resizeObserverMock = {
            disconnect: vi.fn(),
        } as unknown as ResizeObserver;

        const selectedElementMock = document.createElement("div");
        selectedElementMock.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        mockGetBoundingClientRect(selectedElementMock);

        document.querySelector = vi.fn().mockReturnValue(selectedElementMock);
        vi.mocked(wasFocusOverlayDisabled).mockReturnValue(false);

        updateFocussedStateOnMutation(
            focusOverlayWrapperMock,
            focusedToolbarMock,
            visualBuilderContainerMock,
            resizeObserverMock
        );

        // Verify addFocusedToolbar was NOT called (toolbar has content)
        expect(addFocusedToolbar).not.toHaveBeenCalled();
        // Verify toolbar position was updated
        expect(focusedToolbarMock.style.top).toBe("49px");
        expect(focusedToolbarMock.style.left).toBe("8px");
    });

    /**
     * Test: Should not call addFocusedToolbar when resizeObserver is null.
     * Edge case: toolbar initialization requires resizeObserver to be present.
     */
    it("should not call addFocusedToolbar when resizeObserver is null", () => {
        const focusOverlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        // Toolbar is empty but no resizeObserver
        const visualBuilderContainerMock = document.createElement("div");

        const selectedElementMock = document.createElement("div");
        selectedElementMock.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        mockGetBoundingClientRect(selectedElementMock);

        document.querySelector = vi.fn().mockReturnValue(selectedElementMock);
        vi.mocked(wasFocusOverlayDisabled).mockReturnValue(false);

        updateFocussedStateOnMutation(
            focusOverlayWrapperMock,
            focusedToolbarMock,
            visualBuilderContainerMock,
            null
        );

        // Verify addFocusedToolbar was NOT called (no resizeObserver)
        expect(addFocusedToolbar).not.toHaveBeenCalled();
    });
});
