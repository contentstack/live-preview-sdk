import { getEntryFieldLockInfo } from "./fieldLockStore";
import { getEntryLockInfo } from "./getEntryLockInfo";
import type { EntryFieldLock, EntryLockScope } from "./fieldLockStore";
import type { CslpData } from "../../cslp/types/cslp.types";

type FieldMetadataForLock = Pick<
    CslpData,
    "entry_uid" | "locale" | "variant" | "fieldPath" | "fieldPathWithIndex"
>;

/** A lock counts as a peer lock when it is locked and not the current user's. */
function asPeerLock(lock: EntryFieldLock | undefined): EntryFieldLock | null {
    return lock?.isLocked && lock.isOwn !== true ? lock : null;
}

/**
 * Returns the peer lock (a lock held by another user) for a field, or null when
 * the field is unlocked or locked by the current user. Reads the SDK mirror the
 * parent keeps in sync; the parent stamps `isOwn`. The lock display is now
 * hover-driven (see mouseHover), so this is the single source consumers call on
 * hover/click rather than a persistent page-wide paint.
 *
 * Container fields propagate the lock, mirroring the entry editor's
 * useContainerFieldLock: a peer lock on an ancestor disables its descendants
 * (parent locked => child locked) and a peer lock on a descendant disables the
 * ancestor's structural actions (child locked => container locked). Mirror keys
 * are cslp index-form, so the ancestor/descendant scan compares against
 * fieldPathWithIndex.
 */
export function getPeerLockForField(
    fieldMetadata: FieldMetadataForLock
): EntryFieldLock | null {
    const scopeLocks = getEntryFieldLockInfo({
        entryUid: fieldMetadata.entry_uid,
        locale: fieldMetadata.locale,
        ...(fieldMetadata.variant ? { variantUid: fieldMetadata.variant } : {}),
    });

    const exact = asPeerLock(
        scopeLocks[fieldMetadata.fieldPathWithIndex] ??
            scopeLocks[fieldMetadata.fieldPath]
    );
    if (exact) return exact;

    const target = fieldMetadata.fieldPathWithIndex || fieldMetadata.fieldPath;
    if (!target) return null;
    for (const lockedPath of Object.keys(scopeLocks)) {
        if (
            target.startsWith(lockedPath + ".") ||
            lockedPath.startsWith(target + ".")
        ) {
            const peer = asPeerLock(scopeLocks[lockedPath]);
            if (peer) return peer;
        }
    }
    return null;
}

/** Avatar display (initials + colour + full name) for a lock's holder. */
export function lockAvatarInfo(lock: EntryFieldLock): {
    initials: string;
    color: string;
    name: string;
} {
    const user = lock.user ?? { uid: "" };
    let initials = "?";
    if (typeof user.initials === "string" && user.initials.trim()) {
        initials = user.initials.trim();
    } else if (typeof user.name === "string" && user.name.trim()) {
        initials = user.name.trim().slice(0, 2).toUpperCase();
    }
    const color =
        typeof user.avatarColor === "string" && user.avatarColor
            ? user.avatarColor
            : "#6c5ce7";
    const name = typeof user.name === "string" ? user.name : "";
    return { initials, color, name };
}

/** Entries whose snapshot has already been requested this session. */
const requestedScopes = new Set<string>();

/**
 * Requests an entry's lock snapshot at most once (the parent pushes deltas after,
 * so re-asking is unnecessary) to seed the SDK mirror. Safe to call on every
 * hover — it de-dupes per entry scope. A transient failure is not cached: the
 * scope is released so a later hover retries, otherwise one blip would silence
 * lock info for that entry for the whole session.
 */
export async function requestEntryLockInfoOnce(
    scope: EntryLockScope
): Promise<void> {
    const key = `${scope.entryUid}.${scope.locale}${
        scope.variantUid ? `.${scope.variantUid}` : ""
    }`;
    if (requestedScopes.has(key)) {
        return;
    }
    requestedScopes.add(key);

    const result = await getEntryLockInfo(scope);
    if (result === null) {
        requestedScopes.delete(key);
    }
}
