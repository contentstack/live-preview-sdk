import getLiveEditorRedirectionUrl from "../utils/getLiveEditorRedirectionUrl";
import { EditIcon } from "./icons";

function StartEditingButtonComponent() : JSX.Element {
    return (
        <a
            href={getLiveEditorRedirectionUrl().toString()}
            className="visual-editor__start-editing-btn"
            data-testid="vcms-start-editing-btn"
            onClick={(e) => {
                const event = e as unknown as MouseEvent;
                updateStartEditingHref(event);
            }}
        >
            <EditIcon />
            <span>Start Editing</span>
        </a>
    );
}


function updateStartEditingHref(event: MouseEvent) {
    const startEditingButton = event.currentTarget as HTMLButtonElement;
    startEditingButton.setAttribute(
        "href",
        getLiveEditorRedirectionUrl().toString()
    );
}

export default StartEditingButtonComponent;
