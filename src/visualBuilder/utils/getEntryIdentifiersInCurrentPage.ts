import { extractDetailsFromCslp } from "../../cslp/cslpdata";

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
        const cslpData = extractDetailsFromCslp(
            element.getAttribute("data-cslp") as string
        );
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
