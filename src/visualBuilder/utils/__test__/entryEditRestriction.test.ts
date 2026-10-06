import { describe, it, expect, beforeEach, vi, MockedObject } from "vitest";
import { EventManager } from "@contentstack/advanced-post-message";
import {
    getEntryEditRestrictionForField,
    isFieldBlockedByAutoDraft,
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
import { DisableReason } from "../isFieldDisabled";
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
            DisableReason.OlderEntryVersion
        );
    });

    it("returns a distinct message per restriction", () => {
        setEntryEditRestriction(scope, "unlocalized");
        expect(getEntryEditRestrictionForField(meta())).toBe(
            DisableReason.UnlocalizedEntry
        );
        setEntryEditRestriction(scope, "unsavedVariant");
        expect(getEntryEditRestrictionForField(meta())).toBe(
            DisableReason.UnsavedVariant
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
            DisableReason.OlderEntryVersion
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
});
