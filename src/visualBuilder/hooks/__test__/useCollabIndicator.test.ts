/**
 * @vitest-environment jsdom
 */

import { renderHook, act, waitFor } from "@testing-library/preact";
import { vi } from "vitest";
import { useCollabIndicator } from "../useCollabIndicator";
import Config from "../../../configManager/configManager";
import {
    calculatePopupPosition,
    handleEmptyThreads,
    toggleCollabPopup,
} from "../../generators/generateThread";

// Mock dependencies
vi.mock("../../../configManager/configManager", () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

vi.mock("../../generators/generateThread", () => ({
    calculatePopupPosition: vi.fn(),
    handleEmptyThreads: vi.fn(),
    toggleCollabPopup: vi.fn(),
}));

describe("useCollabIndicator", () => {
    let mockButton: HTMLButtonElement;
    let mockPopup: HTMLDivElement;
    let mockParentDiv: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup DOM elements
        mockButton = document.createElement("button");
        mockPopup = document.createElement("div");
        mockParentDiv = document.createElement("div");
        mockParentDiv.setAttribute("field-path", "test-path");
        mockParentDiv.appendChild(mockButton);
        document.body.appendChild(mockParentDiv);
        document.body.appendChild(mockPopup);

        // Mock Config
        (Config.get as any).mockReturnValue({
            collab: {
                isFeedbackMode: true,
            },
        });
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("should initialize with correct state based on props", () => {
        // Test newThread true
        const { result: result1 } = renderHook(() =>
            useCollabIndicator({ newThread: true })
        );
        expect(result1.current.showPopup).toBe(true);
        expect(result1.current.activeThread._id).toBe("new");

        // Test provided thread
        const thread = { _id: "thread-123" };
        const { result: result2 } = renderHook(() =>
            useCollabIndicator({ thread, newThread: false })
        );
        expect(result2.current.showPopup).toBe(false);
        expect(result2.current.activeThread._id).toBe("thread-123");

        // Test default (no props)
        const { result: result3 } = renderHook(() => useCollabIndicator({}));
        expect(result3.current.showPopup).toBe(false);
        expect(result3.current.activeThread._id).toBe("new");
    });

    it("should update popup position when showPopup changes", async () => {
        const { result } = renderHook(() => useCollabIndicator({}));

        act(() => {
            result.current.buttonRef.current = mockButton;
            result.current.popupRef.current = mockPopup;
        });

        act(() => {
            result.current.setShowPopup(true);
        });

        await waitFor(() => {
            expect(calculatePopupPosition).toHaveBeenCalledWith(
                mockButton,
                mockPopup
            );
        });
    });

    it("should handle toggleCollabPopup events (open and close)", async () => {
        const { result } = renderHook(() => useCollabIndicator({}));

        const threadDiv = document.createElement("div");
        threadDiv.setAttribute("threaduid", "thread-123");
        threadDiv.appendChild(mockButton);
        document.body.appendChild(threadDiv);

        // Mock scrollIntoView for jsdom environment
        threadDiv.scrollIntoView = vi.fn();

        act(() => {
            result.current.buttonRef.current = mockButton;
        });

        // Open action
        act(() => {
            document.dispatchEvent(
                new CustomEvent("toggleCollabPopup", {
                    detail: { threadUid: "thread-123", action: "open" },
                })
            );
        });

        await waitFor(() => {
            expect(handleEmptyThreads).toHaveBeenCalled();
            expect(result.current.showPopup).toBe(true);
        });

        // Close action
        act(() => {
            document.dispatchEvent(
                new CustomEvent("toggleCollabPopup", {
                    detail: { threadUid: "thread-123", action: "close" },
                })
            );
        });

        await waitFor(() => {
            expect(result.current.showPopup).toBe(false);
        });
    });

    it("should toggle popup when togglePopup is called", () => {
        const { result } = renderHook(() => useCollabIndicator({}));

        act(() => {
            result.current.buttonRef.current = mockButton;
        });

        act(() => {
            result.current.togglePopup();
        });

        expect(toggleCollabPopup).toHaveBeenCalledWith({
            threadUid: "",
            action: "close",
        });
        expect(result.current.showPopup).toBe(true);
        expect(mockParentDiv.style.zIndex).toBe("1000");
    });

    it("should set feedback mode when closing popup", () => {
        (Config.get as any).mockReturnValue({
            collab: {
                isFeedbackMode: false,
            },
        });

        const { result } = renderHook(() =>
            useCollabIndicator({ newThread: true })
        );

        act(() => {
            result.current.buttonRef.current = mockButton;
        });

        act(() => {
            result.current.togglePopup();
        });

        expect(result.current.showPopup).toBe(false);
        expect(Config.set).toHaveBeenCalledWith("collab.isFeedbackMode", true);
    });

    it("should remove parent div when closing popup if it has no threaduid", () => {
        const { result } = renderHook(() =>
            useCollabIndicator({ newThread: true })
        );

        act(() => {
            result.current.buttonRef.current = mockButton;
        });

        const removeSpy = vi.spyOn(mockParentDiv, "remove");

        act(() => {
            result.current.togglePopup();
        });

        expect(removeSpy).toHaveBeenCalled();
    });

    it("should not remove parent div when closing popup if it has threaduid", () => {
        mockParentDiv.setAttribute("threaduid", "thread-123");

        const { result } = renderHook(() =>
            useCollabIndicator({ newThread: true })
        );

        act(() => {
            result.current.buttonRef.current = mockButton;
        });

        const removeSpy = vi.spyOn(mockParentDiv, "remove");

        act(() => {
            result.current.togglePopup();
        });

        expect(removeSpy).not.toHaveBeenCalled();
    });

    it("should scroll thread into view when opening", async () => {
        const { result } = renderHook(() => useCollabIndicator({}));

        const threadDiv = document.createElement("div");
        threadDiv.setAttribute("threaduid", "thread-123");
        threadDiv.appendChild(mockButton);
        document.body.appendChild(threadDiv);

        threadDiv.scrollIntoView = vi.fn();
        const scrollIntoViewSpy = vi.spyOn(threadDiv, "scrollIntoView");

        act(() => {
            result.current.buttonRef.current = mockButton;
        });

        act(() => {
            document.dispatchEvent(
                new CustomEvent("toggleCollabPopup", {
                    detail: { threadUid: "thread-123", action: "open" },
                })
            );
        });

        await waitFor(
            () => {
                expect(scrollIntoViewSpy).toHaveBeenCalledWith({
                    behavior: "smooth",
                    block: "center",
                });
            },
            { timeout: 2000 }
        );
    });

    it("should update activeThread when setActiveThread is called", () => {
        const { result } = renderHook(() => useCollabIndicator({}));

        const newThread = { _id: "new-thread-456" };

        act(() => {
            result.current.setActiveThread(newThread);
        });

        expect(result.current.activeThread._id).toBe("new-thread-456");
    });
});
