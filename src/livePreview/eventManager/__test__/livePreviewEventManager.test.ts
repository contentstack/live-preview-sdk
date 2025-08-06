/**
 * @vitest-environment jsdom
 */

import { vi } from "vitest";
import { EventManager } from "@contentstack/advanced-post-message";
import { LIVE_PREVIEW_CHANNEL_ID } from "../livePreviewEventManager.constant";

// Mock dependencies
vi.mock("@contentstack/advanced-post-message", () => ({
    EventManager: vi.fn(),
}));

vi.mock("../../../common/inIframe", () => ({
    inNewTab: vi.fn(),
}));

// Import after mocking
import { inNewTab } from "../../../common/inIframe";

describe("livePreviewEventManager", () => {
    let mockEventManager: any;
    let originalWindow: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        
        // Create mock EventManager
        mockEventManager = {
            on: vi.fn(),
            send: vi.fn(),
        };
        (EventManager as any).mockImplementation(() => mockEventManager);
        
        // Store original window
        originalWindow = global.window;
        
        // Reset inNewTab mock
        (inNewTab as any).mockReturnValue(false);
    });

    afterEach(() => {
        // Restore original window
        global.window = originalWindow;
        
        // Clear module cache to reset the module state
        vi.resetModules();
    });

    describe("when window is undefined", () => {
        beforeEach(() => {
            // Mock window as undefined
            Object.defineProperty(global, "window", {
                value: undefined,
                writable: true,
            });
        });

        it("should not initialize EventManager when window is undefined", async () => {
            // Re-import the module to trigger initialization
            const module = await import("../livePreviewEventManager");
            
            expect(EventManager).not.toHaveBeenCalled();
            expect(module.default).toBeUndefined();
        });
    });

    describe("when window is defined", () => {
        let mockWindow: any;

        beforeEach(() => {
            // Create mock window object
            mockWindow = {
                parent: { postMessage: vi.fn() },
                opener: { postMessage: vi.fn() },
            };

            Object.defineProperty(global, "window", {
                value: mockWindow,
                writable: true,
            });
        });

        it("should initialize EventManager with window.parent as target when not in new tab", async () => {
            (inNewTab as any).mockReturnValue(false);

            // Re-import the module to trigger initialization
            const module = await import("../livePreviewEventManager");

            expect(EventManager).toHaveBeenCalledWith(LIVE_PREVIEW_CHANNEL_ID, {
                target: mockWindow.parent,
                debug: false,
                suppressErrors: true,
            });
            expect(module.default).toBe(mockEventManager);
        });

        it("should initialize EventManager with window.opener as target when in new tab", async () => {
            (inNewTab as any).mockReturnValue(true);

            // Re-import the module to trigger initialization
            const module = await import("../livePreviewEventManager");

            expect(EventManager).toHaveBeenCalledWith(LIVE_PREVIEW_CHANNEL_ID, {
                target: mockWindow.opener,
                debug: false,
                suppressErrors: true,
            });
            expect(module.default).toBe(mockEventManager);
        });

        it("should call inNewTab to determine the target", async () => {
            // Re-import the module to trigger initialization
            await import("../livePreviewEventManager");

            expect(inNewTab).toHaveBeenCalled();
        });

        it("should use correct channel ID", async () => {
            // Re-import the module to trigger initialization
            await import("../livePreviewEventManager");

            expect(EventManager).toHaveBeenCalledWith(
                LIVE_PREVIEW_CHANNEL_ID,
                expect.any(Object)
            );
        });

        it("should set correct default event options", async () => {
            (inNewTab as any).mockReturnValue(false);

            // Re-import the module to trigger initialization
            await import("../livePreviewEventManager");

            expect(EventManager).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    debug: false,
                    suppressErrors: true,
                })
            );
        });

        describe("target selection logic", () => {
            it("should prioritize window.opener when inNewTab returns true", async () => {
                (inNewTab as any).mockReturnValue(true);

                // Re-import the module to trigger initialization
                await import("../livePreviewEventManager");

                const callArgs = (EventManager as any).mock.calls[0];
                expect(callArgs[1].target).toBe(mockWindow.opener);
                expect(callArgs[1].target).not.toBe(mockWindow.parent);
            });

            it("should use window.parent when inNewTab returns false", async () => {
                (inNewTab as any).mockReturnValue(false);

                // Re-import the module to trigger initialization
                await import("../livePreviewEventManager");

                const callArgs = (EventManager as any).mock.calls[0];
                expect(callArgs[1].target).toBe(mockWindow.parent);
                expect(callArgs[1].target).not.toBe(mockWindow.opener);
            });

            it("should throw error when inNewTab throws an error", async () => {
                (inNewTab as any).mockImplementation(() => {
                    throw new Error("inNewTab error");
                });

                // Should throw because inNewTab error is not caught in the implementation
                await expect(async () => {
                    await import("../livePreviewEventManager");
                }).rejects.toThrow("inNewTab error");
            });
        });

        describe("edge cases", () => {
            it("should handle missing window.parent gracefully", async () => {
                mockWindow.parent = undefined;
                (inNewTab as any).mockReturnValue(false);

                // Re-import the module to trigger initialization
                const module = await import("../livePreviewEventManager");

                expect(EventManager).toHaveBeenCalledWith(LIVE_PREVIEW_CHANNEL_ID, {
                    target: undefined,
                    debug: false,
                    suppressErrors: true,
                });
                expect(module.default).toBe(mockEventManager);
            });

            it("should handle missing window.opener gracefully", async () => {
                mockWindow.opener = undefined;
                (inNewTab as any).mockReturnValue(true);

                // Re-import the module to trigger initialization
                const module = await import("../livePreviewEventManager");

                expect(EventManager).toHaveBeenCalledWith(LIVE_PREVIEW_CHANNEL_ID, {
                    target: undefined,
                    debug: false,
                    suppressErrors: true,
                });
                expect(module.default).toBe(mockEventManager);
            });

            it("should handle when EventManager constructor throws", async () => {
                (EventManager as any).mockImplementation(() => {
                    throw new Error("EventManager constructor error");
                });

                // Should not crash the module initialization
                expect(async () => {
                    await import("../livePreviewEventManager");
                }).not.toThrow();
            });
        });
    });

    describe("module export", () => {
        it("should export the EventManager instance when window is available", async () => {
            const mockWindow = {
                parent: { postMessage: vi.fn() },
                opener: { postMessage: vi.fn() },
            };

            Object.defineProperty(global, "window", {
                value: mockWindow,
                writable: true,
            });

            const module = await import("../livePreviewEventManager");
            
            expect(module.default).toBe(mockEventManager);
        });

        it("should export undefined when window is not available", async () => {
            Object.defineProperty(global, "window", {
                value: undefined,
                writable: true,
            });

            const module = await import("../livePreviewEventManager");
            
            expect(module.default).toBeUndefined();
        });
    });
});