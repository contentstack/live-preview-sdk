/** @jsxImportSource preact */
import React from "preact/compat";
import { IMessageDTO, IUserState } from "../../../types/collab.types";
import ThreadBodyLoader from "./loader/ThreadBody";
import CommentCard from "./CommentCard";
import classNames from "classnames";
import { collabStyles, flexAlignCenter } from "../../../collab.style";
import { IThreadBody } from "../../../types/collab.types";

const Loader: React.FC<{ isLoading: boolean }> = ({ isLoading, children }) => {
    return isLoading ? (
        <ThreadBodyLoader key="collab-thread-body--comment-loader" />
    ) : (
        <>{children}</>
    );
};

const CommentList: React.FC<{
    comments: IMessageDTO[];
    userState: IUserState;
    onClose: (isResolved?: boolean) => void;
    handleOnSaveRef: React.MutableRefObject<any>;
    editComment: string;
    fetchingMore: boolean;
}> = ({
    comments,
    userState,
    onClose,
    handleOnSaveRef,
    editComment,
    fetchingMore,
}) => {
    return (
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
                            collabStyles()["collab-thread-comment-seperator"],
                            flexAlignCenter
                        )}
                    >
                        <svg
                            class="collab-thread-comment-seperator--svg"
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
                        onClose={onClose}
                        handleOnSaveRef={handleOnSaveRef}
                        mode={editComment === comment._id ? "edit" : "view"}
                    />
                </>
            ))}
            {fetchingMore && <ThreadBodyLoader />}
        </div>
    );
};

const ThreadBody: React.FC<IThreadBody> = React.memo(
    ({
        handleOnSaveRef,
        onClose,
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
                <Loader isLoading={isLoading}>
                    <CommentList
                        comments={comments}
                        userState={userState}
                        onClose={onClose}
                        handleOnSaveRef={handleOnSaveRef}
                        editComment={editComment}
                        fetchingMore={fetchingMore}
                    />
                </Loader>

                {editComment === "" && (
                    <CommentCard
                        userState={userState}
                        comment={null}
                        onClose={onClose}
                        handleOnSaveRef={handleOnSaveRef}
                        mode="edit"
                    />
                )}
            </div>
        );
    }
);

export default ThreadBody;
