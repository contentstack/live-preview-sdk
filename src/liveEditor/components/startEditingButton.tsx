import getLiveEditorRedirectionUrl from "../utils/getLiveEditorRedirectionUrl";
import { EditIcon } from "./icons";

function StartEditingButtonComponent(): JSX.Element {
    return (
        <a
            href={getLiveEditorRedirectionUrl().toString()}
            className="visual-editor__start-editing-btn"
            data-testid="vcms-start-editing-btn"
            onClick={(e) => {
                const targetElement = e.target as HTMLAnchorElement;
                targetElement.setAttribute(
                    "href",
                    getLiveEditorRedirectionUrl().toString()
                );
            }}
        >
            <EditIcon />
            <span>Start Editing</span>
        </a>
    );
}

export default StartEditingButtonComponent;
