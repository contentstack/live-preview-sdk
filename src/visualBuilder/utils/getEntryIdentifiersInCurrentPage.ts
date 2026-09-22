import { extractDetailsFromCslp, isValidCslp } from "../../cslp/cslpdata";

export type EntryIdentifier = {
    entryUid: string;
    contentTypeUid: string;
    locale: string;
};

export type EntryIdentifiers = {
    entriesInCurrentPage: EntryIdentifier[];
};

/** Distinct entries rendered on the page, one per entry uid, read from `data-cslp`. */
export function getEntryIdentifiersInCurrentPage(): EntryIdentifiers {
    const uniqueEntriesMap = new Map<string, EntryIdentifier>();
    document.querySelectorAll("[data-cslp]").forEach((element) => {
        const cslpValue = element.getAttribute("data-cslp");
        if (!isValidCslp(cslpValue)) return;
        const cslpData = extractDetailsFromCslp(cslpValue);
        uniqueEntriesMap.set(cslpData.entry_uid, {
            entryUid: cslpData.entry_uid,
            contentTypeUid: cslpData.content_type_uid,
            locale: cslpData.locale,
        });
    });
    return { entriesInCurrentPage: Array.from(uniqueEntriesMap.values()) };
}

/** Order-independent fingerprint of the entry set, used to notify only on change. */
export function getEntryIdentifiersSignature(
    entries: EntryIdentifier[]
): string {
    return entries
        .map((entry) => `${entry.entryUid}.${entry.locale}`)
        .sort()
        .join("|");
}
