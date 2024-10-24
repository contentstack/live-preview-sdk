import classNames from "classnames";
import getCamelCaseStyles from "../utils/getCamelCaseStyles";
import getStyleOfAnElement from "../utils/getStyleOfAnElement";
import React from "preact/compat";
import { visualBuilderStyles } from "../visualBuilder.style";

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
    const rect = props.editableElement.getBoundingClientRect();

    styles.position = "absolute";
    styles.top = `${rect.top + window.scrollY}px`;
    styles.left = `${rect.left + window.scrollX}px`;
    // setting height to auto so that the element can grow based on the content
    // and the resize observer can detect the change in height
    styles.height = "auto";
    styles.whiteSpace = "pre-line"
    styles.textTransform = "none"

    return (
        <div
            className={
                classNames("visual-builder__pseudo-editable-element", visualBuilderStyles()["visual-builder__pseudo-editable-element"])
            }
            data-testid="visual-builder__pseudo-editable-element"
            style={styles}
        >
            {props.config.textContent}
        </div>
    );
}

export default PseudoEditableFieldComponent;
