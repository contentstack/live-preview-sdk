/**
 * SDK-side read-only mirror of entry field-lock state.
 *
 * The parent window is the single source of truth for locks. The SDK keeps this
 * mirror in sync via the initial snapshot (getEntryLockInfo) and subsequent
 * pushes from the parent (ENTRY_LOCK_INFO_UPDATE). Consumers read from here to
 * render indicators and gate actions; they never mutate lock state directly.
 */

export interface EntryFieldLock {
    user: {
        uid: string;
        name?: string;
        initials?: string;
        avatarColor?: string;
        [key: string]: unknown;
    };
    ttl: string;
    isLocked: boolean;
    /**
     * True when the lock belongs to the current session. The parent computes
     * this (the SDK knows neither the current user nor its socket id); a peer
     * lock is `isLocked && !isOwn`. Absent means treat as a peer lock.
     */
    isOwn?: boolean;
}

export type EntryFieldLockInfo = Record<string, EntryFieldLock>;

/** Every reason the parent can turn editing off for a whole entry scope. */
export const ENTRY_EDIT_RESTRICTIONS = [
    "olderVersion",
    "entryLocked",
    "contentTypeUpdated",
    "contentTypeDeleted",
    "autoDraftDisabled",
    "unlocalized",
    "unsavedVariant",
] as const;

/** Why the parent has turned editing off for a whole entry scope. */
export type EntryEditRestriction = (typeof ENTRY_EDIT_RESTRICTIONS)[number];

/** The parts that identify a lock scope: entry + locale + variant. */
export interface EntryLockScopeParts {
    entryUid: string;
    locale: string;
    variantUid?: string;
}

/** Scope parts plus the content type needed to build the lock-status request. */
export interface EntryLockScope extends EntryLockScopeParts {
    contentTypeUid: string;
}

const store = new Map<string, EntryFieldLockInfo>();
const restrictions = new Map<string, EntryEditRestriction>();
// Write sequence per restricted scope, so a late snapshot does not undo a newer update.
const restrictionWrites = new Map<string, number>();
// Per-scope monotonic write counter, so a late snapshot can detect that a newer
// delta already updated the scope and skip its stale overwrite.
const scopeVersions = new Map<string, number>();
let writeSeq = 0;
// Consumers (hover paint, field label) subscribe so the affordance re-renders
// the moment the mirror changes, not only on the next mouse move.
const lockListeners = new Set<() => void>();

function notifyLockListeners(): void {
    lockListeners.forEach((listener) => {
        try {
            listener();
        } catch (error) {
            console.debug("[Visual Builder] lock listener failed", error);
        }
    });
}

export function subscribeEntryFieldLockInfo(listener: () => void): () => void {
    lockListeners.add(listener);
    return () => {
        lockListeners.delete(listener);
    };
}

/**
 * Lock scope key: entry + locale + variant, mirroring the parent's entry key and
 * the Redis presence channel (both of which exclude content type). Content type
 * is only needed to build the lock-status request, not to identify the scope.
 */
export function entryLockScopeKey({
    entryUid,
    locale,
    variantUid,
}: EntryLockScopeParts): string {
    return `${entryUid}.${locale}${variantUid ? `.${variantUid}` : ""}`;
}

export function getEntryFieldLockVersion(scope: EntryLockScopeParts): number {
    return scopeVersions.get(entryLockScopeKey(scope)) ?? 0;
}

export function setEntryFieldLockInfo(
    scope: EntryLockScopeParts,
    fieldLockInfo: EntryFieldLockInfo
): void {
    const key = entryLockScopeKey(scope);
    store.set(key, fieldLockInfo ?? {});
    scopeVersions.set(key, ++writeSeq);
    notifyLockListeners();
}

export function getEntryFieldLockInfo(
    scope: EntryLockScopeParts
): EntryFieldLockInfo {
    return store.get(entryLockScopeKey(scope)) ?? {};
}

export function clearAllEntryFieldLockInfo(): void {
    store.clear();
    scopeVersions.clear();
    restrictions.clear();
    restrictionWrites.clear();
    notifyLockListeners();
}

/** Current write sequence; pass it to `seedEntryEditRestrictions` after a round trip. */
export function getEntryEditRestrictionWriteSeq(): number {
    return writeSeq;
}

const RESTRICTIONS: ReadonlySet<string> = new Set(ENTRY_EDIT_RESTRICTIONS);

/** Narrows a value from the parent; anything unknown is treated as "no restriction". */
export function toEntryEditRestriction(
    value: unknown
): EntryEditRestriction | null {
    return typeof value === "string" && RESTRICTIONS.has(value)
        ? (value as EntryEditRestriction)
        : null;
}

function writeRestriction(
    key: string,
    restriction: EntryEditRestriction | null
): boolean {
    restrictionWrites.set(key, ++writeSeq);
    if ((restrictions.get(key) ?? null) === restriction) return false;
    if (restriction) {
        restrictions.set(key, restriction);
    } else {
        restrictions.delete(key);
    }
    return true;
}

export function setEntryEditRestriction(
    scope: EntryLockScopeParts,
    restriction: EntryEditRestriction | null
): void {
    if (writeRestriction(entryLockScopeKey(scope), restriction)) {
        notifyLockListeners();
    }
}

/**
 * Replaces one entry's restrictions with a snapshot keyed `uid:locale[:variant]` (the parent's
 * entry key). Scopes absent from it are cleared; any scope updated after `seqBeforeRequest` is kept.
 */
export function seedEntryEditRestrictions(
    entryUid: string,
    snapshot: Record<string, unknown>,
    seqBeforeRequest: number
): void {
    const next = new Map<string, EntryEditRestriction | null>();
    for (const key of restrictions.keys()) {
        if (key.startsWith(`${entryUid}.`)) next.set(key, null);
    }
    for (const [parentKey, value] of Object.entries(snapshot)) {
        const [uid, locale, variantUid] = parentKey.split(":");
        if (uid !== entryUid) continue;
        next.set(
            entryLockScopeKey({ entryUid: uid, locale, variantUid }),
            toEntryEditRestriction(value)
        );
    }
    let changed = false;
    for (const [key, restriction] of next) {
        if ((restrictionWrites.get(key) ?? 0) > seqBeforeRequest) continue;
        changed = writeRestriction(key, restriction) || changed;
    }
    if (changed) notifyLockListeners();
}

export function getEntryEditRestriction(
    scope: EntryLockScopeParts
): EntryEditRestriction | null {
    return restrictions.get(entryLockScopeKey(scope)) ?? null;
}
