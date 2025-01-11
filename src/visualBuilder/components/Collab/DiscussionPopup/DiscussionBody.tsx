/** @jsxImportSource preact */
import React from "preact/compat";
import { IMessageDTO, IUserState } from "../../../types/collab.types";
import DiscussionBodyLoader from "./loader/DiscussionBody";
import CommentCard from "./CommentCard";
import classNames from "classnames";
import { collabStyles } from "../../../visualBuilder.style";

interface IDiscussionBody {
    handleOnSaveRef: React.MutableRefObject<any>;
    userState: IUserState;
    isLoading: boolean;
    comments: IMessageDTO[];
    fetchingMore: boolean;
    editComment: string;
}

const DiscussionBody: React.FC<IDiscussionBody> = React.memo(
    ({
        handleOnSaveRef,
        userState,
        isLoading,
        comments,
        fetchingMore,
        editComment,
    }) => {
        return (
            <div className={collabStyles()["collab-discussion-body--wrapper"]}>
                {isLoading ? (
                    <DiscussionBodyLoader key="collab-discussion-body--comment-loader" />
                ) : (
                    <div
                        className={
                            collabStyles()["collab-discussion-comment--list"]
                        }
                        id="collab-discussion-comment--list"
                    >
                        {comments?.map((comment: IMessageDTO) => (
                            <>
                                <div
                                    className={classNames(
                                        collabStyles()[
                                            "collab-comment-seperator"
                                        ],
                                        collabStyles()["flex-v-center"]
                                    )}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="100%"
                                        height="2"
                                        viewBox="0 0 332 2"
                                        fill="none"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M0 1H332"
                                            stroke="#DDE3EE"
                                            strokeDasharray="2 2"
                                        />
                                    </svg>
                                </div>
                                <CommentCard
                                    userState={userState}
                                    comment={comment}
                                    handleOnSaveRef={handleOnSaveRef}
                                    mode={
                                        editComment === comment.uid
                                            ? "edit"
                                            : "view"
                                    }
                                />
                            </>
                        ))}
                        {fetchingMore && <DiscussionBodyLoader />}
                    </div>
                )}

                {editComment === "" && (
                    <CommentCard
                        userState={userState}
                        comment={null}
                        handleOnSaveRef={handleOnSaveRef}
                        mode="edit"
                    />
                )}
            </div>
        );
    }
);

export default DiscussionBody;
