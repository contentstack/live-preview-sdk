import { PlusIcon } from "./icons";

interface AddInstanceButtonProps {
    onClickCallback: (event: MouseEvent) => void;
    label?: string | undefined;
}

function AddInstanceButtonComponent(
    props: AddInstanceButtonProps
): JSX.Element {
    return (
        <button
            className={`visual-editor__add-button${
                props.label ? " visual-editor__add-button--with-label" : ""
            }`}
            data-testid="visual-editor-add-instance-button"
            onClick={(e) => {
                const event = e as unknown as MouseEvent;
                props.onClickCallback(event);
            }}
        >
            <PlusIcon />
            {props.label ? (
                <span
                    title={props.label}
                    className="visual-editor__add-button-label"
                >
                    {props.label}
                </span>
            ) : null}
        </button>
    );
}

export default AddInstanceButtonComponent;
