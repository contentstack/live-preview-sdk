import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import { queryCslpAllElements, getElementCslpValue } from "./cslpQueryHelpers";

type EntryIdentifiers = {
    entriesInCurrentPage: {
      entryUid: string;
      contentTypeUid: string;
      locale: string;
    }[];
}

export function getEntryIdentifiersInCurrentPage(): EntryIdentifiers {
    const elementsWithCslp = queryCslpAllElements();
    const uniqueEntriesMap = new Map<string, { entryUid: string, contentTypeUid: string, locale: string}>();
    
    elementsWithCslp.forEach((element) => {
        const cslpValue = getElementCslpValue(element);
        if (cslpValue) {
            const cslpData = extractDetailsFromCslp(cslpValue);
            uniqueEntriesMap.set(cslpData.entry_uid, 
                { 
                    entryUid: cslpData.entry_uid, 
                    contentTypeUid: cslpData.content_type_uid, 
                    locale: cslpData.locale 
                }
            );
        }
    });
    
    const uniqueEntriesArray = Array.from(uniqueEntriesMap.values());

    return {
        entriesInCurrentPage: uniqueEntriesArray,
    };
}
