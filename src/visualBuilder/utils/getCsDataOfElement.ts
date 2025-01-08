import { CslpData } from "../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import { DATA_CSLP_ATTR_SELECTOR } from "./constants";

/**
 * Returns the CSLP data of the closest ancestor element with a `data-cslp` attribute
 * to the target element of a mouse event.
 * @param event - The mouse event.
 * @returns The CSLP data of the closest ancestor element with a `data-cslp` attribute,
 * along with metadata and schema information for the corresponding field.
 */
export function getCsDataOfElement(
    event: MouseEvent
): VisualBuilderCslpEventDetails | undefined {
    const targetElement = event.target as HTMLElement;
    if (!targetElement) {
        return;
    }
    const editableElement = targetElement.closest("[data-cslp]");

    if (!editableElement) {
        return;
    }
    const cslpData = editableElement.getAttribute("data-cslp");
    if (!cslpData) {
        return;
    }
    const fieldMetadata = extractDetailsFromCslp(cslpData);

    return {
        editableElement: editableElement,
        cslpData,
        fieldMetadata,
    };
}

function getPrefix(cslp: string): string {
    let prefix;
    if (cslp.startsWith("v2:")) {
        // v2: prefix is added to cslp in variant cases
        const variantPrefix = cslp.split(":")[1];
        const content_type_uid = variantPrefix.split(".")[0];
        const euid = variantPrefix.split(".")[1].split("_")[0]; //page.blt7a1e5b297a97bd12_cs8171e34d92207334.en-us
        const locale = variantPrefix.split(".")[2];
        prefix = `${content_type_uid}.${euid}.${locale}`;
    } else {
        prefix = cslp;
    }
    return prefix.split(".").slice(0, 3).join(".");
}

export function getDOMEditStack(ele: Element): CslpData[] {
    const cslpSet: string[] = [];
    let curr: any = ele.closest(`[${DATA_CSLP_ATTR_SELECTOR}]`);
    while (curr) {
        const cslp = curr.getAttribute(DATA_CSLP_ATTR_SELECTOR)!;
        const entryPrefix = getPrefix(cslp);
        const hasSamePrevPrefix = getPrefix(cslpSet.at(0) || "").startsWith(
            entryPrefix
        );
        if (!hasSamePrevPrefix) {
            cslpSet.unshift(cslp);
        }
        curr = curr.parentElement?.closest(`[${DATA_CSLP_ATTR_SELECTOR}]`);
    }
    return cslpSet.map((cslp) => extractDetailsFromCslp(cslp));
}
