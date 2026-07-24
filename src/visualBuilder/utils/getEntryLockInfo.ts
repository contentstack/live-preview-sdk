import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";
import visualBuilderPostMessage from "./visualBuilderPostMessage";
import {
    EntryFieldLockInfo,
    EntryLockScope,
    getEntryFieldLockVersion,
    setEntryFieldLockInfo,
} from "./fieldLockStore";

/**
 * Asks the parent for the current field-lock snapshot of an entry and stores it
 * in the SDK mirror. The parent fetches it from the lock-status route and
 * subscribes to the entry's presence channel so it can push later updates.
 * Returns `null` (rather than throwing) when the read fails, so the caller can
 * tell a genuine "no locks" snapshot ({}) apart from a transient failure and
 * retry the latter.
 */
export async function getEntryLockInfo(
    scope: EntryLockScope
): Promise<EntryFieldLockInfo | null> {
    // Snapshot the scope version before the round-trip so we can tell if a newer
    // delta (ENTRY_LOCK_INFO_UPDATE) landed while we waited and avoid clobbering
    // it with this now-stale snapshot.
    const versionBeforeRequest = getEntryFieldLockVersion(scope);
    try {
        const response = await visualBuilderPostMessage?.send<{
            fieldLockInfo?: EntryFieldLockInfo;
            error?: boolean;
        }>(VisualBuilderPostMessageEvents.GET_ENTRY_LOCK_INFO, { ...scope });

        // The parent flags a genuine fetch failure with `error: true` (not an
        // empty map), so a transient blip is retried instead of being cached as
        // "no locks" for the rest of the session.
        if (!response || response.error || response.fieldLockInfo == null) {
            return null;
        }

        const fieldLockInfo = response.fieldLockInfo;
        // Only seed the mirror if no delta updated this scope during the
        // round-trip; a delta that arrived meanwhile is fresher than this
        // snapshot, so keep it.
        if (getEntryFieldLockVersion(scope) === versionBeforeRequest) {
            setEntryFieldLockInfo(scope, fieldLockInfo);
        }
        return fieldLockInfo;
    } catch (error) {
        console.debug(
            "[Visual Builder] Error fetching entry lock info",
            error
        );
        return null;
    }
}
