import { getStyleOfAnElement } from "../utils/generatePseudoEditableField";

interface PseudoEditableFieldProps {
    editableElement: HTMLElement;
    config: { textContent: string };
}

function PseudoEditableFieldComponent(props: PseudoEditableFieldProps) {
    const styles = convertToCamelCase(
        getStyleOfAnElement(props.editableElement)
    );
    const { top, left } = props.editableElement.getBoundingClientRect();

    styles.position = "absolute";
    styles.top = `${top}px`;
    styles.left = `${left}px`;

    return (
        <div
            className="visual-editor__pseudo-editable-element"
            data-testid="visual-editor__pseudo-editable-element"
            style={styles}
        >
            {props.config.textContent}
        </div>
    );
}

function convertToCamelCase(styles: { [key: string]: string }): {
    [key: string]: string;
} {
    return Object.keys(styles).reduce((acc, key) => {
        const camelCasedKey = key.replace(/-([a-z])/g, (g) =>
            g[1].toUpperCase()
        ) as string;
        acc[camelCasedKey] = styles[key];
        return acc;
    }, {} as { [key: string]: string });
}

export default PseudoEditableFieldComponent;
