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
    // Get the offsetTop and offsetLeft of the editable element and set the position of the pseudo editable element
    // The pseudo editable element is positioned absolutely at the same location as the editable element
    const { offsetTop, offsetLeft } = props.editableElement;

    styles.position = "absolute";
    styles.top = `${offsetTop}px`;
    styles.left = `${offsetLeft}px`;

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
