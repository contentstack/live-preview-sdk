/** @jsxImportSource preact */
import React from "preact/compat";
import { IMessageDTO, IUserState } from "../../../types/collab.types";
import ThreadBodyLoader from "./loader/ThreadBody";
import CommentCard from "./CommentCard";
import classNames from "classnames";
import { collabStyles } from "../../../visualBuilder.style";

interface IThreadBody {
    handleOnSaveRef: React.MutableRefObject<any>;
    userState: IUserState;
    isLoading: boolean;
    comments: IMessageDTO[];
    fetchingMore: boolean;
    editComment: string;
}

const ThreadBody: React.FC<IThreadBody> = React.memo(
    ({
        handleOnSaveRef,
        userState,
        isLoading,
        comments,
        fetchingMore,
        editComment,
    }) => {
        return (
            <div
                className={classNames(
                    "collab-thread-body--wrapper",
                    collabStyles()["collab-thread-body--wrapper"]
                )}
            >
                {isLoading ? (
                    <ThreadBodyLoader key="collab-thread-body--comment-loader" />
                ) : (
                    <div
                        className={classNames(
                            "collab-thread-comment--list",
                            collabStyles()["collab-thread-comment--list"]
                        )}
                        id="collab-thread-comment--list"
                    >
                        {comments?.map((comment: IMessageDTO) => (
                            <>
                                <div
                                    className={classNames(
                                        "collab-thread-comment-seperator",
                                        "flex-v-center",
                                        collabStyles()[
                                            "collab-thread-comment-seperator"
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
                                        editComment === comment._id
                                            ? "edit"
                                            : "view"
                                    }
                                />
                            </>
                        ))}
                        {fetchingMore && <ThreadBodyLoader />}
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

export default ThreadBody;
