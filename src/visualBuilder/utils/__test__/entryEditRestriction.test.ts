import { describe, it, expect, beforeEach, vi, MockedObject } from "vitest";
import { EventManager } from "@contentstack/advanced-post-message";
import {
    ENTRY_RESTRICTION_MESSAGES,
    getEntryEditRestrictionForField,
    isFieldBlockedByAutoDraft,
    requestEntryLockInfoOnce,
    waitForEntryLockInfo,
} from "../fieldLockIndicator";
import {
    clearAllEntryFieldLockInfo,
    getEntryEditRestriction,
    setEntryEditRestriction,
    setEntryFieldLockInfo,
    subscribeEntryFieldLockInfo,
} from "../fieldLockStore";
import { getEntryLockInfo } from "../getEntryLockInfo";
import { useEntryEditRestrictionUpdateEvent } from "../../eventManager/useEntryEditRestrictionUpdateEvent";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import visualBuilderPostMessage from "../visualBuilderPostMessage";

vi.mock("../visualBuilderPostMessage", () => ({
    default: { send: vi.fn(), on: vi.fn() },
}));

const mockPostMessage = visualBuilderPostMessage as MockedObject<EventManager>;

const scope = { entryUid: "entry1", locale: "en-us" };

const meta = (over: Record<string, unknown> = {}) =>
    ({
        entry_uid: "entry1",
        locale: "en-us",
        variant: undefined,
        fieldPath: "title",
        fieldPathWithIndex: "title",
        ...over,
    }) as never;

beforeEach(() => {
    vi.clearAllMocks();
    clearAllEntryFieldLockInfo();
});

describe("getEntryEditRestrictionForField", () => {
    it("returns the older-version message for a restricted entry", () => {
        setEntryEditRestriction(scope, "olderVersion");
        expect(getEntryEditRestrictionForField(meta())).toBe(
            ENTRY_RESTRICTION_MESSAGES.olderVersion
        );
    });

    it("returns a distinct message per restriction", () => {
        setEntryEditRestriction(scope, "unlocalized");
        expect(getEntryEditRestrictionForField(meta())).toBe(
            ENTRY_RESTRICTION_MESSAGES.unlocalized
        );
        setEntryEditRestriction(scope, "entryLocked");
        expect(getEntryEditRestrictionForField(meta())).toBe(
            ENTRY_RESTRICTION_MESSAGES.entryLocked
        );
        setEntryEditRestriction(scope, "unsavedVariant");
        expect(getEntryEditRestrictionForField(meta())).toBe(
            ENTRY_RESTRICTION_MESSAGES.unsavedVariant
        );
    });

    it("returns null once the restriction clears", () => {
        setEntryEditRestriction(scope, "olderVersion");
        setEntryEditRestriction(scope, null);
        expect(getEntryEditRestrictionForField(meta())).toBeNull();
    });

    it("applies a base-entry restriction to that entry's variant fields", () => {
        setEntryEditRestriction(scope, "olderVersion");
        expect(getEntryEditRestrictionForField(meta({ variant: "v1" }))).toBe(
            ENTRY_RESTRICTION_MESSAGES.olderVersion
        );
    });

    it("keeps a variant restriction off the base entry's fields", () => {
        setEntryEditRestriction({ ...scope, variantUid: "v1" }, "olderVersion");
        expect(getEntryEditRestrictionForField(meta())).toBeNull();
        expect(
            getEntryEditRestrictionForField(meta({ variant: "v1" }))
        ).not.toBeNull();
    });

    it("does not affect other entries or locales", () => {
        setEntryEditRestriction(scope, "olderVersion");
        expect(
            getEntryEditRestrictionForField(meta({ entry_uid: "entry2" }))
        ).toBeNull();
        expect(getEntryEditRestrictionForField(meta({ locale: "fr" }))).toBeNull();
    });
});

describe("isFieldBlockedByAutoDraft", () => {
    it("is true for a restricted entry and for a peer lock, false otherwise", () => {
        expect(isFieldBlockedByAutoDraft(meta())).toBe(false);
        setEntryFieldLockInfo(scope, {
            title: { user: { uid: "u1" }, ttl: "2030", isLocked: true, isOwn: false },
        });
        expect(isFieldBlockedByAutoDraft(meta())).toBe(true);
        setEntryFieldLockInfo(scope, {});
        setEntryEditRestriction(scope, "olderVersion");
        expect(isFieldBlockedByAutoDraft(meta())).toBe(true);
    });
});

describe("restriction updates", () => {
    it("notifies lock listeners so the hover and label repaint", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeEntryFieldLockInfo(listener);
        setEntryEditRestriction(scope, "olderVersion");
        unsubscribe();
        expect(listener).toHaveBeenCalled();
    });

    it("mirrors ENTRY_EDIT_RESTRICTION_UPDATE from the parent", () => {
        useEntryEditRestrictionUpdateEvent();
        const [event, handler] = mockPostMessage.on.mock.calls[0] as any;
        expect(event).toBe(
            VisualBuilderPostMessageEvents.ENTRY_EDIT_RESTRICTION_UPDATE
        );

        handler({ data: { ...scope, restriction: "olderVersion" } });
        expect(getEntryEditRestriction(scope)).toBe("olderVersion");
        handler({ data: { ...scope, restriction: null } });
        expect(getEntryEditRestriction(scope)).toBeNull();
    });

    it("ignores a restriction value it does not know", () => {
        useEntryEditRestrictionUpdateEvent();
        const handler = mockPostMessage.on.mock.calls[0][1] as any;
        handler({ data: { ...scope, restriction: "<img onerror=1>" } });
        expect(getEntryEditRestriction(scope)).toBeNull();
    });

    it("does not notify listeners when the value is unchanged", () => {
        setEntryEditRestriction(scope, "olderVersion");
        const listener = vi.fn();
        const unsubscribe = subscribeEntryFieldLockInfo(listener);
        setEntryEditRestriction(scope, "olderVersion");
        setEntryEditRestriction({ ...scope, entryUid: "other" }, null);
        unsubscribe();
        expect(listener).not.toHaveBeenCalled();
    });
});

describe("snapshot seeding", () => {
    const request = { ...scope, contentTypeUid: "page" };

    it("seeds every restricted scope returned with the lock snapshot", async () => {
        mockPostMessage.send.mockResolvedValueOnce({
            fieldLockInfo: {},
            editRestrictions: {
                "entry1:en-us": "olderVersion",
                "entry1:en-us:v1": "unlocalized",
            },
        });

        await getEntryLockInfo(request);

        expect(getEntryEditRestriction(scope)).toBe("olderVersion");
        expect(getEntryEditRestriction({ ...scope, variantUid: "v1" })).toBe(
            "unlocalized"
        );
    });

    it("does not let a late snapshot undo an update that arrived meanwhile", async () => {
        let resolve!: (value: unknown) => void;
        mockPostMessage.send.mockReturnValueOnce(
            new Promise((r) => {
                resolve = r;
            }) as never
        );

        const pending = getEntryLockInfo(request);
        setEntryEditRestriction(scope, null);
        resolve({
            fieldLockInfo: {},
            editRestrictions: { "entry1:en-us": "olderVersion" },
        });
        await pending;

        expect(getEntryEditRestriction(scope)).toBeNull();
    });

    it("clears this entry's scopes that the snapshot no longer lists, and only this entry's", async () => {
        setEntryEditRestriction(scope, "olderVersion");
        setEntryEditRestriction({ ...scope, entryUid: "entry2" }, "olderVersion");
        mockPostMessage.send.mockResolvedValueOnce({
            fieldLockInfo: {},
            editRestrictions: {},
        });

        await getEntryLockInfo(request);

        expect(getEntryEditRestriction(scope)).toBeNull();
        expect(
            getEntryEditRestriction({ ...scope, entryUid: "entry2" })
        ).toBe("olderVersion");
    });

    it("leaves restrictions alone when an older parent sends no editRestrictions", async () => {
        setEntryEditRestriction(scope, "olderVersion");
        mockPostMessage.send.mockResolvedValueOnce({ fieldLockInfo: {} });

        await getEntryLockInfo(request);

        expect(getEntryEditRestriction(scope)).toBe("olderVersion");
    });

    it("lets inline editing wait for a first snapshot still in flight", async () => {
        let resolve!: (value: unknown) => void;
        mockPostMessage.send.mockReturnValueOnce(
            new Promise((r) => {
                resolve = r;
            }) as never
        );
        const wideScope = { ...request, entryUid: "entry-wait" };
        void requestEntryLockInfoOnce(wideScope);

        let done = false;
        const waiting = waitForEntryLockInfo(wideScope, 5000).then(() => {
            done = true;
        });
        await new Promise((r) => setTimeout(r, 0));
        expect(done).toBe(false);

        resolve({
            fieldLockInfo: {},
            editRestrictions: { "entry-wait:en-us": "olderVersion" },
        });
        await waiting;

        expect(
            getEntryEditRestriction({ entryUid: "entry-wait", locale: "en-us" })
        ).toBe("olderVersion");
    });

    it("does not wait when nothing is in flight", async () => {
        await expect(
            waitForEntryLockInfo({ entryUid: "idle", locale: "en-us" }, 5000)
        ).resolves.toBeUndefined();
    });
});
