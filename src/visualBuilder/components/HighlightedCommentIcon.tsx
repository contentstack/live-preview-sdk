import { h } from "preact";
import { VNode } from "preact";
import { HighlightCommentIcon } from "./icons";
import React from "preact/compat";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { IHighlightCommentData } from "../eventManager/useHighlightCommentIcon";
import Config from "../../configManager/configManager";
import { toggleCollabPopup } from "../generators/generateThread";

const HighlightedCommentIcon = (props: {
    data: IHighlightCommentData;
}): VNode => {
    const { data } = props;
    const config = Config.get();

    const handleCommentModal = async () => {
        visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.OPEN_FIELD_COMMENT_MODAL,
            {
                fieldMetadata: data?.fieldMetadata,
                discussion: data?.discussion,
                fieldSchema: data?.fieldSchema,
                absolutePath: data.absolutePath,
            }
        );

        toggleCollabPopup({ threadUid: "", action: "close" });
        Config.set("collab.isFeedbackMode", true);
    };
    return (
        <div className="collab-icon" onClick={handleCommentModal}>
            <HighlightCommentIcon />
        </div>
    );
};

export default HighlightedCommentIcon;
