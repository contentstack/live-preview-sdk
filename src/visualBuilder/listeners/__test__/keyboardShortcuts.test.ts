/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { addKeyboardShortcuts } from "../keyboardShortcuts";
import { hideOverlay } from "../../generators/generateOverlay";

// Mock dependencies
vi.mock("../../generators/generateOverlay", () => ({
    hideOverlay: vi.fn(),
}));

describe("addKeyboardShortcuts", () => {
    let overlayWrapper: HTMLDivElement;
    let visualBuilderContainer: HTMLDivElement;
    let focusedToolbar: HTMLDivElement;
    let resizeObserver: ResizeObserver;
    let keydownHandler: ((e: Event) => void) | null = null;

    beforeEach(() => {
        overlayWrapper = document.createElement("div");
        visualBuilderContainer = document.createElement("div");
        focusedToolbar = document.createElement("div");
        resizeObserver = new ResizeObserver(() => {});

        // Track and clean up event listeners
        const originalAddEventListener = document.addEventListener.bind(document);
        vi.spyOn(document, "addEventListener").mockImplementation(
            (type: string, listener: any) => {
                if (type === "keydown") {
                    keydownHandler = listener;
                }
                return originalAddEventListener(type, listener);
            }
        );

        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up event listeners
        if (keydownHandler) {
            document.removeEventListener("keydown", keydownHandler);
            keydownHandler = null;
        }
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it("should call hideOverlay when Escape key is pressed", () => {
        addKeyboardShortcuts({
            overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
        });

        const escapeEvent = new KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
        });

        document.dispatchEvent(escapeEvent);

        expect(hideOverlay).toHaveBeenCalledWith({
            visualBuilderOverlayWrapper: overlayWrapper,
            visualBuilderContainer,
            focusedToolbar: focusedToolbar,
            resizeObserver: resizeObserver,
        });
    });

    it("should not call hideOverlay when other keys are pressed", () => {
        addKeyboardShortcuts({
            overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
        });

        const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
        });

        document.dispatchEvent(enterEvent);

        expect(hideOverlay).not.toHaveBeenCalled();
    });

    it("should handle multiple Escape key presses", () => {
        addKeyboardShortcuts({
            overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
        });

        // Reset mock to only count calls from this test
        vi.clearAllMocks();

        const escapeEvent1 = new KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
        });
        const escapeEvent2 = new KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
        });

        document.dispatchEvent(escapeEvent1);
        document.dispatchEvent(escapeEvent2);

        expect(hideOverlay).toHaveBeenCalledTimes(2);
    });

    it("should cast event to KeyboardEvent correctly", () => {
        addKeyboardShortcuts({
            overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
        });

        // Dispatch a generic Event (not KeyboardEvent) to test casting
        const genericEvent = new Event("keydown", { bubbles: true });
        Object.defineProperty(genericEvent, "key", {
            value: "Escape",
            writable: true,
        });

        document.dispatchEvent(genericEvent as KeyboardEvent);

        expect(hideOverlay).toHaveBeenCalled();
    });
});

