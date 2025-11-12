import { getElementCslpData } from "./getCsDataOfElement";

/**
 * Finds all child elements with CSLP data (both via attribute and invisible metadata)
 * @param parentElement The parent element to search within
 * @param parentCslpValue The parent's CSLP value to match against
 * @returns Array of elements with matching CSLP values
 */
function findAllChildrenWithCslp(
    parentElement: Element,
    parentCslpValue: string
): Element[] {
    // First, get all elements with data-cslp attributes
    const elementsWithAttr = Array.from(
        parentElement.querySelectorAll(`[data-cslp^="${parentCslpValue + "."}"]`)
    );

    // Then, check all descendants for invisible metadata
    const allDescendants = Array.from(parentElement.querySelectorAll("*"));
    const elementsWithMetadata: Element[] = [];

    for (const element of allDescendants) {
        // Skip if already found via attribute
        if (element.hasAttribute("data-cslp")) {
            continue;
        }

        const cslpData = getElementCslpData(element);
        if (cslpData && cslpData.startsWith(parentCslpValue + ".")) {
            elementsWithMetadata.push(element);
        }
    }

    // Combine and sort by document order
    const allChildren = [...elementsWithAttr, ...elementsWithMetadata];
    return allChildren.sort((a, b) => {
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            return -1;
        } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return 1;
        }
        return 0;
    });
}

/**
 * Gets the first and second child elements of the parent element.
 * @param parentElement The parent element that contains the child elements.
 * @param parentCslpValue The cslp value of the parent element.
 * @returns The first and second child elements and a function to remove the clone.
 */
export default function getChildElements(
    parentElement: Element,
    parentCslpValue: string
): [Element, Element, () => void] | [null, null, () => void] {
    // Get all children with CSLP (both attribute and invisible metadata)
    const childElements = findAllChildrenWithCslp(
        parentElement,
        parentCslpValue
    );

    // filter out elements that does not end with "." + number
    const filteredChildElements = childElements.filter((childElement) => {
        const cslpData = getElementCslpData(childElement);
        return cslpData?.match(/\.\d+$/) !== null;
    });

    const firstChild = filteredChildElements.at(0);
    if (!firstChild) return [null, null, () => {}];

    const secondChild = filteredChildElements.at(1);
    if (secondChild) return [firstChild, secondChild, () => {}];

    // create a dummy clone to get the direction
    const firstChildClone = document.createElement(firstChild.tagName);
    firstChildClone.setAttribute(
        "class",
        firstChild.getAttribute("class") ?? ""
    );

    const HIDE_ELEMENT_CSS =
        "overflow: hidden !important; width: 0 !important; height: 0 !important; padding: 0 !important; border: 0 !important;";
    firstChildClone.setAttribute("style", HIDE_ELEMENT_CSS);

    parentElement.appendChild(firstChildClone);

    function removeClone() {
        parentElement.removeChild(firstChildClone);
    }

    return [firstChild, firstChildClone, removeClone];
}
