import { PlusIcon } from "./icons";

interface AddInstanceButtonProps {
    onClickCallback: (event: MouseEvent) => void;
}

function AddInstanceButtonComponent(props: AddInstanceButtonProps) : JSX.Element {
    return (
        <button
            className="visual-editor__add-button"
            data-testid="visual-editor-add-instance-button"
            onClick={(e) => {
                const event = e as unknown as MouseEvent;
                props.onClickCallback(event);
            }}
        >
            <PlusIcon />
        </button>
    );
}

export default AddInstanceButtonComponent;
