import classNames from "classnames";
import { CslpData } from "../../cslp/types/cslp.types";
import { liveEditorStyles } from "../liveEditor.style";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { observeParentAndFocusNewInstance } from "../utils/multipleElementAddButton";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

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
        await liveEditorPostMessage?.send(
            LiveEditorPostMessageEvents.ADD_INSTANCE,
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
                liveEditorStyles()["visual-builder__empty-block"]
            )}
        >
            <div
                className={classNames(
                    "visual-builder__empty-block-title",
                    liveEditorStyles()["visual-builder__empty-block-title"]
                )}
            >
                There are no {blockParentName.toLowerCase()} to show in this
                section.
            </div>
            <button
                className={classNames(
                    "visual-builder__empty-block-add-button",
                    liveEditorStyles()["visual-builder__empty-block-add-button"]
                )}
                onClick={() => sendAddInstanceEvent()}
            >
                <i className="fas fa-plus"></i> &nbsp;
                {blockParentName}
            </button>
        </div>
    );
}
