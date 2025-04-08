/** @jsxImportSource preact */
import React from "preact/compat";
import { useEffect, useState, useMemo } from "preact/hooks";
import CommentTextArea from "./CommentTextArea";
import {
    ICommentCard,
    IMessageDTO,
    IUserDTO,
} from "../../../types/collab.types";
import { getUserName, formatDate } from "../../../utils/collabUtils";
import CommentActionBar from "./CommentActionBar";
import CommentResolvedText from "./CommentResolvedText";
import Avatar from "../Avatar/Avatar";
import ThreadBodyLoader from "./loader/ThreadBody";
import { collabStyles, flexAlignCenter } from "../../../collab.style";
import classNames from "classnames";

const formatCommentDate = (comment: IMessageDTO | null): string => {
    return comment ? formatDate(comment.updatedAt || comment.createdAt) : "";
};

const CommentCard = ({
    userState,
    comment,
    onClose,
    handleOnSaveRef,
    mode,
}: ICommentCard) => {
    const [commentUser, setCommentUser] = useState<IUserDTO | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setCommentUser(
            comment
                ? userState.userMap[comment.createdBy]
                : userState.currentUser
        );
    }, [comment, userState]);

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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={classNames(
                    "collab-thread-comment--user-details",
                    "flex-v-center",
                    collabStyles()["collab-thread-comment--user-details"],
                    flexAlignCenter
                )}
            >
                <Avatar
                    avatar={
                        {
                            name: getUserName(commentUser),
                            id: commentUser.uid,
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
                {isHovered && (
                    <CommentActionBar
                        mode={mode}
                        commentUser={commentUser}
                        currentUser={userState.currentUser}
                        commentUID={comment?._id}
                    />
                )}
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
