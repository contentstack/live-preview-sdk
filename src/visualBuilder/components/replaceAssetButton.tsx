import classNames from "classnames";
import { ReplaceAssetIcon } from "./icons";
import { visualBuilderStyles } from "../visualBuilder.style";
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
                visualBuilderStyles()["visual-builder__button"],
                visualBuilderStyles()["visual-builder__button--secondary"]
            )}
            data-testid="visual-editor-replace-asset"
            onClick={props.onClickCallback}
        >
            <ReplaceAssetIcon />
        </button>
    );
}

export default ReplaceAssetButtonComponent;
