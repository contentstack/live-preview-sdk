import React from "preact/compat";
import classNames from "classnames";
import { visualBuilderStyles } from "../visualBuilder.style";
import { PlusIcon } from "./icons";
import { ISchemaFieldMap } from "../utils/types/index.types";

interface AddInstanceButtonProps {
    value: any;
    onClick: (event: MouseEvent) => void;
    label?: string | undefined;
    fieldSchema: ISchemaFieldMap | undefined;
}

function AddInstanceButtonComponent(
    props: AddInstanceButtonProps
): JSX.Element {
    const fieldSchema = props.fieldSchema;
    const disabled =
        fieldSchema && "max_instance" in fieldSchema && fieldSchema.max_instance
            ? props.value.length >= fieldSchema.max_instance
            : false;

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
            disabled={disabled}
            title={
                disabled && fieldSchema && "max_instance" in fieldSchema
                    ? `Max ${fieldSchema.max_instance} instances allowed`
                    : undefined
            }
            onClick={(e) => {
                const event = e as unknown as MouseEvent;
                props.onClick(event);
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
