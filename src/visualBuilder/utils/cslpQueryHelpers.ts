import { decodeMetadataFromString } from "../../utils/encodeDecode";

/**
 * Finds an element with a specific CSLP value, checking both data-cslp attribute and invisible metadata
 * @param cslpValue - The CSLP value to search for
 * @returns The element with the matching CSLP value, or null if not found
 */
export function queryCslpElement(cslpValue: string): Element | null {
    // First try to find via attribute (faster)
    const elementWithAttr = document.querySelector(`[data-cslp="${cslpValue}"]`);
    if (elementWithAttr) {
        return elementWithAttr;
    }

    // Then search through all elements for invisible metadata
    const allElements = document.querySelectorAll("*");
    for (const element of allElements) {
        if (element.hasAttribute("data-cslp")) {
            continue; // Already checked via querySelector above
        }

        if (element instanceof HTMLElement) {
            const textContent = element.textContent?.trim();
            if (textContent) {
                const { metadata } = decodeMetadataFromString(textContent);
                if (metadata?.cslp === cslpValue) {
                    return element;
                }
            }
        }
    }

    return null;
}

/**
 * Finds all elements with CSLP data (both via attribute and invisible metadata)
 * @returns Array of elements that have CSLP data
 */
export function queryCslpAllElements(): Element[] {
    const elementsWithCslp: Element[] = [];
    
    // Get all elements with data-cslp attribute
    const elementsWithAttr = Array.from(document.querySelectorAll("[data-cslp]"));
    elementsWithCslp.push(...elementsWithAttr);

    // Check all other elements for invisible metadata
    const allElements = document.querySelectorAll("*");
    for (const element of allElements) {
        if (element.hasAttribute("data-cslp")) {
            continue; // Already included
        }

        if (element instanceof HTMLElement) {
            const textContent = element.textContent?.trim();
            if (textContent) {
                const { metadata } = decodeMetadataFromString(textContent);
                if (metadata?.cslp) {
                    elementsWithCslp.push(element);
                }
            }
        }
    }

    return elementsWithCslp;
}

/**
 * Gets the CSLP value from an element (checking both attribute and invisible metadata)
 * @param element - The element to get CSLP value from
 * @returns The CSLP value, or null if not found
 */
export function getElementCslpValue(element: Element): string | null {
    // First check for data-cslp attribute
    const attrCslp = element.getAttribute("data-cslp");
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
 * Finds an element with a specific CSLP unique ID or CSLP value
 * @param cslpUniqueId - The data-cslp-unique-id value to search for
 * @param cslpValue - The fallback CSLP value to search for
 * @returns The element with the matching CSLP unique ID or CSLP value, or null if not found
 */
export function queryCslpElementByIdOrValue(
    cslpUniqueId: string | undefined,
    cslpValue: string
): Element | null {
    if (cslpUniqueId) {
        const elementWithUniqueId = document.querySelector(
            `[data-cslp-unique-id="${cslpUniqueId}"]`
        );
        if (elementWithUniqueId) {
            return elementWithUniqueId;
        }
    }

    return queryCslpElement(cslpValue);
}

