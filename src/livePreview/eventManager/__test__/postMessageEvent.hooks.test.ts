/**
 * @vitest-environment jsdom
 */

import { vi } from "vitest";
import Config, { setConfigFromParams } from "../../../configManager/configManager";
import { PublicLogger } from "../../../logger/logger";
import livePreviewPostMessage from "../livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "../livePreviewEventManager.constant";
import {
    OnChangeLivePreviewPostMessageEventData,
    OnChangeLivePreviewPostMessageEventTypes,
    HistoryLivePreviewPostMessageEventData,
} from "../types/livePreviewPostMessageEvent.type";
import {
    useOnEntryUpdatePostMessageEvent,
    useHistoryPostMessageEvent,
} from "../postMessageEvent.hooks";
import { isOpeningInNewTab } from "../../../common/inIframe";

// Mock dependencies
vi.mock("../../../configManager/configManager", () => ({
    default: {
        get: vi.fn(),
    },
    setConfigFromParams: vi.fn(),
}));

vi.mock("../../../logger/logger", () => ({
    PublicLogger: {
        error: vi.fn(),
    },
}));

vi.mock("../livePreviewEventManager", () => ({
    default: {
        on: vi.fn(),
    },
}));

vi.mock("../../../common/inIframe", () => ({
    isOpeningInNewTab: vi.fn(),
}));

describe("postMessageEvent.hooks", () => {
    let mockWindow: any;
    let mockConfig: any;
    let mockOnChange: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Mock window object
        mockWindow = {
            location: {
                href: "https://example.com",
                reload: vi.fn(),
            },
            history: {
                pushState: vi.fn(),
                forward: vi.fn(),
                back: vi.fn(),
                go: vi.fn(),
            },
        };

        // Make location.href writable
        Object.defineProperty(mockWindow.location, 'href', {
            writable: true,
            value: "https://example.com"
        });
        
        // Mock onChange function
        mockOnChange = vi.fn();

        // Setup global window mock
        Object.defineProperty(global, "window", {
            value: mockWindow,
            writable: true,
        });

        // Setup default config mock
        mockConfig = {
            ssr: false,
            onChange: mockOnChange,
        };

        (Config.get as unknown as { mockReturnValue: (val: any) => void }).mockReturnValue(mockConfig);
        (livePreviewPostMessage?.on as unknown as { mockImplementation: (fn: any) => void })?.mockImplementation(
            (event: string, callback: (...args: any[]) => void) => {
                // Store the callback for manual triggering in tests
                mockWindow._eventCallbacks = mockWindow._eventCallbacks || {};
                mockWindow._eventCallbacks[event] = callback;
            }
        );

        // Mock isOpeningInNewTab to return true by default
        (isOpeningInNewTab as any).mockReturnValue(true);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("useOnEntryUpdatePostMessageEvent", () => {
        beforeEach(() => {
            useOnEntryUpdatePostMessageEvent();
        });

        it("should register event listener for ON_CHANGE events", () => {
            expect(livePreviewPostMessage?.on).toHaveBeenCalledWith(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
                expect.any(Function)
            );
        });

        describe("CSR (Client-Side Rendering) scenarios", () => {
            beforeEach(() => {
                mockConfig.ssr = false;
                (Config.get as any).mockReturnValue(mockConfig);
            });

            it("should call onChange when ssr is false and no event_type", () => {
                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(setConfigFromParams).toHaveBeenCalledWith({
                    live_preview: "test-hash",
                });
                expect(mockOnChange).toHaveBeenCalled();
            });

            it("should not call onChange when event_type is present", () => {
                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                    _metadata: {
                        event_type: OnChangeLivePreviewPostMessageEventTypes.HASH_CHANGE,
                    },
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(setConfigFromParams).toHaveBeenCalledWith({
                    live_preview: "test-hash",
                });
                expect(mockOnChange).not.toHaveBeenCalled();
            });
        });

        describe("SSR (Server-Side Rendering) scenarios", () => {
            beforeEach(() => {
                mockConfig.ssr = true;
                (Config.get as any).mockReturnValue(mockConfig);
            });

            it("should reload window when ssr is true and no event_type and all params present", () => {
                // Set URL to include all required params so reload path is taken
                mockWindow.location.href = "https://example.com?live_preview=old-hash&content_type_uid=blog&entry_uid=entry-123";

                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(setConfigFromParams).toHaveBeenCalledWith({
                    live_preview: "test-hash",
                });
                expect(mockWindow.location.reload).toHaveBeenCalled();
                expect(mockOnChange).not.toHaveBeenCalled();
            });

            it("should not reload window when event_type is present", () => {
                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                    _metadata: {
                        event_type: OnChangeLivePreviewPostMessageEventTypes.URL_CHANGE,
                    },
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(setConfigFromParams).toHaveBeenCalledWith({
                    live_preview: "test-hash",
                });
                expect(mockWindow.location.reload).not.toHaveBeenCalled();
                expect(mockOnChange).not.toHaveBeenCalled();
            });
        });

        describe("HASH_CHANGE event type", () => {
            beforeEach(() => {
                // Reset config for these tests to non-SSR
                mockConfig.ssr = false;
                (Config.get as any).mockReturnValue(mockConfig);
            });

            it("should update URL with new hash in query params", () => {
                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "new-hash-value",
                    _metadata: {
                        event_type: OnChangeLivePreviewPostMessageEventTypes.HASH_CHANGE,
                    },
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(setConfigFromParams).toHaveBeenCalledWith({
                    live_preview: "new-hash-value",
                });
                expect(mockWindow.history.pushState).toHaveBeenCalledWith(
                    {},
                    "",
                    "https://example.com/?live_preview=new-hash-value"
                );
            });

            it("should update existing live_preview param in URL", () => {
                mockWindow.location.href = "https://example.com/?existing=param&live_preview=old-hash";
                
                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "updated-hash",
                    _metadata: {
                        event_type: OnChangeLivePreviewPostMessageEventTypes.HASH_CHANGE,
                    },
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(setConfigFromParams).toHaveBeenCalledWith({
                    live_preview: "updated-hash",
                });
                expect(mockWindow.history.pushState).toHaveBeenCalledWith(
                    {},
                    "",
                    "https://example.com/?existing=param&live_preview=updated-hash"
                );
            });
        });

        describe("URL_CHANGE event type", () => {
            beforeEach(() => {
                // Reset config for these tests to non-SSR
                mockConfig.ssr = false;
                (Config.get as any).mockReturnValue(mockConfig);
            });

            it("should navigate to new URL when url is provided", () => {
                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                    url: "https://newdomain.com/new-page",
                    _metadata: {
                        event_type: OnChangeLivePreviewPostMessageEventTypes.URL_CHANGE,
                    },
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(setConfigFromParams).toHaveBeenCalledWith({
                    live_preview: "test-hash",
                });
                expect(mockWindow.location.href).toBe("https://newdomain.com/new-page");
            });

            it("should not navigate when URL_CHANGE event type is present but url is not provided", () => {
                const originalHref = mockWindow.location.href;
                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                    _metadata: {
                        event_type: OnChangeLivePreviewPostMessageEventTypes.URL_CHANGE,
                    },
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(setConfigFromParams).toHaveBeenCalledWith({
                    live_preview: "test-hash",
                });
                expect(mockWindow.location.href).toBe(originalHref);
            });
        });

        describe("Error handling", () => {
            it("should log error and return when window is not defined", () => {
                // Mock isOpeningInNewTab to return true so we enter the if block
                (isOpeningInNewTab as any).mockReturnValue(true);
                
                // Mock window as undefined
                Object.defineProperty(global, "window", {
                    value: undefined,
                    writable: true,
                });

                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(PublicLogger.error).toHaveBeenCalledWith("window is not defined");

                // Restore window for other tests
                Object.defineProperty(global, "window", {
                    value: mockWindow,
                    writable: true,
                });
            });

            it("should handle errors in try-catch block", () => {
                // Mock Config.get to throw an error
                (Config.get as any).mockImplementation(() => {
                    throw new Error("Config error");
                });

                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(PublicLogger.error).toHaveBeenCalledWith(
                    "Error handling live preview update:",
                    expect.any(Error)
                );
            });

            it("should handle errors when setConfigFromParams throws", () => {
                (setConfigFromParams as any).mockImplementation(() => {
                    throw new Error("setConfigFromParams error");
                });

                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(PublicLogger.error).toHaveBeenCalledWith(
                    "Error handling live preview update:",
                    expect.any(Error)
                );
            });
        });
    });

    describe("useHistoryPostMessageEvent", () => {
        beforeEach(() => {
            useHistoryPostMessageEvent();
        });

        it("should register event listener for HISTORY events", () => {
            expect(livePreviewPostMessage?.on).toHaveBeenCalledWith(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY,
                expect.any(Function)
            );
        });

        it("should handle forward navigation", () => {
            const eventData: HistoryLivePreviewPostMessageEventData = {
                type: "forward",
            };

            const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY];
            callback({ data: eventData });

            expect(mockWindow.history.forward).toHaveBeenCalled();
        });

        it("should handle backward navigation", () => {
            const eventData: HistoryLivePreviewPostMessageEventData = {
                type: "backward",
            };

            const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY];
            callback({ data: eventData });

            expect(mockWindow.history.back).toHaveBeenCalled();
        });

        it("should handle reload navigation", () => {
            const eventData: HistoryLivePreviewPostMessageEventData = {
                type: "reload",
            };

            const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY];
            callback({ data: eventData });

            expect(mockWindow.history.go).toHaveBeenCalled();
        });

        it("should throw error for unknown event type", () => {
            const eventData = {
                type: "unknown" as any,
            };

            const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY];

            expect(() => {
                callback({ data: eventData });
            }).toThrow("Unhandled event: unknown");
        });
    });
});