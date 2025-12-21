import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { addEventListeners, removeEventListeners } from "../index";
import * as mouseHoverModule from "../mouseHover";
import * as generateToolbarModule from "../../generators/generateToolbar";
import { VisualBuilder } from "../../index";

// Mock dependencies
vi.mock("../mouseClick", () => ({
    default: vi.fn(),
}));

vi.mock("../mouseHover", () => ({
    default: vi.fn(),
    cancelPendingMouseHover: vi.fn(),
    cancelPendingHoverToolbar: vi.fn(),
    cancelPendingAddOutline: vi.fn(),
    hideCustomCursor: vi.fn(),
    hideHoverOutline: vi.fn(),
    showCustomCursor: vi.fn(),
}));

vi.mock("../../generators/generateToolbar", () => ({
    removeFieldToolbar: vi.fn(),
}));

vi.mock("../../index", () => ({
    VisualBuilder: {
        VisualBuilderGlobalState: {
            value: {
                previousSelectedEditableDOM: null,
                isFocussed: false,
            },
        },
    },
}));

vi.mock("lodash-es", async () => ({
    ...(await import("lodash-es")),
    throttle: vi.fn((fn) => fn),
    debounce: vi.fn((fn) => fn),
}));

describe("mouseleave handler changes", () => {
    let overlayWrapper: HTMLDivElement;
    let visualBuilderContainer: HTMLDivElement;
    let focusedToolbar: HTMLDivElement;
    let customCursor: HTMLDivElement;
    let resizeObserver: ResizeObserver;

    beforeEach(() => {
        overlayWrapper = document.createElement("div");
        visualBuilderContainer = document.createElement("div");
        focusedToolbar = document.createElement("div");
        customCursor = document.createElement("div");
        resizeObserver = new ResizeObserver(() => {});

        vi.clearAllMocks();
    });

    afterEach(() => {
        removeEventListeners({
            overlayWrapper,
            visualBuilderContainer,
            previousSelectedEditableDOM: null,
            focusedToolbar,
            resizeObserver,
            customCursor,
        });
        vi.clearAllMocks();
    });

    test("should cancel pending operations on mouseleave", () => {
        addEventListeners({
            overlayWrapper,
            visualBuilderContainer,
            previousSelectedEditableDOM: null,
            focusedToolbar,
            resizeObserver,
            customCursor,
        });

        const mouseleaveEvent = new Event("mouseleave", { bubbles: true });
        document.documentElement.dispatchEvent(mouseleaveEvent);

        expect(mouseHoverModule.cancelPendingMouseHover).toHaveBeenCalled();
        expect(mouseHoverModule.cancelPendingHoverToolbar).toHaveBeenCalled();
        expect(mouseHoverModule.cancelPendingAddOutline).toHaveBeenCalled();
    });

    test("should remove field toolbar on mouseleave when not focused", () => {
        VisualBuilder.VisualBuilderGlobalState.value.isFocussed = false;

        addEventListeners({
            overlayWrapper,
            visualBuilderContainer,
            previousSelectedEditableDOM: null,
            focusedToolbar,
            resizeObserver,
            customCursor,
        });

        const mouseleaveEvent = new Event("mouseleave", { bubbles: true });
        document.documentElement.dispatchEvent(mouseleaveEvent);

        expect(generateToolbarModule.removeFieldToolbar).toHaveBeenCalledWith(
            focusedToolbar
        );
    });

    test("should not remove field toolbar on mouseleave when focused", () => {
        VisualBuilder.VisualBuilderGlobalState.value.isFocussed = true;

        addEventListeners({
            overlayWrapper,
            visualBuilderContainer,
            previousSelectedEditableDOM: null,
            focusedToolbar,
            resizeObserver,
            customCursor,
        });

        const mouseleaveEvent = new Event("mouseleave", { bubbles: true });
        document.documentElement.dispatchEvent(mouseleaveEvent);

        expect(generateToolbarModule.removeFieldToolbar).not.toHaveBeenCalled();
    });

    test("should not remove field toolbar when focusedToolbar is null", () => {
        VisualBuilder.VisualBuilderGlobalState.value.isFocussed = false;

        addEventListeners({
            overlayWrapper,
            visualBuilderContainer,
            previousSelectedEditableDOM: null,
            focusedToolbar: null,
            resizeObserver,
            customCursor,
        });

        const mouseleaveEvent = new Event("mouseleave", { bubbles: true });
        document.documentElement.dispatchEvent(mouseleaveEvent);

        expect(generateToolbarModule.removeFieldToolbar).not.toHaveBeenCalled();
    });
});
