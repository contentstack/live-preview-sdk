import classNames from "classnames";
import React from "preact/compat";
import { visualBuilderStyles } from "../visualBuilder.style";
import { getPsuedoEditableElementStyles } from "../utils/getPsuedoEditableStylesElement";

interface PseudoEditableFieldProps {
    editableElement: HTMLElement;
    config: { textContent: string };
}

function PseudoEditableFieldComponent(
    props: PseudoEditableFieldProps
): JSX.Element {
    const styles = getPsuedoEditableElementStyles(props.editableElement, true);

    return (
        <div
            className={classNames(
                "visual-builder__pseudo-editable-element",
                visualBuilderStyles()["visual-builder__pseudo-editable-element"]
            )}
            data-testid="visual-builder__pseudo-editable-element"
            style={styles}
        >
            {props.config.textContent}
        </div>
    );
}

export default PseudoEditableFieldComponent;
