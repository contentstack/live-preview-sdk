import classNames from "classnames";
import { CslpData } from "../../cslp/types/cslp.types";
import { visualBuilderStyles } from "../visualBuilder.style";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { observeParentAndFocusNewInstance } from "../utils/multipleElementAddButton";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import React from "preact/compat";
import { startCase, toLower } from "lodash-es";
import { getDOMEditStack } from "../utils/getCsDataOfElement";
import { getPeerLockForField } from "../utils/fieldLockIndicator";

interface EmptyBlockProps {
    details: {
        fieldMetadata: CslpData;
        fieldSchema: ISchemaFieldMap;
    };
}

export function EmptyBlock(props: EmptyBlockProps): JSX.Element {
    const { details } = props;

    const blockParentName = details.fieldSchema.display_name;

    async function sendAddInstanceEvent(event: MouseEvent) {
        // A peer holds this field: adding would edit through their lock, the same
        // no-op a click on a peer-locked field gets in the click listener.
        if (getPeerLockForField(details.fieldMetadata)) return;

        // The empty-state add never selects the field, so nothing else claims the
        // lock. Fire and forget: the parent does not await the claim either.
        const DOMEditStack = getDOMEditStack(event.currentTarget as Element);
        // An empty stack reads as a deselect on the parent and would RELEASE the lock.
        if (DOMEditStack.length) {
            visualBuilderPostMessage?.send(
                VisualBuilderPostMessageEvents.FOCUS_FIELD,
                { DOMEditStack }
            );
        }

        try {
            await visualBuilderPostMessage?.send(
                VisualBuilderPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: details.fieldMetadata,
                    index: 0,
                }
            );
        } catch (error) {
            console.error("Visual Builder: Failed to add instance", error);
        }
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
                This page doesn’t have any{" "}
                <span
                    className={classNames(
                        "visual-builder__empty-block-field-name",
                        visualBuilderStyles()[
                            "visual-builder__empty-block-field-name"
                        ]
                    )}
                >
                    {startCase(toLower(blockParentName))}
                </span>{" "}
                added. Click the button below to add one.
            </div>
            <button
                className={classNames(
                    "visual-builder__empty-block-add-button",
                    visualBuilderStyles()[
                        "visual-builder__empty-block-add-button"
                    ]
                )}
                onClick={(e) =>
                    sendAddInstanceEvent(e as unknown as MouseEvent)
                }
                type="button"
                data-testid="visual-builder__empty-block-add-button"
            >
                <span
                    className={classNames(
                        "visual-builder__empty-block-plus-icon",
                        visualBuilderStyles()[
                            "visual-builder__empty-block-plus-icon"
                        ]
                    )}
                >
                    +
                </span>
                &nbsp; Add {blockParentName}
            </button>
        </div>
    );
}
