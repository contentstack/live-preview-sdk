import { extractDetailsFromCslp, isValidCslp } from "../../cslp/cslpdata";

type EntryIdentifiers = {
    entriesInCurrentPage: {
      entryUid: string;
      contentTypeUid: string;
      locale: string;
    }[];
}

export function getEntryIdentifiersInCurrentPage(): EntryIdentifiers {
    const elementsWithCslp = Array.from(
        document.querySelectorAll("[data-cslp]")
    );
    const uniqueEntriesMap = new Map<string, { entryUid: string, contentTypeUid: string, locale: string}>();
    elementsWithCslp.forEach((element) => {
        const cslpValue = element.getAttribute("data-cslp");
        if (!isValidCslp(cslpValue)) return;
        const cslpData = extractDetailsFromCslp(cslpValue);
        uniqueEntriesMap.set(cslpData.entry_uid, 
            { 
                entryUid: cslpData.entry_uid, 
                contentTypeUid: cslpData.content_type_uid, 
                locale: cslpData.locale 
            }
        );
    });
    
    const uniqueEntriesArray = Array.from(uniqueEntriesMap.values());

    return {
        entriesInCurrentPage: uniqueEntriesArray,
    };
}
