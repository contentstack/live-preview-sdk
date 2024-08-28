import classNames from "classnames";
import getLiveEditorRedirectionUrl from "../utils/getLiveEditorRedirectionUrl";
import { EditIcon } from "./icons";
import { liveEditorStyles } from "../liveEditor.style";

function StartEditingButtonComponent(): JSX.Element {
    return (
        <a
            href={getLiveEditorRedirectionUrl().toString()}
            className={classNames(
                "visual-builder__start-editing-btn",
                liveEditorStyles()["visual-builder__start-editing-btn"]
            )}
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
