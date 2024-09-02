import React, { useEffect, useState } from "react";
import { CslpData } from "../../cslp/types/cslp.types";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";
import { AddCommentIcon, ReadCommentIcon } from "./icons";
import { getDiscussionIdByFieldMetaData } from "../utils/getDiscussionIdByFieldMetaData";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { LoadingIcon } from "./icons/loading";

interface CommentIconProps {
    fieldMetadata: CslpData;
    fieldSchema: ISchemaFieldMap;
}

interface RecieveDiscussionEventData {
    data: {
        discussionUID: string;
        fieldUID: string;
        fieldPath: string;
        contentTypeId: string;
        entryId: string;
    };
}

const CommentIcon: React.FC<CommentIconProps> = ({
    fieldMetadata,
    fieldSchema,
}) => {
    const [discussionUID, setDiscussionUID] = useState<string>("new");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Fetch discussion ID based on field metadata
    useEffect(() => {
        const fetchDiscussionId = async () => {
            try {
                setIsLoading(true);
                const discussionUID = await getDiscussionIdByFieldMetaData({
                    fieldMetadata,
                    fieldUID: fieldSchema.uid,
                });
                setDiscussionUID(discussionUID ?? "new");
            } catch (error) {
                console.error("Failed to fetch discussion ID:", error);
                setDiscussionUID("new");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDiscussionId();
    }, [fieldMetadata]);

    // Set up message listener for receiving discussion ID
    useEffect(() => {
        const handleReceiveDiscussionId = (
            response: RecieveDiscussionEventData
        ) => {
            const { entryId, discussionUID, contentTypeId, fieldPath } =
                response.data;
            if (
                fieldMetadata.entry_uid === entryId &&
                fieldMetadata.content_type_uid === contentTypeId &&
                fieldMetadata.fieldPathWithIndex === fieldPath
            ) {
                setDiscussionUID(discussionUID ?? "new");
            }
        };

        const recieveDiscussionIDEvent = liveEditorPostMessage?.on(
            LiveEditorPostMessageEvents.RECEIVE_DISCUSSION_ID,
            handleReceiveDiscussionId
        );

        // Cleanup: Remove message listener when the component unmounts
        return () => {
            recieveDiscussionIDEvent?.unregister();
        };
    }, []);

    // Handles opening the comment modal with the relevant field metadata and discussion ID
    const handleCommentModal = async () => {
        liveEditorPostMessage?.send(
            LiveEditorPostMessageEvents.OPEN_FIELD_COMMENT_MODAL,
            {
                fieldMetadata,
                discussionUID,
                fieldUID: fieldSchema.uid,
                displayName: fieldSchema.display_name,
            }
        );
    };

    if (isLoading) {
        return (
            <button
                data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__comment-button-loading"
                className="visual-editor__button visual-editor__button--secondary visual-editor__button--comment-loader"
            >
                <LoadingIcon />
            </button>
        );
    }

    return (
        <button
            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__comment-button"
            className="visual-editor__button visual-editor__button--secondary"
            onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleCommentModal();
            }}
        >
            {discussionUID === "new" ? <AddCommentIcon /> : <ReadCommentIcon />}
        </button>
    );
};

export default CommentIcon;
