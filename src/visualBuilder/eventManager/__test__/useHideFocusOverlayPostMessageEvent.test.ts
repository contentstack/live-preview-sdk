/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useHideFocusOverlayPostMessageEvent } from "../useHideFocusOverlayPostMessageEvent";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { hideOverlay } from "../../generators/generateOverlay";
import Config from "../../../configManager/configManager";

// Mock dependencies
vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        on: vi.fn(),
    },
}));

vi.mock("../../generators/generateOverlay", () => ({
    hideOverlay: vi.fn(),
}));

vi.mock("../../../configManager/configManager", () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

describe("useHideFocusOverlayPostMessageEvent", () => {
    let mockOn: ReturnType<typeof vi.fn>;
    let overlayWrapper: HTMLDivElement;
    let visualBuilderContainer: HTMLDivElement;
    let focusedToolbar: HTMLDivElement;
    let resizeObserver: ResizeObserver;

    beforeEach(() => {
        vi.clearAllMocks();
        mockOn = vi.fn();
        (visualBuilderPostMessage as any).on = mockOn;

        overlayWrapper = document.createElement("div");
        visualBuilderContainer = document.createElement("div");
        focusedToolbar = document.createElement("div");
        resizeObserver = new ResizeObserver(() => {});

        (Config.get as any).mockReturnValue({
            collab: {
                enable: false,
                pauseFeedback: false,
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should register event listener for HIDE_FOCUS_OVERLAY", () => {
        useHideFocusOverlayPostMessageEvent({
            overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
        });

        expect(mockOn).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.HIDE_FOCUS_OVERLAY,
            expect.any(Function)
        );
    });

    it("should call hideOverlay when event is triggered", () => {
        useHideFocusOverlayPostMessageEvent({
            overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
        });

        const handler = mockOn.mock.calls[0][1];
        handler({
            data: {
                noTrigger: false,
                fromCollab: false,
            },
        });

        expect(hideOverlay).toHaveBeenCalledWith({
            visualBuilderOverlayWrapper: overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
            noTrigger: false,
        });
    });

    it("should set collab config when fromCollab is true", () => {
        useHideFocusOverlayPostMessageEvent({
            overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
        });

        const handler = mockOn.mock.calls[0][1];
        handler({
            data: {
                noTrigger: false,
                fromCollab: true,
            },
        });

        expect(Config.set).toHaveBeenCalledWith("collab.enable", true);
        expect(Config.set).toHaveBeenCalledWith("collab.pauseFeedback", true);
        expect(hideOverlay).toHaveBeenCalled();
    });

    it("should pass noTrigger flag correctly", () => {
        useHideFocusOverlayPostMessageEvent({
            overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
        });

        const handler = mockOn.mock.calls[0][1];
        handler({
            data: {
                noTrigger: true,
                fromCollab: false,
            },
        });

        expect(hideOverlay).toHaveBeenCalledWith({
            visualBuilderOverlayWrapper: overlayWrapper,
            visualBuilderContainer,
            focusedToolbar,
            resizeObserver,
            noTrigger: true,
        });
    });
});

