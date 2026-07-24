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
    notifyLockListeners();
}
