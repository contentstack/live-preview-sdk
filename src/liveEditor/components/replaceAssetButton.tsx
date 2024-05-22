import { ReplaceAssetIcon } from "./icons";

interface ReplaceAssetButtonProp {
    targetElement: Element;
    onClickCallback: (event: any) => void;
}

function ReplaceAssetButtonComponent(
    props: ReplaceAssetButtonProp
): JSX.Element {
    return (
        <button
            className="visual-editor__replace-button visual-editor__button visual-editor__button--secondary"
            data-testid="visual-editor-replace-asset"
            onClick={props.onClickCallback}
        >
            <ReplaceAssetIcon />
        </button>
    );
}

export default ReplaceAssetButtonComponent;
