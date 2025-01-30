/** @jsxImportSource preact */
import React from "preact/compat";
import { useContext } from "preact/hooks";
import { IThreadPopupState, IUserDTO } from "../../../types/collab.types";
import Icon from "../Icon/Icon";
import { ThreadProvider } from "./ContextProvider";
import { collabStyles } from "../../../visualBuilder.style";
import classNames from "classnames";

interface ICommentActionBar {
    mode: "edit" | "view";
    commentUser: IUserDTO;
    currentUser: IUserDTO;
    commentUID?: string | undefined;
}

// Define the CommentActionBar component
const CommentActionBar: React.FC<ICommentActionBar> = ({
    mode,
    commentUser,
    currentUser,
    commentUID,
}) => {
    const { setThreadState, onDeleteComment, activeThread, onDeleteThread } =
        useContext(ThreadProvider)!;

    const setEditComment = (uid: string | null) => {
        setThreadState((prevState: IThreadPopupState) => ({
            ...prevState,
            editComment: uid || "",
        }));
    };

    // Handler for cancel action
    const handleCancel = () => {
        setEditComment(null);
    };

    // Handler for editing a comment
    const handleCommentEdit = () => {
        if (commentUID) {
            setEditComment(commentUID);
        }
    };

    // Handler for deleting a comment
    const handleCommentDelete = async () => {
        if (!commentUID) {
            return;
        }
        try {
            // Call the onDeleteComment function
            const deleteResponse = await onDeleteComment({
                threadUid: activeThread?._id,
                commentUid: commentUID,
            });

            // Update the thread state after successful deletion
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
        } catch (error: any) {}
    };

    // Render based on the mode and user permissions
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

    if (commentUser.identityHash !== currentUser.identityHash || !commentUID) {
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
            />
        </div>
    );
};

export default CommentActionBar;
