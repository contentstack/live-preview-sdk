import { h } from "preact";
import { VNode } from "preact";
import { HighlightCommentIcon } from "./icons";
import React from "preact/compat";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { IHighlightCommentData } from "../eventManager/useHighlightCommentIcon";

const HighlightedCommentIcon = (props: {
    data: IHighlightCommentData;
}): VNode => {
    const { data } = props;

    const handleCommentModal = async () => {
        visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.OPEN_FIELD_COMMENT_MODAL,
            {
                fieldMetadata: data?.fieldMetadata,
                discussionUID: data?.discussionUID,
                fieldSchema: data?.fieldSchema,
                absolutePath: data.absolutePath,
            }
        );
    };
    return (
        <div onClick={handleCommentModal}>
            <HighlightCommentIcon />
        </div>
    );
};

export default HighlightedCommentIcon;
