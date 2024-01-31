import { extractDetailsFromCslp } from "../../utils/cslpdata";

export function getEntryUidFromCurrentPage() {
    const elementsWithCslp = Array.from(
        document.querySelectorAll("[data-cslp]")
    );
    const entryUidsInCurrentPage = elementsWithCslp.map((element) => {
        return extractDetailsFromCslp(
            element.getAttribute("data-cslp") as string
        ).entry_uid;
    });
    const uniqueEntryUidsInCurrentPage = Array.from<string>(
        new Set(entryUidsInCurrentPage)
    );

    return {
        entryUidsInCurrentPage: uniqueEntryUidsInCurrentPage,
    };
}
