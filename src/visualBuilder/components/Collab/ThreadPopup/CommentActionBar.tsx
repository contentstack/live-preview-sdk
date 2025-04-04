/** @jsxImportSource preact */
import React from "preact/compat";
import { useContext, useState } from "preact/hooks";
import {
    IThreadPopupState,
    ICommentActionBar,
} from "../../../types/collab.types";
import Icon from "../Icon/Icon";
import { ThreadProvider } from "./ContextProvider";
import { collabStyles } from "../../../collab.style";
import classNames from "classnames";

const CommentActionBar: React.FC<ICommentActionBar> = ({
    mode,
    commentUser,
    currentUser,
    commentUID,
}) => {
    const { setThreadState, onDeleteComment, activeThread, onDeleteThread } =
        useContext(ThreadProvider)!;
    const [isDeleting, setIsDeleting] = useState(false);

    const setEditComment = (uid: string | null) => {
        setThreadState((prevState: IThreadPopupState) => ({
            ...prevState,
            editComment: uid || "",
        }));
    };

    const handleCancel = () => {
        setEditComment(null);
    };

    const handleCommentEdit = () => {
        if (commentUID) {
            setEditComment(commentUID);
        }
    };

    const handleCommentDelete = async () => {
        if (!commentUID || isDeleting) {
            return;
        }

        setIsDeleting(true);

        try {
            const deleteResponse = await onDeleteComment({
                threadUid: activeThread?._id,
                commentUid: commentUID,
            });

            setThreadState((prevState: IThreadPopupState) => {
                const updatedComments = prevState.comments.filter(
                    (comment) => comment._id !== commentUID
                );
                if (prevState.commentCount - 1 === 0) {
                    onDeleteThread({ threadUid: activeThread?._id });
                }
                return {
                    ...prevState,
                    comments: updatedComments,
                    commentCount: prevState.commentCount - 1,
                };
            });
        } catch (error: any) {
        } finally {
            setIsDeleting(false);
        }
    };

    if (mode === "edit" && commentUID) {
        return (
            <div
                className={classNames(
                    "collab-thread-comment-action--wrapper",
                    collabStyles()["collab-thread-comment-action--wrapper"]
                )}
            >
                <Icon
                    icon="Cancel"
                    withTooltip
                    tooltipContent="Cancel"
                    onClick={handleCancel}
                />
            </div>
        );
    }

    if (commentUser?.uid !== currentUser?.uid || !commentUID) {
        return null;
    }

    return (
        <div
            className={classNames(
                "collab-thread-comment-action--wrapper",
                collabStyles()["collab-thread-comment-action--wrapper"]
            )}
            data-testid="collab-thread-comment-action--wrapper"
        >
            <Icon
                icon="Edit"
                tooltipContent="Edit"
                withTooltip
                testId="collab-thread-comment-edit"
                onClick={handleCommentEdit}
            />
            <Icon
                icon="Delete"
                tooltipContent="Delete"
                withTooltip
                testId="collab-thread-comment-delete"
                onClick={handleCommentDelete}
                disabled={isDeleting}
            />
        </div>
    );
};

export default CommentActionBar;
