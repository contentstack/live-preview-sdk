/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useCollab } from "../useCollab";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import Config from "../../../configManager/configManager";
import {
    removeAllCollabIcons,
    hideAllCollabIcons,
    removeCollabIcon,
    HighlightThread,
    showAllCollabIcons,
    generateThread,
    handleMissingThreads,
} from "../../generators/generateThread";

// Mock dependencies
vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        on: vi.fn(),
    },
}));

vi.mock("../../../configManager/configManager", () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

vi.mock("../../generators/generateThread", () => ({
    removeAllCollabIcons: vi.fn(),
    hideAllCollabIcons: vi.fn(),
    removeCollabIcon: vi.fn(),
    HighlightThread: vi.fn(),
    showAllCollabIcons: vi.fn(),
    generateThread: vi.fn(),
    handleMissingThreads: vi.fn(),
}));

describe("useCollab", () => {
    let mockOn: ReturnType<typeof vi.fn>;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        vi.clearAllMocks();
        mockOn = vi.fn(() => ({
            unregister: vi.fn(),
        }));
        (visualBuilderPostMessage as any).on = mockOn;

        (Config.get as any).mockReturnValue({
            collab: {
                enable: false,
                isFeedbackMode: false,
                pauseFeedback: false,
            },
        });
    });

    afterEach(() => {
        if (cleanup) {
            cleanup();
        }
        vi.clearAllMocks();
    });

    describe("COLLAB_ENABLE event", () => {
        it("should register event listener for COLLAB_ENABLE", () => {
            useCollab();

            expect(mockOn).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_ENABLE,
                expect.any(Function)
            );
        });

        it("should set collab config when enable event is triggered", () => {
            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] === VisualBuilderPostMessageEvents.COLLAB_ENABLE
            )[1];

            handler({
                data: {
                    collab: {
                        enable: true,
                        isFeedbackMode: true,
                        pauseFeedback: false,
                        inviteMetadata: { test: "data" },
                    },
                },
            });

            expect(Config.set).toHaveBeenCalledWith("collab.enable", true);
            expect(Config.set).toHaveBeenCalledWith(
                "collab.isFeedbackMode",
                true
            );
            expect(Config.set).toHaveBeenCalledWith(
                "collab.pauseFeedback",
                false
            );
            expect(Config.set).toHaveBeenCalledWith(
                "collab.inviteMetadata",
                { test: "data" }
            );
        });

        it("should handle undefined pauseFeedback and inviteMetadata", () => {
            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] === VisualBuilderPostMessageEvents.COLLAB_ENABLE
            )[1];

            handler({
                data: {
                    collab: {
                        enable: true,
                        isFeedbackMode: false,
                        // pauseFeedback and inviteMetadata are undefined
                    },
                },
            });

            expect(Config.set).toHaveBeenCalledWith("collab.enable", true);
            expect(Config.set).toHaveBeenCalledWith(
                "collab.isFeedbackMode",
                false
            );
            expect(Config.set).toHaveBeenCalledWith(
                "collab.pauseFeedback",
                undefined
            );
            expect(Config.set).toHaveBeenCalledWith(
                "collab.inviteMetadata",
                undefined
            );
        });

        it("should show all collab icons when fromShare is true", () => {
            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] === VisualBuilderPostMessageEvents.COLLAB_ENABLE
            )[1];

            handler({
                data: {
                    collab: {
                        fromShare: true,
                        pauseFeedback: true,
                        isFeedbackMode: false,
                    },
                },
            });

            expect(Config.set).toHaveBeenCalledWith(
                "collab.pauseFeedback",
                true
            );
            expect(Config.set).toHaveBeenCalledWith(
                "collab.isFeedbackMode",
                false
            );
            expect(showAllCollabIcons).toHaveBeenCalled();
        });

        it("should log error and return early if collab data is invalid", () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] === VisualBuilderPostMessageEvents.COLLAB_ENABLE
            )[1];

            handler({
                data: {},
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                "Invalid collab data structure:",
                { data: {} }
            );
            expect(Config.set).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe("COLLAB_DATA_UPDATE event", () => {
        it("should register event listener for COLLAB_DATA_UPDATE", () => {
            useCollab();

            expect(mockOn).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE,
                expect.any(Function)
            );
        });

        it("should return early if collab is not enabled", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: false,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE
            )[1];

            handler({
                data: {
                    collab: {
                        payload: [],
                    },
                },
            });

            expect(generateThread).not.toHaveBeenCalled();
        });

        it("should update inviteMetadata when provided", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE
            )[1];

            handler({
                data: {
                    collab: {
                        inviteMetadata: { test: "metadata" },
                    },
                },
            });

            expect(Config.set).toHaveBeenCalledWith(
                "collab.inviteMetadata",
                { test: "metadata" }
            );
            expect(generateThread).not.toHaveBeenCalled();
        });

        it("should generate threads and handle missing threads when payload is provided", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            (generateThread as any).mockReturnValue("thread-uid-1");

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE
            )[1];

            handler({
                data: {
                    collab: {
                        payload: [{ _id: "thread1" }],
                    },
                },
            });

            expect(generateThread).toHaveBeenCalledWith({ _id: "thread1" });
            expect(handleMissingThreads).toHaveBeenCalledWith({
                payload: { isElementPresent: false },
                threadUids: ["thread-uid-1"],
            });
        });

        it("should filter out undefined thread IDs from payload", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            (generateThread as any)
                .mockReturnValueOnce("thread-uid-1")
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce("thread-uid-3");

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE
            )[1];

            handler({
                data: {
                    collab: {
                        payload: [
                            { _id: "thread1" },
                            { _id: "thread2" },
                            { _id: "thread3" },
                        ],
                    },
                },
            });

            // Should only call handleMissingThreads with defined IDs
            expect(handleMissingThreads).toHaveBeenCalledWith({
                payload: { isElementPresent: false },
                threadUids: ["thread-uid-1", "thread-uid-3"],
            });
        });

        it("should not call handleMissingThreads when all thread IDs are undefined", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            (generateThread as any).mockReturnValue(undefined);

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE
            )[1];

            handler({
                data: {
                    collab: {
                        payload: [{ _id: "thread1" }],
                    },
                },
            });

            expect(handleMissingThreads).not.toHaveBeenCalled();
        });

        it("should handle empty payload array", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE
            )[1];

            handler({
                data: {
                    collab: {
                        payload: [],
                    },
                },
            });

            expect(generateThread).not.toHaveBeenCalled();
            expect(handleMissingThreads).not.toHaveBeenCalled();
        });

        it("should log error if collab data is invalid", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE
            )[1];

            handler({
                data: {},
            });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe("COLLAB_DISABLE event", () => {
        it("should register event listener for COLLAB_DISABLE", () => {
            useCollab();

            expect(mockOn).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_DISABLE,
                expect.any(Function)
            );
        });

        it("should disable collab and remove icons when fromShare is false", () => {
            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] === VisualBuilderPostMessageEvents.COLLAB_DISABLE
            )[1];

            handler({
                data: {
                    collab: {
                        fromShare: false,
                    },
                },
            });

            expect(Config.set).toHaveBeenCalledWith("collab.enable", false);
            expect(Config.set).toHaveBeenCalledWith(
                "collab.isFeedbackMode",
                false
            );
            expect(removeAllCollabIcons).toHaveBeenCalled();
        });

        it("should hide icons when fromShare is true", () => {
            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] === VisualBuilderPostMessageEvents.COLLAB_DISABLE
            )[1];

            handler({
                data: {
                    collab: {
                        fromShare: true,
                        pauseFeedback: true,
                    },
                },
            });

            expect(Config.set).toHaveBeenCalledWith(
                "collab.pauseFeedback",
                true
            );
            expect(hideAllCollabIcons).toHaveBeenCalled();
            expect(removeAllCollabIcons).not.toHaveBeenCalled();
        });
    });

    describe("COLLAB_THREADS_REMOVE event", () => {
        it("should register event listener for COLLAB_THREADS_REMOVE", () => {
            useCollab();

            expect(mockOn).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_THREADS_REMOVE,
                expect.any(Function)
            );
        });

        it("should return early if collab is not enabled", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: false,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREADS_REMOVE
            )[1];

            handler({
                data: {
                    threadUids: ["thread1"],
                },
            });

            expect(removeCollabIcon).not.toHaveBeenCalled();
        });

        it("should remove collab icons for provided thread UIDs", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREADS_REMOVE
            )[1];

            handler({
                data: {
                    threadUids: ["thread1", "thread2"],
                    updateConfig: false,
                },
            });

            expect(removeCollabIcon).toHaveBeenCalledWith("thread1");
            expect(removeCollabIcon).toHaveBeenCalledWith("thread2");
        });

        it("should handle empty threadUids array", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREADS_REMOVE
            )[1];

            handler({
                data: {
                    threadUids: [],
                    updateConfig: false,
                },
            });

            expect(removeCollabIcon).not.toHaveBeenCalled();
        });

        it("should set isFeedbackMode when updateConfig is true", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREADS_REMOVE
            )[1];

            handler({
                data: {
                    threadUids: ["thread1"],
                    updateConfig: true,
                },
            });

            expect(Config.set).toHaveBeenCalledWith(
                "collab.isFeedbackMode",
                true
            );
        });
    });

    describe("COLLAB_THREAD_REOPEN event", () => {
        it("should register event listener for COLLAB_THREAD_REOPEN", () => {
            useCollab();

            expect(mockOn).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_THREAD_REOPEN,
                expect.any(Function)
            );
        });

        it("should return early if collab is not enabled", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: false,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREAD_REOPEN
            )[1];

            handler({
                data: {
                    thread: { _id: "thread1" },
                },
            });

            expect(generateThread).not.toHaveBeenCalled();
        });

        it("should generate thread and handle missing threads when thread is reopened", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                    pauseFeedback: true,
                },
            });

            (generateThread as any).mockReturnValue("thread-uid-1");

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREAD_REOPEN
            )[1];

            handler({
                data: {
                    thread: { _id: "thread1" },
                },
            });

            expect(generateThread).toHaveBeenCalledWith(
                { _id: "thread1" },
                { hidden: true }
            );
            expect(handleMissingThreads).toHaveBeenCalledWith({
                payload: { isElementPresent: false },
                threadUids: ["thread-uid-1"],
            });
        });
    });

    describe("COLLAB_THREAD_HIGHLIGHT event", () => {
        it("should register event listener for COLLAB_THREAD_HIGHLIGHT", () => {
            useCollab();

            expect(mockOn).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_THREAD_HIGHLIGHT,
                expect.any(Function)
            );
        });

        it("should return early if collab is not enabled", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: false,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREAD_HIGHLIGHT
            )[1];

            handler({
                data: {
                    threadUid: "thread1",
                },
            });

            expect(HighlightThread).not.toHaveBeenCalled();
        });

        it("should return early if pauseFeedback is true", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                    pauseFeedback: true,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREAD_HIGHLIGHT
            )[1];

            handler({
                data: {
                    threadUid: "thread1",
                },
            });

            expect(HighlightThread).not.toHaveBeenCalled();
        });

        it("should highlight thread when conditions are met", () => {
            (Config.get as any).mockReturnValue({
                collab: {
                    enable: true,
                    pauseFeedback: false,
                },
            });

            useCollab();

            const handler = mockOn.mock.calls.find(
                (call) =>
                    call[0] ===
                    VisualBuilderPostMessageEvents.COLLAB_THREAD_HIGHLIGHT
            )[1];

            handler({
                data: {
                    threadUid: "thread1",
                },
            });

            expect(HighlightThread).toHaveBeenCalledWith("thread1");
        });
    });

    describe("cleanup", () => {
        it("should return cleanup function that unregisters all event listeners", () => {
            const mockUnregister = vi.fn();
            mockOn.mockReturnValue({ unregister: mockUnregister });

            cleanup = useCollab();

            expect(typeof cleanup).toBe("function");

            cleanup();

            expect(mockUnregister).toHaveBeenCalledTimes(6);
        });
    });
});

