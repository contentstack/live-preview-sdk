import React, { useEffect, useState } from "preact/compat";
import { CslpData } from "../../cslp/types/cslp.types";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";
import { AddCommentIcon, ReadCommentIcon } from "./icons";
import { getDiscussionIdByFieldMetaData } from "../utils/getDiscussionIdByFieldMetaData";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { LoadingIcon } from "./icons/loading";
import classNames from "classnames";
import { liveEditorStyles } from "../liveEditor.style";

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

export default function CommentIcon(props: CommentIconProps) {
    const { fieldMetadata, fieldSchema } = props;
    const [discussionUID, setDiscussionUID] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Fetch discussion ID based on field metadata
    useEffect(() => {
        const fetchDiscussionId = async () => {
            try {
                setIsLoading(true);
                const discussionUID = await getDiscussionIdByFieldMetaData({
                    fieldMetadata,
                    fieldSchema
                });
                setDiscussionUID(discussionUID);
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
            LiveEditorPostMessageEvents.UPDATE_DISCUSSION_ID,
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
                fieldSchema,
            }
        );
    };

    if (isLoading) {
        return (
            <button
                data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__comment-button-loading"
                className={classNames(
                   "visual-builder__button visual-builder__button--secondary visual-builder__button--comment-loader",
                    liveEditorStyles()["visual-builder__button"],
                    liveEditorStyles()["visual-builder__button--secondary"],
                    liveEditorStyles()["visual-builder__button--comment-loader"]
                )}

            >
                <LoadingIcon />
            </button>
        );
    }

    if(!discussionUID){
        return
    }

    return (
        <button
            data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__comment-button"
            className={classNames(
                "visual-builder__button visual-builder__button--secondary",
                 liveEditorStyles()["visual-builder__button"],
                 liveEditorStyles()["visual-builder__button--secondary"],
             )}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCommentModal();
            }}
        >
            {discussionUID === "new" ? <AddCommentIcon /> : <ReadCommentIcon />}
        </button>
    );
};
