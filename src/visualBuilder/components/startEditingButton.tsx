import classNames from "classnames";
import getVisualBuilderRedirectionUrl from "../utils/getVisualBuilderRedirectionUrl";
import { EditIcon } from "./icons";
import { visualBuilderStyles } from "../visualBuilder.style";
import React from "preact/compat";

function StartEditingButtonComponent(): JSX.Element {
    return (
        <a
            href={getVisualBuilderRedirectionUrl().toString()}
            className={classNames(
                "visual-builder__start-editing-btn",
                visualBuilderStyles()["visual-builder__start-editing-btn"]
            )}
            data-testid="vcms-start-editing-btn"
            onClick={(e) => {
                const targetElement = e.target as HTMLAnchorElement;
                targetElement.setAttribute(
                    "href",
                    getVisualBuilderRedirectionUrl().toString()
                );
            }}
        >
            <EditIcon />
            <span>Start Editing</span>
        </a>
    );
}

export default StartEditingButtonComponent;
