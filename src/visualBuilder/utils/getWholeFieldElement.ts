// Strips the trailing index segment to derive the whole-field CSLP.
// Works for both V1 (ct.entry.locale.field.0) and V2 (v2:ct.entry.locale.field.0) formats.
export function getParentCslp(cslpValue: string): string {
    return cslpValue.split(".").slice(0, -1).join(".");
}

// Finds the nearest ancestor whose data-cslp matches parentCslp via DOM traversal.
export function getWholeFieldElement(
    instanceElement: Element,
    parentCslp: string
): Element | null {
    return instanceElement.closest(`[data-cslp="${parentCslp}"]`);
}
