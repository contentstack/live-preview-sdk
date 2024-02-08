import { CslpData } from "../../cslp/types/cslp.types";
import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import { DATA_CSLP_ATTR_SELECTOR } from "./constants";

/**
 * Returns the CSLP data of the closest ancestor element with a `data-cslp` attribute
 * to the target element of a mouse event.
 * @param event - The mouse event.
 * @param fieldSchemaMap - A map of field schemas.
 * @returns The CSLP data of the closest ancestor element with a `data-cslp` attribute,
 * along with metadata and schema information for the corresponding field.
 */
export function getCsDataOfElement(
    event: MouseEvent
): VisualEditorCslpEventDetails | undefined {
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

export function getDOMEditStack(ele: Element): CslpData[] {
    const cslpSet: string[] = [];
    let curr: any = ele.closest(`[${DATA_CSLP_ATTR_SELECTOR}]`);
    while (curr) {
        const cslp = curr.getAttribute(DATA_CSLP_ATTR_SELECTOR)!;
        const entryPrefix = cslp.split(".").slice(0, 3).join(".");
        const hasSamePrevPrefix = (cslpSet.at(0) || "").startsWith(entryPrefix);
        if (!hasSamePrevPrefix) {
            cslpSet.unshift(cslp);
        }
        curr = curr.parentElement?.closest(`[${DATA_CSLP_ATTR_SELECTOR}]`);
    }
    return cslpSet.map((cslp) => extractDetailsFromCslp(cslp));
}
