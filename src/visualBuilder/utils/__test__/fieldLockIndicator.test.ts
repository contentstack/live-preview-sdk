import { describe, it, expect, beforeEach, vi } from "vitest";
import { getPeerLockForField, lockAvatarInfo } from "../fieldLockIndicator";
import {
    setEntryFieldLockInfo,
    clearAllEntryFieldLockInfo,
} from "../fieldLockStore";

vi.mock("../visualBuilderPostMessage", () => ({
    default: { send: vi.fn(), on: vi.fn() },
}));

const scope = { entryUid: "entry1", contentTypeUid: "page", locale: "en-us" };

const meta = (over: Record<string, unknown> = {}) => ({
    entry_uid: "entry1",
    locale: "en-us",
    variant: undefined,
    fieldPath: "title",
    fieldPathWithIndex: "title",
    ...over,
});

const peer = (over: Record<string, unknown> = {}) => ({
    user: { uid: "u1", name: "Ada Lovelace", initials: "AL", avatarColor: "#c2410c" },
    ttl: "2030-01-01",
    isLocked: true,
    isOwn: false,
    ...over,
});

beforeEach(() => {
    clearAllEntryFieldLockInfo();
});

describe("getPeerLockForField", () => {
    it("returns the peer lock for a field locked by another user", () => {
        setEntryFieldLockInfo(scope, { title: peer() });
        expect(getPeerLockForField(meta() as never)?.user.uid).toBe("u1");
    });

    it("returns null for the current user's own lock", () => {
        setEntryFieldLockInfo(scope, { title: peer({ isOwn: true }) });
        expect(getPeerLockForField(meta() as never)).toBeNull();
    });

    it("returns null for an unlocked field", () => {
        expect(getPeerLockForField(meta() as never)).toBeNull();
    });

    it("treats a lock with no isOwn flag as a peer lock", () => {
        setEntryFieldLockInfo(scope, {
            title: { user: { uid: "u1" }, ttl: "2030-01-01", isLocked: true },
        });
        expect(getPeerLockForField(meta() as never)).not.toBeNull();
    });

    it("matches by fieldPathWithIndex, falling back to fieldPath", () => {
        setEntryFieldLockInfo(scope, {
            "page_components.0.section.title_h3": peer(),
        });
        const found = getPeerLockForField(
            meta({
                fieldPath: "page_components.section.title_h3",
                fieldPathWithIndex: "page_components.0.section.title_h3",
            }) as never
        );
        expect(found).not.toBeNull();
    });

    it("scopes the lookup by variant", () => {
        setEntryFieldLockInfo({ ...scope, variantUid: "var1" }, { title: peer() });
        expect(getPeerLockForField(meta({ variant: "var1" }) as never)).not.toBeNull();
        // base scope has no lock
        expect(getPeerLockForField(meta() as never)).toBeNull();
    });

    it("locks a child when an ancestor container is peer-locked", () => {
        setEntryFieldLockInfo(scope, { "section.0": peer() });
        const found = getPeerLockForField(
            meta({
                fieldPath: "section.title",
                fieldPathWithIndex: "section.0.title",
            }) as never
        );
        expect(found?.user.uid).toBe("u1");
    });

    it("locks a container when a descendant field is peer-locked", () => {
        setEntryFieldLockInfo(scope, { "section.0.title": peer() });
        const found = getPeerLockForField(
            meta({
                fieldPath: "section",
                fieldPathWithIndex: "section.0",
            }) as never
        );
        expect(found?.user.uid).toBe("u1");
    });

    it("does not lock a sibling that only shares a path prefix", () => {
        setEntryFieldLockInfo(scope, { "section.0.title": peer() });
        expect(
            getPeerLockForField(
                meta({
                    fieldPath: "section.subtitle",
                    fieldPathWithIndex: "section.0.subtitle",
                }) as never
            )
        ).toBeNull();
    });

    it("does not propagate the current user's own container lock", () => {
        setEntryFieldLockInfo(scope, { "section.0": peer({ isOwn: true }) });
        expect(
            getPeerLockForField(
                meta({
                    fieldPath: "section.title",
                    fieldPathWithIndex: "section.0.title",
                }) as never
            )
        ).toBeNull();
    });
});

describe("lockAvatarInfo", () => {
    it("uses initials, color, and name from the lock", () => {
        expect(lockAvatarInfo(peer() as never)).toEqual({
            initials: "AL",
            color: "#c2410c",
            name: "Ada Lovelace",
        });
    });

    it("derives initials from the name when initials are absent", () => {
        expect(
            lockAvatarInfo({
                user: { uid: "u", name: "grace hopper" },
                ttl: "x",
                isLocked: true,
            } as never).initials
        ).toBe("GR");
    });

    it("falls back to '?' and the default color when nothing resolves", () => {
        const info = lockAvatarInfo({
            user: { uid: "u" },
            ttl: "x",
            isLocked: true,
        } as never);
        expect(info.initials).toBe("?");
        expect(info.color).toBe("#6c5ce7");
        expect(info.name).toBe("");
    });
});
