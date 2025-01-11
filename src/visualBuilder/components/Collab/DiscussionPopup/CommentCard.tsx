/** @jsxImportSource preact */
import React, { useEffect, useState, useMemo } from "preact/compat";
import CommentTextArea from "./CommentTextArea";
import { IUserState, IMessageDTO, IUserDTO } from "../../../types/collab.types";
import moment from "moment";
import { getUserName } from "../../../utils/collabUtils";
import CommentActionBar from "./CommentActionBar";
import CommentResolvedText from "./CommentResolvedText";
import Avatar from "../Avatar/Avatar";
import DiscussionBodyLoader from "./loader/DiscussionBody";
import { collabStyles } from "../../../visualBuilder.style";
import classNames from "classnames";
interface ICommentCard {
    comment: IMessageDTO | null;
    userState: IUserState;
    mode: "edit" | "view";
    handleOnSaveRef: React.MutableRefObject<any>;
}

const formatCommentDate = (comment: IMessageDTO | null): string => {
    return comment
        ? moment(comment.created_at).format("MMM DD, YYYY, hh:mm A")
        : "";
};

const CommentCard = ({
    userState,
    comment,
    handleOnSaveRef,
    mode,
}: ICommentCard) => {
    const [commentUser, setCommentUser] = useState<IUserDTO | null>(null);

    useEffect(() => {
        if (comment) {
            setCommentUser(userState.userMap[comment.created_by]);
        } else {
            setCommentUser(userState.currentUser);
        }
    }, [comment, userState]);

    // Memoize formattedDate to avoid recalculating on every render
    const formattedDate = useMemo(() => formatCommentDate(comment), [comment]);

    if (!commentUser) {
        return (
            <DiscussionBodyLoader key="collab-discussion-body--comment-loader" />
        );
    }

    return (
        <div className={collabStyles()["collab-discussion-comment--wrapper"]}>
            <div
                className={classNames(
                    collabStyles()["collab-discussion-comment--user-details"],
                    collabStyles()["flex-v-center"]
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
                    className={
                        collabStyles()[
                            "collab-discussion-comment--user-details__text"
                        ]
                    }
                >
                    <div
                        className={
                            collabStyles()[
                                "collab-discussion-comment--user-name"
                            ]
                        }
                    >
                        {getUserName(commentUser)}
                    </div>
                    {comment && (
                        <div
                            className={
                                collabStyles()[
                                    "collab-discussion-comment--time-details"
                                ]
                            }
                        >
                            {formattedDate}
                        </div>
                    )}
                </div>
                <CommentActionBar
                    mode={mode}
                    commentUser={commentUser}
                    currentUser={userState.currentUser}
                    commentUID={comment?.uid}
                />
            </div>
            {mode === "edit" ? (
                <CommentTextArea
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
