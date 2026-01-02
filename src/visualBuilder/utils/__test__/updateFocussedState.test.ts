import { describe, it, expect, vi } from "vitest";
import {
    updateFocussedState,
    updateFocussedStateOnMutation,
} from "../updateFocussedState";
import { VisualBuilder } from "../..";
import {
    addFocusOverlay,
    hideOverlay,
} from "../../generators/generateOverlay";
import { mockGetBoundingClientRect } from "../../../__test__/utils";
import { act } from "@testing-library/preact";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import { fetchEntryPermissionsAndStageDetails } from "../fetchEntryPermissionsAndStageDetails";
import { isFieldDisabled } from "../isFieldDisabled";
import { getEntryPermissionsCached } from "../getEntryPermissionsCached";

vi.mock("../../generators/generateOverlay", () => ({
    addFocusOverlay: vi.fn(),
    hideOverlay: vi.fn(),
}));

vi.mock("../fetchEntryPermissionsAndStageDetails", () => ({
    fetchEntryPermissionsAndStageDetails: vi.fn(),
}));

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
}));

vi.mock("../getEntryPermissionsCached", () => ({
    getEntryPermissionsCached: vi.fn(),
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
        const previousSelectedEditableDOM = document.createElement("div");
        previousSelectedEditableDOM.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.field_path"
        );
        document.body.appendChild(previousSelectedEditableDOM);
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            previousSelectedEditableDOM;

        // Set up default mock for fetchEntryPermissionsAndStageDetails for all tests
        vi.mocked(fetchEntryPermissionsAndStageDetails).mockResolvedValue({
            acl: {
                create: true,
                read: true,
                update: true,
                delete: true,
                publish: true,
            },
            workflowStage: {
                permissions: {
                    entry: {
                        update: true,
                    },
                },
                stage: undefined,
            },
            resolvedVariantPermissions: {
                update: true,
            },
        });
        vi.clearAllMocks();
    });
    afterEach(() => {
        document.body.innerHTML = "";
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            null;
        vi.clearAllMocks();
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

    it("should call hideOverlay if newPreviousSelectedElement is not found", () => {
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

        expect(hideOverlay).toHaveBeenCalledWith({
            visualBuilderOverlayWrapper: overlayWrapperMock,
            focusedToolbar: focusedToolbarMock,
            visualBuilderContainer: visualBuilderContainerMock,
            resizeObserver: resizeObserverMock,
            noTrigger: true,
        });
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

        const mockPermissionsResponse = {
            acl: {
                create: true,
                read: true,
                update: false,
                delete: true,
                publish: true,
            },
            workflowStage: {
                permissions: {
                    entry: {
                        update: true,
                    },
                },
                stage: undefined,
            },
            resolvedVariantPermissions: {
                update: true,
            },
        };

        vi.mocked(fetchEntryPermissionsAndStageDetails).mockResolvedValue(
            mockPermissionsResponse
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

        expect(fetchEntryPermissionsAndStageDetails).toHaveBeenCalledWith({
            entryUid: "entry_uid",
            contentTypeUid: "content_type_uid",
            locale: "locale",
            fieldPathWithIndex: "field_path",
            variantUid: undefined,
        });

        expect(isFieldDisabled).toHaveBeenCalledWith(
            singleLineFieldSchema,
            {
                editableElement: editableElementMock,
                fieldMetadata: expect.any(Object),
            },
            {
                update: true,
            },
            {
                create: true,
                read: true,
                update: false,
                delete: true,
                publish: true,
            },
            {
                permissions: {
                    entry: {
                        update: true,
                    },
                },
                stage: undefined,
            }
        );

        expect(addFocusOverlay).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            overlayWrapperMock,
            expect.any(Boolean)
        );
    });

    it("should return early if data-cslp attribute is invalid", async () => {
        const editableElementMock = document.createElement("div");
        editableElementMock.setAttribute("data-cslp", "");
        const visualBuilderContainerMock = document.createElement("div");
        const overlayWrapperMock = document.createElement("div");
        const focusedToolbarMock = document.createElement("div");
        const resizeObserverMock = {
            disconnect: vi.fn(),
        } as unknown as ResizeObserver;

        const previousSelectedEditableDOM = document.createElement("div");
        previousSelectedEditableDOM.setAttribute("data-cslp", "content_type_uid.entry_uid.locale.field_path");
        document.body.appendChild(previousSelectedEditableDOM);
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            previousSelectedEditableDOM;

        document.querySelector = vi.fn().mockReturnValue(previousSelectedEditableDOM);

        const result = await updateFocussedState({
            editableElement: editableElementMock,
            visualBuilderContainer: visualBuilderContainerMock,
            overlayWrapper: overlayWrapperMock,
            focusedToolbar: focusedToolbarMock,
            resizeObserver: resizeObserverMock,
        });

        // Should return early without processing
        expect(result).toBeUndefined();
        expect(getEntryPermissionsCached).not.toHaveBeenCalled();
        expect(addFocusOverlay).not.toHaveBeenCalled();
    });
});

describe("updateFocussedStateOnMutation", () => {
    beforeEach(() => {
        const previousSelectedEditableDOM = document.createElement("div");
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
    it("should return early if focusOverlayWrapper is not provided", () => {
        const result = updateFocussedStateOnMutation(null, null, null, null);
        expect(result).toBeUndefined();
    });

    it("should call hideOverlay if newSelectedElement is not found", () => {
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

        expect(hideOverlay).toHaveBeenCalledWith({
            visualBuilderOverlayWrapper: focusOverlayWrapperMock,
            focusedToolbar: focusedToolbarMock,
            visualBuilderContainer: visualBuilderContainerMock,
            resizeObserver: resizeObserverMock,
            noTrigger: true,
        });
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
