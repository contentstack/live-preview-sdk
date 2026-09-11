import { extractDetailsFromCslp, isValidCslp } from "../../cslp/cslpdata";

export type EntryIdentifier = {
    entryUid: string;
    contentTypeUid: string;
    locale: string;
};

export type EntryIdentifiers = {
    entriesInCurrentPage: EntryIdentifier[];
};

/**
 * Distinct entries rendered on the page, read from `data-cslp`. The same entry
 * in two locales is two results: the editor keeps one channel per entry+locale.
 */
export function getEntryIdentifiersInCurrentPage(): EntryIdentifiers {
    const elementsWithCslp = Array.from(
        document.querySelectorAll("[data-cslp]")
    );
    const uniqueEntriesMap = new Map<string, EntryIdentifier>();
    elementsWithCslp.forEach((element) => {
        const cslpValue = element.getAttribute("data-cslp");
        if (!isValidCslp(cslpValue)) return;
        const cslpData = extractDetailsFromCslp(cslpValue);
        uniqueEntriesMap.set(`${cslpData.entry_uid}.${cslpData.locale}`, {
            entryUid: cslpData.entry_uid,
            contentTypeUid: cslpData.content_type_uid,
            locale: cslpData.locale,
        });
    });

    return {
        entriesInCurrentPage: Array.from(uniqueEntriesMap.values()),
    };
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
