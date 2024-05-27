/**
 * Retrieves the computed style of an HTML element.
 *
 * @param element - The HTML element to retrieve the style from.
 * @returns An object representing the computed style of the element.
 */
export default function getStyleOfAnElement(element: HTMLElement): {
    [key: string]: string;
} {
    const styleSheetDeclaration = window.getComputedStyle(element);
    const styleSheetArray = Array.from(styleSheetDeclaration);

    const FILTER_STYLES = [
        "position",
        "left",
        "top",
        "right",
        "bottom",
        "text-overflow",
        "margin",
        "margin-block-end",
        "margin-block-start",
        "margin-inline-end",
        "margin-inline-start",
        "margin-left",
        "margin-right",
        "margin-top",
        "margin-bottom",
        "-webkit-user-modify",
        "cursor",
    ];

    const styles: { [key: string]: string } = {};
    styleSheetArray.forEach((style: string) => {
        if (!FILTER_STYLES.includes(style)) {
            const styleValue = styleSheetDeclaration.getPropertyValue(style);
            styles[style] = styleValue;
        }
    });

    return styles;
}
