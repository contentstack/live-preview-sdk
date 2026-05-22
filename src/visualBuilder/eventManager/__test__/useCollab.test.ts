import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCollab } from "../useCollab";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
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

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        on: vi.fn().mockImplementation(() => ({ unregister: vi.fn() })),
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

// Returns the handler registered at on() call index (0–5).
// Always call useCollab() before using this — indices reset after vi.clearAllMocks().
const getHandler = (index: number) =>
    vi.mocked(visualBuilderPostMessage!.on).mock.calls[index][1];

// Returns the unregister spy created for on() call at index.
// Uses mock.results because mockImplementation creates a fresh object per call.
const getUnregister = (index: number) =>
    vi.mocked(visualBuilderPostMessage!.on).mock.results[index].value.unregister;

const mockThread = {
    _id: "t1",
    author: "u1",
    inviteUid: "inv1",
    position: { x: 0, y: 0 },
    elementXPath: "//div",
    isElementPresent: true,
    pageRoute: "/",
    createdBy: "u1",
    sequenceNumber: 1,
    threadState: 0,
    createdAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(Config.get).mockReturnValue({} as any);
});

describe("COLLAB_ENABLE", () => {
    // COLLAB_ENABLE does not read closure-captured config — shared useCollab() call is safe.
    let collabEnableHandler: (data: any) => void;

    beforeEach(() => {
        useCollab();
        collabEnableHandler = getHandler(0);
    });

    it("should set enable, isFeedbackMode, pauseFeedback, inviteMetadata when fromShare is false", () => {
        const inviteMetadata = {
            users: [],
            currentUser: { email: "a@b.com", uid: "u1" },
            inviteUid: "inv1",
        };
        collabEnableHandler({
            data: {
                collab: {
                    fromShare: false,
                    enable: true,
                    isFeedbackMode: false,
                    pauseFeedback: false,
                    inviteMetadata,
                    payload: [],
                },
            },
        });
        expect(vi.mocked(Config.set)).toHaveBeenCalledWith("collab.enable", true);
        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.isFeedbackMode",
            false
        );
        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.pauseFeedback",
            false
        );
        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.inviteMetadata",
            inviteMetadata
        );
        expect(vi.mocked(showAllCollabIcons)).not.toHaveBeenCalled();
    });

    it("should set pauseFeedback and isFeedbackMode and call showAllCollabIcons when fromShare is true", () => {
        collabEnableHandler({
            data: {
                collab: {
                    fromShare: true,
                    pauseFeedback: true,
                    isFeedbackMode: true,
                },
            },
        });
        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.pauseFeedback",
            true
        );
        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.isFeedbackMode",
            true
        );
        expect(vi.mocked(showAllCollabIcons)).toHaveBeenCalledOnce();
        expect(vi.mocked(Config.set)).not.toHaveBeenCalledWith(
            "collab.enable",
            expect.anything()
        );
        expect(vi.mocked(Config.set)).not.toHaveBeenCalledWith(
            "collab.inviteMetadata",
            expect.anything()
        );
    });

    it("should log error when collab field is missing from event data", () => {
        const badPayload = { data: { collab: null } };
        collabEnableHandler(badPayload);
        expect(console.error).toHaveBeenCalledWith(
            "Invalid collab data structure:",
            badPayload
        );
        expect(vi.mocked(Config.set)).not.toHaveBeenCalled();
    });
});

describe("COLLAB_DATA_UPDATE", () => {
    // Reads closure-captured config — each test calls useCollab() fresh after setting Config.get.

    it("should return early when collab is disabled in config", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: false },
        } as any);
        useCollab();
        const handler = getHandler(1);

        handler({ data: { collab: { payload: [] } } });

        expect(vi.mocked(Config.set)).not.toHaveBeenCalled();
        expect(vi.mocked(generateThread)).not.toHaveBeenCalled();
    });

    it("should log error when collab field is missing and collab is enabled", () => {
        // enable=true required — line 73 returns before reaching the null check otherwise
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true },
        } as any);
        useCollab();
        const handler = getHandler(1);

        const badPayload = { data: { collab: null } };
        handler(badPayload);

        expect(console.error).toHaveBeenCalledWith(
            "Invalid collab data structure:",
            badPayload
        );
    });

    it("should set inviteMetadata and return early when inviteMetadata is present", () => {
        const inviteMetadata = {
            users: [],
            currentUser: { email: "a@b.com", uid: "u1" },
            inviteUid: "inv1",
        };
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true },
        } as any);
        useCollab();
        const handler = getHandler(1);

        handler({ data: { collab: { inviteMetadata } } });

        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.inviteMetadata",
            inviteMetadata
        );
        expect(vi.mocked(generateThread)).not.toHaveBeenCalled();
    });

    it("should call generateThread per payload item and handleMissingThreads when uids are returned", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true },
        } as any);
        vi.mocked(generateThread).mockReturnValue("thread-uid-1");
        useCollab();
        const handler = getHandler(1);

        handler({ data: { collab: { payload: [mockThread] } } });

        expect(vi.mocked(generateThread)).toHaveBeenCalledWith(mockThread);
        expect(vi.mocked(handleMissingThreads)).toHaveBeenCalledWith({
            payload: { isElementPresent: false },
            threadUids: ["thread-uid-1"],
        });
    });

    it("should not call handleMissingThreads when all generateThread calls return undefined", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true },
        } as any);
        vi.mocked(generateThread).mockReturnValue(undefined);
        useCollab();
        const handler = getHandler(1);

        handler({ data: { collab: { payload: [mockThread] } } });

        expect(vi.mocked(generateThread)).toHaveBeenCalledWith(mockThread);
        expect(vi.mocked(handleMissingThreads)).not.toHaveBeenCalled();
    });
});

describe("COLLAB_DISABLE", () => {
    // COLLAB_DISABLE does not read closure-captured config — shared useCollab() call is safe.
    let collabDisableHandler: (data: any) => void;

    beforeEach(() => {
        useCollab();
        collabDisableHandler = getHandler(2);
    });

    it("should set pauseFeedback and call hideAllCollabIcons when fromShare is true", () => {
        collabDisableHandler({
            data: { collab: { fromShare: true, pauseFeedback: true } },
        });

        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.pauseFeedback",
            true
        );
        expect(vi.mocked(hideAllCollabIcons)).toHaveBeenCalledOnce();
        expect(vi.mocked(removeAllCollabIcons)).not.toHaveBeenCalled();
    });

    it("should set enable and isFeedbackMode to false and call removeAllCollabIcons when fromShare is false", () => {
        collabDisableHandler({
            data: { collab: { fromShare: false } },
        });

        expect(vi.mocked(Config.set)).toHaveBeenCalledWith("collab.enable", false);
        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.isFeedbackMode",
            false
        );
        expect(vi.mocked(removeAllCollabIcons)).toHaveBeenCalledOnce();
        expect(vi.mocked(hideAllCollabIcons)).not.toHaveBeenCalled();
    });
});

describe("COLLAB_THREADS_REMOVE", () => {
    // Reads closure-captured config — each test calls useCollab() fresh after setting Config.get.
    // NOTE: threadUids must always be a valid array in test data.
    // BUG-1: line 130 does threadUids.length without null guard — crashes if threadUids is undefined.

    it("should return early when collab is disabled in config", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: false },
        } as any);
        useCollab();
        const handler = getHandler(3);

        handler({ data: { threadUids: [], updateConfig: false } });

        expect(vi.mocked(removeCollabIcon)).not.toHaveBeenCalled();
        expect(vi.mocked(Config.set)).not.toHaveBeenCalled();
    });

    it("should set isFeedbackMode to true when updateConfig is true", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true },
        } as any);
        useCollab();
        const handler = getHandler(3);

        handler({ data: { threadUids: [], updateConfig: true } });

        expect(vi.mocked(Config.set)).toHaveBeenCalledWith(
            "collab.isFeedbackMode",
            true
        );
    });

    it("should call removeCollabIcon for each threadUid when threadUids is non-empty", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true },
        } as any);
        useCollab();
        const handler = getHandler(3);

        handler({ data: { threadUids: ["uid-1", "uid-2"], updateConfig: false } });

        expect(vi.mocked(removeCollabIcon)).toHaveBeenCalledWith("uid-1");
        expect(vi.mocked(removeCollabIcon)).toHaveBeenCalledWith("uid-2");
        expect(vi.mocked(removeCollabIcon)).toHaveBeenCalledTimes(2);
    });
});

describe("COLLAB_THREAD_REOPEN", () => {
    // Reads closure-captured config — each test calls useCollab() fresh after setting Config.get.
    // NOTE: data.data must always be provided.
    // BUG-2: line 141 does data.data.thread without optional chaining — crashes if data.data is null.

    it("should return early when collab is disabled in config", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: false },
        } as any);
        useCollab();
        const handler = getHandler(4);

        handler({ data: { thread: mockThread } });

        expect(vi.mocked(generateThread)).not.toHaveBeenCalled();
    });

    it("should call generateThread and handleMissingThreads when collab is enabled and a uid is returned", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true, pauseFeedback: false },
        } as any);
        vi.mocked(generateThread).mockReturnValue("reopen-uid-1");
        useCollab();
        const handler = getHandler(4);

        handler({ data: { thread: mockThread } });

        expect(vi.mocked(generateThread)).toHaveBeenCalledWith(mockThread, {
            hidden: false,
        });
        expect(vi.mocked(handleMissingThreads)).toHaveBeenCalledWith({
            payload: { isElementPresent: false },
            threadUids: ["reopen-uid-1"],
        });
    });
});

describe("COLLAB_THREAD_HIGHLIGHT", () => {
    // Reads closure-captured config — each test calls useCollab() fresh after setting Config.get.
    // NOTE: data.data must always be provided.
    // BUG-3: line 160 does { threadUid } = data.data without optional chaining — crashes if data.data is null.

    it("should return early when collab is disabled in config", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: false, pauseFeedback: false },
        } as any);
        useCollab();
        const handler = getHandler(5);

        handler({ data: { threadUid: "t1" } });

        expect(vi.mocked(HighlightThread)).not.toHaveBeenCalled();
    });

    it("should return early when pauseFeedback is true", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true, pauseFeedback: true },
        } as any);
        useCollab();
        const handler = getHandler(5);

        handler({ data: { threadUid: "t1" } });

        expect(vi.mocked(HighlightThread)).not.toHaveBeenCalled();
    });

    it("should call HighlightThread with threadUid when collab is enabled and not paused", () => {
        vi.mocked(Config.get).mockReturnValue({
            collab: { enable: true, pauseFeedback: false },
        } as any);
        useCollab();
        const handler = getHandler(5);

        handler({ data: { threadUid: "highlight-uid-1" } });

        expect(vi.mocked(HighlightThread)).toHaveBeenCalledWith("highlight-uid-1");
    });
});

describe("cleanup", () => {
    it("should call unregister on all 6 handlers when the cleanup function is invoked", () => {
        const cleanup = useCollab();
        const unregisters = [0, 1, 2, 3, 4, 5].map(getUnregister);

        cleanup();

        unregisters.forEach((unregister) => {
            expect(unregister).toHaveBeenCalledOnce();
        });
    });
});
