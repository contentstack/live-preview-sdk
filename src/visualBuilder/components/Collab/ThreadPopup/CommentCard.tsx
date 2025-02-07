/** @jsxImportSource preact */
import React from "preact/compat";
import { useEffect, useState, useMemo } from "preact/hooks";
import CommentTextArea from "./CommentTextArea";
import { IUserState, IMessageDTO, IUserDTO } from "../../../types/collab.types";
import moment from "moment";
import { getUserName } from "../../../utils/collabUtils";
import CommentActionBar from "./CommentActionBar";
import CommentResolvedText from "./CommentResolvedText";
import Avatar from "../Avatar/Avatar";
import ThreadBodyLoader from "./loader/ThreadBody";
import { collabStyles } from "../../../collab.style";
import classNames from "classnames";

interface ICommentCard {
    comment: IMessageDTO | null;
    onClose: (isResolved?: boolean) => void;
    userState: IUserState;
    mode: "edit" | "view";
    handleOnSaveRef: React.MutableRefObject<any>;
}

const formatCommentDate = (comment: IMessageDTO | null): string => {
    return comment
        ? moment(comment.createdAt).format("MMM DD, YYYY, hh:mm A")
        : "";
};

const CommentCard = ({
    userState,
    comment,
    onClose,
    handleOnSaveRef,
    mode,
}: ICommentCard) => {
    const [commentUser, setCommentUser] = useState<IUserDTO | null>(null);

    useEffect(() => {
        if (comment) {
            setCommentUser(userState.userMap[comment.createdBy]);
        } else {
            setCommentUser(userState.currentUser);
        }
    }, [comment, userState]);

    // Memoize formattedDate to avoid recalculating on every render
    const formattedDate = useMemo(() => formatCommentDate(comment), [comment]);

    if (!commentUser) {
        return <ThreadBodyLoader key="collab-thread-body--comment-loader" />;
    }

    return (
        <div
            className={classNames(
                "collab-thread-comment--wrapper",
                collabStyles()["collab-thread-comment--wrapper"]
            )}
        >
            <div
                className={classNames(
                    "collab-thread-comment--user-details",
                    "flex-v-center",
                    collabStyles()["collab-thread-comment--user-details"],
                    collabStyles()["flex-v-center"]
                )}
            >
                <Avatar
                    avatar={
                        {
                            name: getUserName(commentUser),
                            id: commentUser.identityHash,
                        } as any
                    }
                />
                <div
                    className={classNames(
                        "collab-thread-comment--user-details__text",
                        collabStyles()[
                            "collab-thread-comment--user-details__text"
                        ]
                    )}
                >
                    <div
                        className={classNames(
                            "collab-thread-comment--user-name",
                            collabStyles()["collab-thread-comment--user-name"]
                        )}
                    >
                        {getUserName(commentUser)}
                    </div>
                    {comment && (
                        <div
                            className={classNames(
                                "collab-thread-comment--time-details",
                                collabStyles()[
                                    "collab-thread-comment--time-details"
                                ]
                            )}
                        >
                            {formattedDate}
                        </div>
                    )}
                </div>
                <CommentActionBar
                    mode={mode}
                    commentUser={commentUser}
                    currentUser={userState.currentUser}
                    commentUID={comment?._id}
                />
            </div>
            {mode === "edit" ? (
                <CommentTextArea
                    onClose={onClose}
                    userState={userState}
                    handleOnSaveRef={handleOnSaveRef}
                    comment={comment}
                />
            ) : (
                comment && (
                    <CommentResolvedText
                        comment={comment}
                        userState={userState}
                    />
                )
            )}
        </div>
    );
};

export default CommentCard;
