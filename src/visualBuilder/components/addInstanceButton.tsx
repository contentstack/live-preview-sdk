import classNames from "classnames";
import { visualBuilderStyles } from "../visualBuilder.style";
import { PlusIcon } from "./icons";
import React from "preact/compat";

interface AddInstanceButtonProps {
    onClickCallback: (event: MouseEvent) => void;
    label?: string | undefined;
}

function AddInstanceButtonComponent(
    props: AddInstanceButtonProps
): JSX.Element {
    return (
        <button
            className={classNames(
                "visual-builder__add-button",
                visualBuilderStyles()["visual-builder__add-button"],
                {
                    "visual-builder__add-button--with-label": props.label,
                }
            )}
            data-testid="visual-builder-add-instance-button"
            onClick={(e) => {
                const event = e as unknown as MouseEvent;
                props.onClickCallback(event);
            }}
        >
            <PlusIcon />
            {props.label ? (
                <span
                    title={props.label}
                    className={classNames(
                        "visual-builder__add-button-label",
                        visualBuilderStyles()[
                            "visual-builder__add-button-label"
                        ]
                    )}
                >
                    {props.label}
                </span>
            ) : null}
        </button>
    );
}

export default AddInstanceButtonComponent;