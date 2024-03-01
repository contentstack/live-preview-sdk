import getCamelCaseStyles from "../utils/getCamelCaseStyles";
import getStyleOfAnElement from "../utils/getStyleOfAnElement";

interface PseudoEditableFieldProps {
    editableElement: HTMLElement;
    config: { textContent: string };
}

function PseudoEditableFieldComponent(
    props: PseudoEditableFieldProps
): JSX.Element {
    const styles = getCamelCaseStyles(
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

export default PseudoEditableFieldComponent;
