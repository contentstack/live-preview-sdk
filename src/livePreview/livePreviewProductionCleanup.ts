/**
 * Removes the "data-cslp" and "data-cslp-button-position" attributes from all nodes with the "data-cslp" attribute.
 */
export function removeDataCslp(): void {
    const nodes = document.querySelectorAll("[data-cslp]");

    nodes.forEach((node) => {
        node.removeAttribute("data-cslp");
        node.removeAttribute("data-cslp-button-position");
    });
}
