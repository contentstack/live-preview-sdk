import React from "preact/compat";
import classNames from "classnames";
import { visualBuilderStyles } from "../visualBuilder.style";
import { PlusIcon } from "./icons";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { CslpData } from "../../cslp/types/cslp.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { Signal } from "@preact/signals";
import { isFieldLockRefused } from "../utils/fieldLockRefused";

interface AddInstanceButtonProps {
    value: any;
    onClick: (event: MouseEvent) => void;
    /** Called instead of `onClick` when a collaborator holds the field lock. */
    onFieldLockRefused?: () => void;
    label?: string | undefined;
    fieldSchema: ISchemaFieldMap | undefined;
    fieldMetadata: CslpData;
    index: number;
    loading: Signal<boolean>;
}

function AddInstanceButtonComponent(
    props: AddInstanceButtonProps
): JSX.Element {
    const fieldSchema = props.fieldSchema;
    const fieldMetadata = props.fieldMetadata;
    const index = props.index;
    const loading = props.loading;

    const onClick = async (event: MouseEvent) => {
        loading.value = true;
        let response: unknown;
        try {
            response = await visualBuilderPostMessage?.send(
                VisualBuilderPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata,
                    index,
                }
            );
        } catch (error) {
            console.error("Visual Builder: Failed to add instance", error);
        }
        loading.value = false;
        if (isFieldLockRefused(response)) {
            props.onFieldLockRefused?.();
            return;
        }
        props.onClick(event);
    };

    const buttonClassName = classNames(
        "visual-builder__add-button",
        visualBuilderStyles()["visual-builder__add-button"],
        {
            "visual-builder__add-button--with-label": props.label,
        },
        {
            [visualBuilderStyles()["visual-builder__add-button--loading"]]:
                loading.value,
        },
        visualBuilderStyles()["visual-builder__tooltip"]
    );

    const maxInstances =
        fieldSchema && fieldSchema.data_type !== "block"
            ? fieldSchema.max_instance
            : undefined;
    const isMaxInstances = maxInstances
        ? props.value.length >= maxInstances
        : false;
    const disabled = loading.value || isMaxInstances;

    return (
        <button
            className={buttonClassName}
            data-tooltip={"Add section"}
            data-testid="visual-builder-add-instance-button"
            disabled={disabled}
            title={
                maxInstances && isMaxInstances
                    ? `Max ${maxInstances} instances allowed`
                    : undefined
            }
            onClick={(e) => {
                const event = e as unknown as MouseEvent;
                onClick(event);
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
