import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { usePopupBlockedPostMessageEvent } from "../usePopupBlockedPostMessageEvent";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { popupBlockedModalManager } from "../../components/PopupBlockedModalManager";

// Mock the visualBuilderPostMessage
vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        on: vi.fn(),
    },
}));

// Mock the popupBlockedModalManager
vi.mock("../../components/PopupBlockedModalManager", () => ({
    popupBlockedModalManager: {
        show: vi.fn(),
        hide: vi.fn(),
    },
}));

describe("usePopupBlockedPostMessageEvent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should register a listener for popup blocked event", () => {
        usePopupBlockedPostMessageEvent();

        expect(visualBuilderPostMessage?.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.POPUP_BLOCKED,
            expect.any(Function)
        );
    });

    it("should display a modal when popup blocked event is received", () => {
        let popupBlockedCallback: (() => void) | undefined;

        // Capture the callback function
        (
            visualBuilderPostMessage?.on as ReturnType<typeof vi.fn>
        ).mockImplementation((event: string, callback: () => void) => {
            if (event === VisualBuilderPostMessageEvents.POPUP_BLOCKED) {
                popupBlockedCallback = callback;
            }
        });

        usePopupBlockedPostMessageEvent();

        // Verify the callback was registered
        expect(popupBlockedCallback).toBeDefined();

        // Trigger the callback
        if (popupBlockedCallback) {
            popupBlockedCallback();
        }

        // Verify modal show was called
        expect(popupBlockedModalManager.show).toHaveBeenCalled();
    });

    it("should handle case when visualBuilderPostMessage is undefined", () => {
        const originalPostMessage = visualBuilderPostMessage;

        // Mock visualBuilderPostMessage as undefined
        vi.doMock("../../utils/visualBuilderPostMessage", () => ({
            default: undefined,
        }));

        // Should not throw an error
        expect(() => usePopupBlockedPostMessageEvent()).not.toThrow();
    });
});
