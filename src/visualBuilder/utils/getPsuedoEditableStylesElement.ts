import getCamelCaseStyles from "./getCamelCaseStyles";
import { getPsuedoEditableEssentialStyles } from "./getPsuedoEditableEssentialStyles";
import getStyleOfAnElement from "./getStyleOfAnElement";

export function getPsuedoEditableElementStyles(
    psuedoEditableElement: HTMLElement,
    camelCase?: boolean
): { [key: string]: string } {
    let styles = getStyleOfAnElement(psuedoEditableElement);
    // Get the offsetTop and offsetLeft of the editable element and set the position of the pseudo editable element
    // The pseudo editable element is positioned absolutely at the same location as the editable element
    const rect = psuedoEditableElement.getBoundingClientRect();

    if (camelCase) {
        styles = getCamelCaseStyles(styles);
    }
    const overrides = getPsuedoEditableEssentialStyles({ rect, camelCase });
    return { ...styles, ...overrides };
}
