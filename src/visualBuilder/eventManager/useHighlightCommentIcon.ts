import React from "preact/compat";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { highlightCommentIconOnCanvas, removeAllHighlightedCommentIcons } from "../generators/generateHighlightedComment";
import { CslpData } from "../../cslp/types/cslp.types";
import { ISchemaFieldMap } from "../utils/types/index.types";

// Define the event data for handling comments
export interface IHighlightFieldMetadata extends Omit<CslpData, 'instance' | 'multipleFieldMetadata'> {}
export type IFieldSchemaForDiscussion = Pick<
  ISchemaFieldMap,
  "uid" | "display_name" | "data_type"
>;
export interface IHighlightCommentData {
    fieldMetadata: IHighlightFieldMetadata; 
    fieldSchema: IFieldSchemaForDiscussion;
    discussionUID: string;
    absolutePath: string;
}

export interface IHighlightComments {
    payload: IHighlightCommentData[]; // Array of paths where comments exist
}

export interface IHighlightCommentsEvent {
    data: IHighlightComments;
}

const handleAddCommentIcons = (event: IHighlightCommentsEvent) => {
    const { payload } = event.data; // Get the array of path and its data
    highlightCommentIconOnCanvas(payload);
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