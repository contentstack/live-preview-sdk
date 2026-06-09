/**
 * @vitest-environment jsdom
 */

import { vi } from "vitest";
import Config, { syncToStackSdk } from "../../../configManager/configManager";
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
    sendInitializeLivePreviewPostMessageEvent,
} from "../postMessageEvent.hooks";
import { isOpeningInNewTab, inVisualEditor } from "../../../common/inIframe";
import { addParamsToUrl } from "../../../utils";
import { ILivePreviewWindowType } from "../../../types/types";

// Mock dependencies
vi.mock("../../../configManager/configManager", () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
    syncToStackSdk: vi.fn(),
}));

vi.mock("../../../logger/logger", () => ({
    PublicLogger: {
        error: vi.fn(),
    },
}));

vi.mock("../livePreviewEventManager", () => ({
    default: {
        on: vi.fn(),
        send: vi.fn(),
    },
}));

vi.mock("../../../common/inIframe", () => ({
    isOpeningInNewTab: vi.fn(),
    inVisualEditor: vi.fn(() => false),
}));

vi.mock("../../../utils", () => ({
    addParamsToUrl: vi.fn(),
    isOpeningInTimeline: vi.fn(() => false),
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

                expect(Config.set).toHaveBeenCalledWith("hash", "test-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "test-hash" });
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

                expect(Config.set).toHaveBeenCalledWith("hash", "test-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "test-hash" });
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

                expect(Config.set).toHaveBeenCalledWith("hash", "test-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "test-hash" });
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

                expect(Config.set).toHaveBeenCalledWith("hash", "test-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "test-hash" });
                expect(mockWindow.location.reload).not.toHaveBeenCalled();
                expect(mockOnChange).not.toHaveBeenCalled();
            });

            describe("SSR + missing URL params → redirect", () => {
                it("should set all params and redirect when URL has no params and event data has content_type_uid and entry_uid", () => {
                    mockConfig.ssr = true;
                    mockConfig.stackDetails = {};
                    (Config.get as any).mockReturnValue(mockConfig);
                    mockWindow.location.href = "https://example.com";

                    const eventData: OnChangeLivePreviewPostMessageEventData = {
                        hash: "new-hash",
                        content_type_uid: "blog",
                        entry_uid: "entry-123",
                    };

                    const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                    callback({ data: eventData });

                    const redirectUrl = new URL(mockWindow.location.href);
                    expect(redirectUrl.searchParams.get("live_preview")).toBe("new-hash");
                    expect(redirectUrl.searchParams.get("content_type_uid")).toBe("blog");
                    expect(redirectUrl.searchParams.get("entry_uid")).toBe("entry-123");
                    expect(mockWindow.location.reload).not.toHaveBeenCalled();
                });

                it("should redirect without content_type_uid param when event data does not provide it", () => {
                    mockConfig.ssr = true;
                    mockConfig.stackDetails = {};
                    (Config.get as any).mockReturnValue(mockConfig);
                    mockWindow.location.href = "https://example.com";

                    const eventData: OnChangeLivePreviewPostMessageEventData = {
                        hash: "new-hash",
                        entry_uid: "entry-123",
                    };

                    const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                    callback({ data: eventData });

                    const redirectUrl = new URL(mockWindow.location.href);
                    expect(redirectUrl.searchParams.get("live_preview")).toBe("new-hash");
                    expect(redirectUrl.searchParams.has("content_type_uid")).toBe(false);
                    expect(redirectUrl.searchParams.get("entry_uid")).toBe("entry-123");
                });

                it("should redirect without entry_uid param when event data does not provide it", () => {
                    mockConfig.ssr = true;
                    mockConfig.stackDetails = {};
                    (Config.get as any).mockReturnValue(mockConfig);
                    mockWindow.location.href = "https://example.com";

                    const eventData: OnChangeLivePreviewPostMessageEventData = {
                        hash: "new-hash",
                        content_type_uid: "blog",
                    };

                    const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                    callback({ data: eventData });

                    const redirectUrl = new URL(mockWindow.location.href);
                    expect(redirectUrl.searchParams.get("live_preview")).toBe("new-hash");
                    expect(redirectUrl.searchParams.get("content_type_uid")).toBe("blog");
                    expect(redirectUrl.searchParams.has("entry_uid")).toBe(false);
                });

                it("should use stackDetails.contentTypeUid and entryUid as fallback when event data omits them", () => {
                    mockConfig.ssr = true;
                    mockConfig.stackDetails = { contentTypeUid: "fallback-ct", entryUid: "fallback-entry" };
                    (Config.get as any).mockReturnValue(mockConfig);
                    mockWindow.location.href = "https://example.com";

                    const eventData: OnChangeLivePreviewPostMessageEventData = {
                        hash: "h",
                    };

                    const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                    callback({ data: eventData });

                    const redirectUrl = new URL(mockWindow.location.href);
                    expect(redirectUrl.searchParams.get("live_preview")).toBe("h");
                    expect(redirectUrl.searchParams.get("content_type_uid")).toBe("fallback-ct");
                    expect(redirectUrl.searchParams.get("entry_uid")).toBe("fallback-entry");
                    expect(mockWindow.location.reload).not.toHaveBeenCalled();
                });
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

                expect(Config.set).toHaveBeenCalledWith("hash", "new-hash-value");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "new-hash-value" });
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

                expect(Config.set).toHaveBeenCalledWith("hash", "updated-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "updated-hash" });
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

                expect(Config.set).toHaveBeenCalledWith("hash", "test-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "test-hash" });
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

                expect(Config.set).toHaveBeenCalledWith("hash", "test-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "test-hash" });
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

            it("should handle errors when syncToStackSdk throws", () => {
                (syncToStackSdk as any).mockImplementation(() => {
                    throw new Error("syncToStackSdk error");
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

        describe("when NOT opening in new tab", () => {
            it("should not reload when ssr is true, no event_type, and not opening in new tab", () => {
                (isOpeningInNewTab as any).mockReturnValue(false);
                mockConfig.ssr = true;
                (Config.get as any).mockReturnValue(mockConfig);

                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(Config.set).toHaveBeenCalledWith("hash", "test-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "test-hash" });
                expect(mockWindow.location.reload).not.toHaveBeenCalled();
                expect(mockOnChange).not.toHaveBeenCalled();
            });

            it("should not call pushState when HASH_CHANGE and not opening in new tab", () => {
                (isOpeningInNewTab as any).mockReturnValue(false);
                mockConfig.ssr = false;
                (Config.get as any).mockReturnValue(mockConfig);

                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "new-hash",
                    _metadata: {
                        event_type: OnChangeLivePreviewPostMessageEventTypes.HASH_CHANGE,
                    },
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(Config.set).toHaveBeenCalledWith("hash", "new-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "new-hash" });
                expect(mockWindow.history.pushState).not.toHaveBeenCalled();
            });

            it("should not navigate when URL_CHANGE with url and not opening in new tab", () => {
                (isOpeningInNewTab as any).mockReturnValue(false);
                const originalHref = mockWindow.location.href;
                mockConfig.ssr = false;
                (Config.get as any).mockReturnValue(mockConfig);

                const eventData: OnChangeLivePreviewPostMessageEventData = {
                    hash: "test-hash",
                    url: "https://newdomain.com/page",
                    _metadata: {
                        event_type: OnChangeLivePreviewPostMessageEventTypes.URL_CHANGE,
                    },
                };

                const callback = mockWindow._eventCallbacks[LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE];
                callback({ data: eventData });

                expect(Config.set).toHaveBeenCalledWith("hash", "test-hash");
                expect(syncToStackSdk).toHaveBeenCalledWith({ hash: "test-hash" });
                expect(mockWindow.location.href).toBe(originalHref);
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

    describe("sendInitializeLivePreviewPostMessageEvent", () => {
        beforeEach(() => {
            // default send resolves with preview windowType, no contentType/entry to avoid side-effects
            (livePreviewPostMessage as any).send.mockResolvedValue({
                windowType: "preview",
            });
        });

        it("should omit enableLivePreviewOutsideIframe in INIT payload when config is unset", async () => {
            mockConfig = {
                ssr: true,
                mode: 1,
                enableLivePreviewOutsideIframe: undefined,
            };
            (Config.get as any).mockReturnValue(mockConfig);

            await sendInitializeLivePreviewPostMessageEvent();
            await Promise.resolve();

            const initPayload = (livePreviewPostMessage?.send as any).mock.calls.at(-1)?.[1];
            expect(initPayload.config).not.toHaveProperty(
                "enableLivePreviewOutsideIframe"
            );
        });

        it("should include enableLivePreviewOutsideIframe=false in INIT payload", async () => {
            mockConfig = {
                ssr: true, // avoid timers
                mode: 1,
                enableLivePreviewOutsideIframe: false,
            };
            (Config.get as any).mockReturnValue(mockConfig);

            await sendInitializeLivePreviewPostMessageEvent();
            // allow microtasks to flush
            await Promise.resolve();

            expect(livePreviewPostMessage?.send).toHaveBeenCalledWith(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
                expect.objectContaining({
                    config: expect.objectContaining({
                        enableLivePreviewOutsideIframe: false,
                    }),
                })
            );
        });

        it("should include enableLivePreviewOutsideIframe=true in INIT payload", async () => {
            mockConfig = {
                ssr: true, // avoid timers
                mode: 1,
                enableLivePreviewOutsideIframe: true,
            };
            (Config.get as any).mockReturnValue(mockConfig);

            await sendInitializeLivePreviewPostMessageEvent();
            await Promise.resolve();

            expect(livePreviewPostMessage?.send).toHaveBeenCalledWith(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
                expect.objectContaining({
                    config: expect.objectContaining({
                        enableLivePreviewOutsideIframe: true,
                    }),
                })
            );
        });

        it("should sync contentTypeUid and entryUid to Config and stackSdk when INIT response provides them", async () => {
            mockConfig = {
                ssr: true,
                mode: 1,
            };
            (Config.get as any).mockReturnValue(mockConfig);
            (livePreviewPostMessage as any).send.mockResolvedValue({
                windowType: ILivePreviewWindowType.PREVIEW,
                contentTypeUid: "blog",
                entryUid: "entry-123",
            });

            await sendInitializeLivePreviewPostMessageEvent();
            await Promise.resolve();

            expect(Config.set).toHaveBeenCalledWith("stackDetails.contentTypeUid", "blog");
            expect(Config.set).toHaveBeenCalledWith("stackDetails.entryUid", "entry-123");
            expect(syncToStackSdk).toHaveBeenCalledWith({ contentTypeUid: "blog", entryUid: "entry-123" });
        });

        it("should return early and skip post-init setup when windowType is BUILDER", async () => {
            mockConfig = {
                ssr: true,
                mode: 1,
                windowType: ILivePreviewWindowType.BUILDER,
            };
            (Config.get as any).mockReturnValue(mockConfig);
            (livePreviewPostMessage as any).send.mockResolvedValue({
                windowType: ILivePreviewWindowType.BUILDER,
                contentTypeUid: "blog",
                entryUid: "entry-123",
            });

            await sendInitializeLivePreviewPostMessageEvent();
            await Promise.resolve();

            expect(syncToStackSdk).not.toHaveBeenCalled();
            expect(Config.set).not.toHaveBeenCalledWith("stackDetails.contentTypeUid", expect.anything());
            expect(Config.set).not.toHaveBeenCalledWith("stackDetails.entryUid", expect.anything());
        });

        it("should return early and skip post-init setup when inVisualEditor is true", async () => {
            mockConfig = {
                ssr: true,
                mode: 1,
            };
            (Config.get as any).mockReturnValue(mockConfig);
            (livePreviewPostMessage as any).send.mockResolvedValue({
                windowType: ILivePreviewWindowType.PREVIEW,
                contentTypeUid: "blog",
                entryUid: "entry-123",
            });
            (inVisualEditor as any).mockReturnValueOnce(true);

            await sendInitializeLivePreviewPostMessageEvent();
            await Promise.resolve();

            expect(syncToStackSdk).not.toHaveBeenCalled();
            expect(Config.set).not.toHaveBeenCalled();
            expect(addParamsToUrl).not.toHaveBeenCalled();
            expect(livePreviewPostMessage?.on).not.toHaveBeenCalledWith(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
                expect.any(Function),
            );
        });

        it("should start CHECK_ENTRY_PAGE interval when ssr is false", async () => {
            vi.useFakeTimers();
            try {
                mockConfig = {
                    ssr: false,
                    mode: 1,
                };
                (Config.get as any).mockReturnValue(mockConfig);
                (livePreviewPostMessage as any).send.mockResolvedValue({
                    windowType: ILivePreviewWindowType.PREVIEW,
                });

                await sendInitializeLivePreviewPostMessageEvent();
                await Promise.resolve();

                vi.advanceTimersByTime(1500);

                expect(livePreviewPostMessage?.send).toHaveBeenCalledWith(
                    LIVE_PREVIEW_POST_MESSAGE_EVENTS.CHECK_ENTRY_PAGE,
                    { href: "https://example.com" }
                );
            } finally {
                vi.useRealTimers();
            }
        });

    });
});