interface ReplaceAssetButtonProp {
    targetElement: Element;
    onClickCallback: () => void;
}

function ReplaceAssetButtonComponent(props: ReplaceAssetButtonProp) {
    const dimension = props.targetElement.getBoundingClientRect();

    return (
        <button
            className="visual-editor__replace-button"
            data-testid="visual-editor-replace-asset"
            style={{
                top: `${dimension.bottom + window.scrollY - 30}px`,
                right: `${window.innerWidth - dimension.right}px`,
            }}
            onClick={props.onClickCallback}

        >
            Replace Asset
        </button>
    );
}

export default ReplaceAssetButtonComponent;
