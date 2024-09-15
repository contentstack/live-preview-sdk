import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { highlightCommentIconOnCanvas, removeAllHighlightedCommentIcons } from "../generators/generateHighlightedComment";
import React from "preact/compat";

// Define the event data for handling comments
export interface IHighlightComments {
    paths: string[]; // Array of paths where comments exist
}

export interface IHighlightCommentsEvent {
    data: IHighlightComments;
}

const handleAddCommentIcons = (event: IHighlightCommentsEvent) => {
    const { paths } = event.data; // Get the array of paths with comments
    highlightCommentIconOnCanvas(paths);
};

const handleRemoveCommentIcons = (): void => {
    removeAllHighlightedCommentIcons()
};

export const useHighlightCommentIcon = () => {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.HIGHLIGHT_ACTIVE_COMMENTS,
        handleAddCommentIcons
    );
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.REMOVE_HIGHLIGHTED_COMMENTS,
        handleRemoveCommentIcons
    );
};