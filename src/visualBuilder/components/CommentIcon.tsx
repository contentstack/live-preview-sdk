import React, { useEffect, useState } from "preact/compat";
import { CslpData } from "../../cslp/types/cslp.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { AddCommentIcon, ReadCommentIcon } from "./icons";
import { getDiscussionIdByFieldMetaData } from "../utils/getDiscussionIdByFieldMetaData";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { LoadingIcon } from "./icons/loading";
import classNames from "classnames";
import { visualBuilderStyles } from "../visualBuilder.style";

interface CommentIconProps {
    fieldMetadata: CslpData;
    fieldSchema: ISchemaFieldMap;
}

interface RecieveDiscussionEventData {
    data: {
        discussion: IActiveDiscussion;
        fieldUID: string;
        fieldPath: string;
        contentTypeId: string;
        entryId: string;
    };
}

interface Field {
    uid: string;
    path: string;
    og_path: string;
}

export interface IActiveDiscussion {
  uid: string;
  title?: string;
  field?: Field;
}


export default function CommentIcon(props: CommentIconProps) {
    const { fieldMetadata, fieldSchema } = props;
    const [activeDiscussion, setActiveDiscussion] = useState<IActiveDiscussion | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Fetch discussion data based on field metadata
    useEffect(() => {
        const fetchDiscussionId = async () => {
            try {
                setIsLoading(true);
                const discussion = await getDiscussionIdByFieldMetaData({
                    fieldMetadata,
                    fieldSchema,
                });
                setActiveDiscussion(discussion);
            } catch (error) {
                console.error("Failed to fetch discussion ID:", error);
                setActiveDiscussion({uid:"new"});
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
            const { entryId, discussion, contentTypeId, fieldPath } =
                response.data;
            if (
                fieldMetadata.entry_uid === entryId &&
                fieldMetadata.content_type_uid === contentTypeId &&
                fieldMetadata.fieldPathWithIndex === fieldPath
            ) {
                setActiveDiscussion(discussion ?? {uid:"new"})
            }
        };

        const recieveDiscussionIDEvent = visualBuilderPostMessage?.on(
            VisualBuilderPostMessageEvents.UPDATE_DISCUSSION_ID,
            handleReceiveDiscussionId
        );

        // Cleanup: Remove message listener when the component unmounts
        return () => {
            recieveDiscussionIDEvent?.unregister();
        };
    }, []);

    // Handles opening the comment modal with the relevant field metadata and discussion data
    const handleCommentModal = async () => {
        visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.OPEN_FIELD_COMMENT_MODAL,
            {
                fieldMetadata,
                discussion:activeDiscussion,
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
                    visualBuilderStyles()["visual-builder__button"],
                    visualBuilderStyles()["visual-builder__button--secondary"],
                    visualBuilderStyles()[
                        "visual-builder__button--comment-loader"
                    ]
                )}
            >
                <LoadingIcon />
            </button>
        );
    }

    if (!activeDiscussion?.uid) {
        return;
    }

    return (
        <button
            data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__comment-button"
            className={classNames(
                "visual-builder__button visual-builder__button--secondary",
                visualBuilderStyles()["visual-builder__button"],
                visualBuilderStyles()["visual-builder__button--secondary"]
            )}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCommentModal();
            }}
        >
            {activeDiscussion?.uid === "new" ? <AddCommentIcon /> : <ReadCommentIcon />}
        </button>
    );
}
