import getChildElements from "./getChildElements";

export default function getChildrenDirection(
    editableElement: Element,
    parentCslpValue: string
): "none" | "horizontal" | "vertical" {
    if (!editableElement) {
        return "none";
    }

    const parentElement = editableElement.closest(
        `[data-cslp="${parentCslpValue}"]`
    );

    if (!parentElement) {
        return "none";
    }

    const [firstChildElement, secondChildElement, removeClone] =
        getChildElements(parentElement, parentCslpValue);

    if (!firstChildElement) return "none";

    // get horizontal and vertical position differences
    const firstChildBounds = firstChildElement.getBoundingClientRect();
    const secondChildBounds = secondChildElement.getBoundingClientRect();

    const deltaX = Math.abs(firstChildBounds.left - secondChildBounds.left);
    const deltaY = Math.abs(firstChildBounds.top - secondChildBounds.top);

    const dir = deltaX > deltaY ? "horizontal" : "vertical";

    // remove the clone that was created in case there was only one child
    removeClone();

    return dir;
}
