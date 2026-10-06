import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import {
    EntryEditRestriction,
    setEntryEditRestriction,
} from "../utils/fieldLockStore";

interface EntryEditRestrictionUpdateEvent {
    data: {
        entryUid: string;
        locale: string;
        variantUid?: string;
        restriction: EntryEditRestriction | null;
    };
}

/**
 * Mirrors the parent's per-entry edit restriction (older version open, unlocalized, ...) so the
 * entry's fields render disabled with the matching reason. Null clears the scope.
 */
export function useEntryEditRestrictionUpdateEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.ENTRY_EDIT_RESTRICTION_UPDATE,
        (event: EntryEditRestrictionUpdateEvent) => {
            const { entryUid, locale, variantUid, restriction } = event.data;
            setEntryEditRestriction(
                { entryUid, locale, ...(variantUid ? { variantUid } : {}) },
                restriction ?? null
            );
        }
    );
}
