import { CslpData } from "../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import { DATA_CSLP_ATTR_SELECTOR } from "./constants";
import { decodeMetadataFromString } from "../../utils/encodeDecode";

/**
 * Finds an element with CSLP data, checking both data-cslp attribute and invisible metadata
 * @param element - The element to check
 * @returns The CSLP value if found, null otherwise
 */
export function getElementCslpData(element: Element): string | null {
    // First check for data-cslp attribute
    const attrCslp = element.getAttribute(DATA_CSLP_ATTR_SELECTOR);
    if (attrCslp) {
        return attrCslp;
    }

    // Check for invisible metadata in text content
    if (element instanceof HTMLElement) {
        const textContent = element.textContent?.trim();
        if (textContent) {
            const { metadata } = decodeMetadataFromString(textContent);
            if (metadata?.cslp) {
                return metadata.cslp;
            }
        }
    }

    return null;
}

/**
 * Finds the closest ancestor element with CSLP data (either via attribute or invisible metadata)
 * @param element - The starting element
 * @returns The element with CSLP data, or null if not found
 */
export function closestElementWithCslp(element: Element | null): Element | null {
    let current = element;
    
    while (current && current !== document.body) {
        const cslpData = getElementCslpData(current);
        if (cslpData) {
            return current;
        }
        current = current.parentElement;
    }
    
    return null;
}

/**
 * Returns the CSLP data of the closest ancestor element with a `data-cslp` attribute
 * or invisible metadata to the target element of a mouse event.
 * @param event - The mouse event.
 * @returns The CSLP data of the closest ancestor element with a `data-cslp` attribute
 * or invisible metadata, along with metadata and schema information for the corresponding field.
 */
export function getCsDataOfElement(
    event: MouseEvent
): VisualBuilderCslpEventDetails | undefined {
    const targetElement = event.target as HTMLElement;
    if (!targetElement) {
        return;
    }
    
    // Try to find element using the standard attribute first
    let editableElement = targetElement.closest("[data-cslp]");
    
    // If not found via attribute, search for invisible metadata
    if (!editableElement) {
        editableElement = closestElementWithCslp(targetElement);
    }

    if (!editableElement) {
        return;
    }
    
    const cslpData = getElementCslpData(editableElement);
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
    
    // Try to find first element with CSLP (attribute or invisible metadata)
    let curr: Element | null = ele.closest(`[${DATA_CSLP_ATTR_SELECTOR}]`);
    
    // If not found via attribute, try invisible metadata
    if (!curr) {
        curr = closestElementWithCslp(ele);
    }
    
    while (curr) {
        const cslp = getElementCslpData(curr);
        
        if (cslp) {
            const entryPrefix = getPrefix(cslp);
            const hasSamePrevPrefix = getPrefix(cslpSet.at(0) || "").startsWith(
                entryPrefix
            );
            if (!hasSamePrevPrefix) {
                cslpSet.unshift(cslp);
            }
        }
        
        // Move to parent and find next element with CSLP
        if (curr.parentElement) {
            const attrParent = curr.parentElement.closest(`[${DATA_CSLP_ATTR_SELECTOR}]`);
            if (attrParent) {
                curr = attrParent;
            } else {
                curr = closestElementWithCslp(curr.parentElement);
            }
        } else {
            curr = null;
        }
    }
    return cslpSet.map((cslp) => extractDetailsFromCslp(cslp));
}
