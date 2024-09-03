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
    // setting height to auto so that the element can grow based on the content
    // and the resize observer can detect the change in height
    styles.height = "auto";
    styles.whiteSpace = "pre-line"

    return (
        <div
            className="visual-builder__pseudo-editable-element"
            data-testid="visual-builder__pseudo-editable-element"
            style={styles}
        >
            {props.config.textContent}
        </div>
    );
}

export default PseudoEditableFieldComponent;
