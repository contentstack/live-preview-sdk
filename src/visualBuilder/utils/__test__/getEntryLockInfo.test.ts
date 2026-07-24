import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach,
    MockedObject,
} from "vitest";
import { EventManager } from "@contentstack/advanced-post-message";
import { getEntryLockInfo } from "../getEntryLockInfo";
import { useEntryLockInfoUpdateEvent } from "../../eventManager/useEntryLockInfoUpdateEvent";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import visualBuilderPostMessage from "../visualBuilderPostMessage";
import {
    getEntryFieldLockInfo,
    setEntryFieldLockInfo,
    clearAllEntryFieldLockInfo,
    subscribeEntryFieldLockInfo,
    getEntryFieldLockVersion,
    entryLockScopeKey,
    EntryLockScope,
    EntryFieldLockInfo,
} from "../fieldLockStore";

vi.mock("../visualBuilderPostMessage", () => ({
    default: { send: vi.fn(), on: vi.fn() },
}));

const mockPostMessage = visualBuilderPostMessage as MockedObject<EventManager>;

const scope: EntryLockScope = {
    entryUid: "entry_1",
    contentTypeUid: "ct_1",
    locale: "en-us",
};

const locks: EntryFieldLockInfo = {
    title: {
        user: { uid: "user_a" },
        ttl: "2030-01-01T00:00:00.000Z",
        isLocked: true,
    },
};

beforeEach(() => {
    vi.clearAllMocks();
    clearAllEntryFieldLockInfo();
    vi.spyOn(console, "debug").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("getEntryLockInfo", () => {
    it("requests the lock snapshot for the entry and returns it", async () => {
        mockPostMessage.send.mockResolvedValue({ fieldLockInfo: locks });

        const result = await getEntryLockInfo(scope);

        expect(mockPostMessage.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_ENTRY_LOCK_INFO,
            { entryUid: "entry_1", contentTypeUid: "ct_1", locale: "en-us" }
        );
        expect(result).toEqual(locks);
    });

    it("stores the snapshot in the SDK mirror", async () => {
        mockPostMessage.send.mockResolvedValue({ fieldLockInfo: locks });

        await getEntryLockInfo(scope);

        expect(getEntryFieldLockInfo(scope)).toEqual(locks);
    });

    it("returns null (not an empty map) and does not throw when the request fails", async () => {
        mockPostMessage.send.mockRejectedValue(new Error("bridge down"));

        // null lets the caller distinguish a transient failure from a genuine
        // "no locks" snapshot and retry, instead of caching the failure.
        await expect(getEntryLockInfo(scope)).resolves.toBeNull();
    });

    it("returns an empty map for a genuine no-locks snapshot", async () => {
        mockPostMessage.send.mockResolvedValue({ fieldLockInfo: {} });

        await expect(getEntryLockInfo(scope)).resolves.toEqual({});
        expect(getEntryFieldLockInfo(scope)).toEqual({});
    });

    it("returns null and does not cache when the parent reports a failure", async () => {
        mockPostMessage.send.mockResolvedValue({ error: true });

        // The parent flags a fetch failure with `error: true` so the SDK retries
        // rather than caching an empty snapshot for the session.
        await expect(getEntryLockInfo(scope)).resolves.toBeNull();
        expect(getEntryFieldLockInfo(scope)).toEqual({});
    });

    it("returns null for a malformed/empty response", async () => {
        mockPostMessage.send.mockResolvedValue(undefined);

        await expect(getEntryLockInfo(scope)).resolves.toBeNull();
    });

    it("does not overwrite a newer delta that lands during the request", async () => {
        let resolveSnapshot: (v: { fieldLockInfo: EntryFieldLockInfo }) => void =
            () => {};
        mockPostMessage.send.mockImplementation(
            () =>
                new Promise((res) => {
                    resolveSnapshot = res as (v: {
                        fieldLockInfo: EntryFieldLockInfo;
                    }) => void;
                })
        );

        const pending = getEntryLockInfo(scope);
        // A delta clears the scope while the snapshot is still in flight.
        setEntryFieldLockInfo(scope, {});
        // The now-stale snapshot (title locked) resolves and must not re-lock it.
        resolveSnapshot({ fieldLockInfo: locks });
        await pending;

        expect(getEntryFieldLockInfo(scope)).toEqual({});
    });

    it("passes the variant through for variant entries", async () => {
        mockPostMessage.send.mockResolvedValue({ fieldLockInfo: {} });

        await getEntryLockInfo({ ...scope, variantUid: "variant_1" });

        expect(mockPostMessage.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_ENTRY_LOCK_INFO,
            {
                entryUid: "entry_1",
                contentTypeUid: "ct_1",
                locale: "en-us",
                variantUid: "variant_1",
            }
        );
    });
});

describe("fieldLockStore", () => {
    beforeEach(() => clearAllEntryFieldLockInfo());

    it("keys by entry, locale, and variant (content type excluded, matching the parent + Redis channel)", () => {
        expect(entryLockScopeKey(scope)).toBe("entry_1.en-us");
        expect(entryLockScopeKey({ ...scope, variantUid: "variant_1" })).toBe(
            "entry_1.en-us.variant_1"
        );
    });

    it("round-trips and keeps base and variant scopes separate", () => {
        setEntryFieldLockInfo(scope, locks);
        setEntryFieldLockInfo({ ...scope, variantUid: "variant_1" }, {});

        expect(getEntryFieldLockInfo(scope)).toEqual(locks);
        expect(
            getEntryFieldLockInfo({ ...scope, variantUid: "variant_1" })
        ).toEqual({});
    });

    it("returns an empty map for an unknown scope", () => {
        expect(
            getEntryFieldLockInfo({
                entryUid: "missing",
                contentTypeUid: "ct_1",
                locale: "en-us",
            })
        ).toEqual({});
    });

    it("notifies subscribers on write and clear; unsubscribe stops them", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeEntryFieldLockInfo(listener);

        setEntryFieldLockInfo(scope, locks);
        expect(listener).toHaveBeenCalledTimes(1);

        clearAllEntryFieldLockInfo();
        expect(listener).toHaveBeenCalledTimes(2);

        unsubscribe();
        setEntryFieldLockInfo(scope, {});
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it("bumps the scope version on each write", () => {
        const before = getEntryFieldLockVersion(scope);
        setEntryFieldLockInfo(scope, locks);
        expect(getEntryFieldLockVersion(scope)).toBeGreaterThan(before);
    });
});

describe("useEntryLockInfoUpdateEvent", () => {
    const handlers: Record<string, (event: { data: unknown }) => void> = {};

    beforeEach(() => {
        clearAllEntryFieldLockInfo();
        for (const key of Object.keys(handlers)) delete handlers[key];
        (mockPostMessage.on as unknown as ReturnType<typeof vi.fn>).mockImplementation(
            (event: string, cb: (e: { data: unknown }) => void) => {
                handlers[event] = cb;
            }
        );
    });

    it("registers a handler for the ENTRY_LOCK_INFO_UPDATE push", () => {
        useEntryLockInfoUpdateEvent();

        expect(mockPostMessage.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.ENTRY_LOCK_INFO_UPDATE,
            expect.any(Function)
        );
    });

    it("writes a pushed lock map into the mirror for that entry scope", () => {
        useEntryLockInfoUpdateEvent();

        handlers[VisualBuilderPostMessageEvents.ENTRY_LOCK_INFO_UPDATE]({
            data: { entryUid: "entry_1", locale: "en-us", fieldLockInfo: locks },
        });

        expect(getEntryFieldLockInfo(scope)).toEqual(locks);
    });

    it("replaces the scope on each push so released locks drop out", () => {
        setEntryFieldLockInfo(scope, locks);
        useEntryLockInfoUpdateEvent();

        handlers[VisualBuilderPostMessageEvents.ENTRY_LOCK_INFO_UPDATE]({
            data: { entryUid: "entry_1", locale: "en-us", fieldLockInfo: {} },
        });

        expect(getEntryFieldLockInfo(scope)).toEqual({});
    });
});
