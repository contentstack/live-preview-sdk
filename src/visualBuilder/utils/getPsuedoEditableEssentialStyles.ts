import getCamelCaseStyles from "./getCamelCaseStyles";

export function getPsuedoEditableEssentialStyles({
    rect,
    camelCase,
}: {
    rect: DOMRect;
    camelCase: boolean | undefined;
}) {
    const overrides = {
        position: "absolute",
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        height: "auto",
        "min-height": `${Math.abs(rect.height)}px`,
        "white-space": "normal",
        "text-transform": "none",
        "text-wrap-mode": "wrap",
        "text-overflow": "visible",
    };
    return camelCase ? getCamelCaseStyles(overrides) : overrides;
}
