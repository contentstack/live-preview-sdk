import {
    getEntryEditRestriction,
    getEntryFieldLockInfo,
} from "./fieldLockStore";
import { getEntryLockInfo } from "./getEntryLockInfo";
import type {
    EntryEditRestriction,
    EntryFieldLock,
    EntryLockScope,
} from "./fieldLockStore";
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

export const ENTRY_RESTRICTION_MESSAGES: Record<EntryEditRestriction, string> = {
    olderVersion:
        "You're viewing an older version of this entry. Switch to the latest version to edit.",
    unlocalized:
        "This entry isn't localized in this language yet. Save it from the form to localize it, then edit here.",
    unsavedVariant:
        "This variant hasn't been saved yet. Save it from the form to edit this field here.",
};

/**
 * The message for an entry-wide edit restriction on this field's entry, or null. A variant
 * field also inherits a restriction recorded on its base entry.
 */
export function getEntryEditRestrictionForField(
    fieldMetadata: FieldMetadataForLock
): string | null {
    const scope = {
        entryUid: fieldMetadata.entry_uid,
        locale: fieldMetadata.locale,
    };
    const restriction =
        (fieldMetadata.variant
            ? getEntryEditRestriction({
                  ...scope,
                  variantUid: fieldMetadata.variant,
              })
            : null) ?? getEntryEditRestriction(scope);
    return restriction ? ENTRY_RESTRICTION_MESSAGES[restriction] : null;
}

/** True when auto-draft blocks editing this field: a peer lock or an entry restriction. */
export function isFieldBlockedByAutoDraft(
    fieldMetadata: FieldMetadataForLock
): boolean {
    return (
        Boolean(getEntryEditRestrictionForField(fieldMetadata)) ||
        Boolean(getPeerLockForField(fieldMetadata))
    );
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
/** Snapshot requests still in flight, so a caller can wait for the first one. */
const inFlightRequests = new Map<string, Promise<void>>();

const requestKey = (scope: Omit<EntryLockScope, "contentTypeUid">): string =>
    `${scope.entryUid}.${scope.locale}${
        scope.variantUid ? `.${scope.variantUid}` : ""
    }`;

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
    const key = requestKey(scope);
    if (requestedScopes.has(key)) {
        return;
    }
    requestedScopes.add(key);

    const request = getEntryLockInfo(scope).then((result) => {
        if (result === null) {
            requestedScopes.delete(key);
        }
    });
    inFlightRequests.set(key, request);
    try {
        await request;
    } finally {
        inFlightRequests.delete(key);
    }
}

/**
 * Waits (bounded) for this scope's first snapshot if it is still in flight. Inline editing calls
 * this so a fresh canvas does not open a field for editing before an entry restriction arrives.
 */
export async function waitForEntryLockInfo(
    scope: Omit<EntryLockScope, "contentTypeUid">,
    timeoutMs = 1500
): Promise<void> {
    const request = inFlightRequests.get(requestKey(scope));
    if (!request) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([
        request,
        new Promise<void>((resolve) => {
            timer = setTimeout(resolve, timeoutMs);
        }),
    ]);
    clearTimeout(timer);
}
