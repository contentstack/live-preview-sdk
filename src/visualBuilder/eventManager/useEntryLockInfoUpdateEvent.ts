import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import {
    EntryFieldLockInfo,
    setEntryFieldLockInfo,
} from "../utils/fieldLockStore";

interface EntryLockInfoUpdateEvent {
    data: {
        entryUid: string;
        locale: string;
        variantUid?: string;
        fieldLockInfo: EntryFieldLockInfo;
    };
}

/**
 * Keeps the SDK's lock mirror live. The parent pushes an entry's current
 * field-lock map whenever a peer focuses or blurs a field; we overwrite that
 * entry's scope in the mirror so indicators and gating reflect it immediately.
 * The parent stays the single source of truth — the SDK only mirrors.
 */
export function useEntryLockInfoUpdateEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.ENTRY_LOCK_INFO_UPDATE,
        (event: EntryLockInfoUpdateEvent) => {
            const { entryUid, locale, variantUid, fieldLockInfo } = event.data;
            setEntryFieldLockInfo(
                {
                    entryUid,
                    locale,
                    ...(variantUid ? { variantUid } : {}),
                },
                fieldLockInfo ?? {}
            );
        }
    );
}
