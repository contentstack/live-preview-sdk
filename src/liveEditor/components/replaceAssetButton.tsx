import classNames from "classnames";
import { ReplaceAssetIcon } from "./icons";
import { liveEditorStyles } from "../liveEditor.style";
import React from "preact/compat";

interface ReplaceAssetButtonProp {
    targetElement: Element;
    onClickCallback: (event: any) => void;
}

function ReplaceAssetButtonComponent(
    props: ReplaceAssetButtonProp
): JSX.Element {
    return (
        <button
            className={classNames(
                "visual-builder__replace-button visual-builder__button visual-builder__button--secondary",
                liveEditorStyles()["visual-builder__button"],
                liveEditorStyles()["visual-builder__button--secondary"]
            )}
            data-testid="visual-editor-replace-asset"
            onClick={props.onClickCallback}
        >
            <ReplaceAssetIcon />
        </button>
    );
}

export default ReplaceAssetButtonComponent;
