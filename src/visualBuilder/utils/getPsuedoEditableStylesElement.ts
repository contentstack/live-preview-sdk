import getCamelCaseStyles from "./getCamelCaseStyles";
import getStyleOfAnElement from "./getStyleOfAnElement";

export function getPsuedoEditableElementStyles(
    psuedoEditableElement: HTMLElement,
    camelCase?: boolean
): { [key: string]: string } {
    let styles = getStyleOfAnElement(psuedoEditableElement);
    if (camelCase) {
        styles = getCamelCaseStyles(styles);
    }
    // Get the offsetTop and offsetLeft of the editable element and set the position of the pseudo editable element
    // The pseudo editable element is positioned absolutely at the same location as the editable element
    const rect = psuedoEditableElement.getBoundingClientRect();

    styles.position = "absolute";
    styles.top = `${rect.top + window.scrollY}px`;
    styles.left = `${rect.left + window.scrollX}px`;
    // setting height to auto so that the element can grow based on the content
    // and the resize observer can detect the change in height
    styles.height = "auto";
    styles.whiteSpace = "pre-line";
    styles.textTransform = "none";

    return styles;
}
