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
    const childElements = parentElement.querySelectorAll(
        `[data-cslp^="${parentCslpValue + "."}"]`
    );

    // filter out elements that does not end with "." + number
    const filteredChildElements = Array.from(childElements).filter(
        (childElement) =>
            childElement.getAttribute("data-cslp")?.match(/\.\d+$/) !== null
    );

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
