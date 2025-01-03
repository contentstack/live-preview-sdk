import classNames from "classnames";
import { CslpData } from "../../cslp/types/cslp.types";
import { visualBuilderStyles } from "../visualBuilder.style";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { observeParentAndFocusNewInstance } from "../utils/multipleElementAddButton";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import React from "preact/compat";

interface EmptyBlockProps {
    details: {
        fieldMetadata: CslpData;
        fieldSchema: ISchemaFieldMap;
    };
}

export function EmptyBlock(props: EmptyBlockProps): JSX.Element {
    const { details } = props;

    const blockParentName = details.fieldSchema.display_name;

    async function sendAddInstanceEvent() {
        await visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.ADD_INSTANCE,
            {
                fieldMetadata: details.fieldMetadata,
                index: 0,
            }
        );
        observeParentAndFocusNewInstance({
            parentCslp: details.fieldMetadata.cslpValue,
            index: 0,
        });
    }

    return (
        <div
            className={classNames(
                "visual-builder__empty-block",
                visualBuilderStyles()["visual-builder__empty-block"]
            )}
        >
            <div
                className={classNames(
                    "visual-builder__empty-block-title",
                    visualBuilderStyles()["visual-builder__empty-block-title"]
                )}
            >
                There are no {blockParentName.toLowerCase()} on this page yet. Click the button below to add one.
            </div>
            <button
                className={classNames(
                    "visual-builder__empty-block-add-button",
                    visualBuilderStyles()[
                        "visual-builder__empty-block-add-button"
                    ]
                )}
                onClick={() => sendAddInstanceEvent()}
                type="button"
            >
                <i className="fas fa-plus"></i> &nbsp;
                {blockParentName}
            </button>
        </div>
    );
}
