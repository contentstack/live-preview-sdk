import classNames from "classnames";
import getVisualBuilderRedirectionUrl from "../utils/getVisualBuilderRedirectionUrl";
import { EditIcon } from "./icons";
import { visualBuilderStyles } from "../visualBuilder.style";
import React from "preact/compat";
import Config from "../../configManager/configManager";
import { IConfigEditButtonBuilder } from "../../types/types";


type Position = NonNullable<IConfigEditButtonBuilder['position']>;

const positionStyles: Record<Position, string> = {
    "bottom-right": visualBuilderStyles()['visual-builder__start-editing-btn__bottom-right'],
    "bottom-left": visualBuilderStyles()['visual-builder__start-editing-btn__bottom-left'],
    "top-left": visualBuilderStyles()['visual-builder__start-editing-btn__top-left'],
    "top-right": visualBuilderStyles()['visual-builder__start-editing-btn__top-right'],
}

function getEditButtonPosition(position: any): Position {
    const validPositions: Position[] = ['bottom-left', 'bottom-right', 'top-left', 'top-right']
    if(validPositions.includes(position)){
        return position
    } else {
        return "bottom-right"
    }
}

function StartEditingButtonComponent(): JSX.Element | null {
    const config = Config.get()
    const enable = config.editButtonBuilder.enable;
    const position = config.editButtonBuilder.position || "bottom-right";

    return enable ? (
        <a
            href={getVisualBuilderRedirectionUrl().toString()}
            className={classNames(
                "visual-builder__start-editing-btn",
                visualBuilderStyles()["visual-builder__start-editing-btn"],
                positionStyles[getEditButtonPosition(position)]
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
    ) : null;
}

export default StartEditingButtonComponent;
