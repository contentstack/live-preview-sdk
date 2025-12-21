/** @jsxImportSource preact */
import React from "preact/compat";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import ThreadHeader from "./ThreadHeader";
import ThreadFooter from "./ThreadFooter";
import ThreadBody from "./ThreadBody";
import {
    IThreadPopup,
    IThreadContext,
    IThreadPopupState,
    IErrorState,
    IMentionList,
    IFetchComments,
} from "../../../types/collab.types";
import { getUserName } from "../../../utils/collabUtils";
import { ThreadProvider } from "./ContextProvider/ThreadProvider";
import useInfiniteScroll from "../../../hooks/use-infinite-scroll/useInfiniteScroll";
import { collabStyles } from "../../../collab.style";
import classNames from "classnames";

const initialErrorState: IErrorState = {
    hasError: false,
    message: "",
};

const ThreadPopup: React.FC<IThreadPopup> = React.memo(
    ({
        onCreateComment,
        onEditComment,
        onDeleteComment,
        onDeleteThread,
        onClose,
        onResolve,
        inviteMetadata,
        loadMoreMessages,
        activeThread,
        setActiveThread,
        createNewThread,
    }) => {
        const handleOnSaveRef = useRef(null);

        const [state, setState] = useState<IThreadPopupState>({
            isLoading: false,
            commentCount: 0,
            comments: [],
            editComment: "",
            userState: {
                mentionsList: [],
                currentUser: inviteMetadata?.currentUser,
                userMap: {},
            },
        });

        const [error, setError] = useState<IErrorState>(initialErrorState);

        const isFetchingMore = useInfiniteScroll({
            containerId: "collab-thread-comment--list",
            isFetching: false,
            canFetchMore: state.commentCount > state.comments.length,
            loadMore: async (offset, limit) => {
                try {
                    let payload: IFetchComments = {
                        offset: offset,
                        limit: limit,
                        threadUid: activeThread?._id,
                    };
                    const res = await loadMoreMessages(payload);
                    setState((prevState) => ({
                        ...prevState,
                        commentCount: res.count,
                        comments: [...prevState.comments, ...res.comments],
                    }));
                } catch (error) {
                    console.error(error);
                }
            },
            offset: state.comments.length,
            limit: 10,
        });

        useEffect(() => {
            const userList: Array<IMentionList> = [];
            const userMap: Record<string, any> = {};

            inviteMetadata?.users?.forEach((user) => {
                if (user) {
                    const userName = getUserName(user);
                    userList.push({
                        display: userName,
                        email: user.email,
                        uid: user.uid,
                    });
                    userMap[user.uid] = { ...user, display: userName };
                }
            });

            setState((prevState) => ({
                ...prevState,
                userState: {
                    mentionsList: userList,
                    userMap,
                    currentUser: inviteMetadata?.currentUser,
                },
            }));
        }, [inviteMetadata]);

        useEffect(() => {
            if (!activeThread) {
                setState((prevState) => ({ ...prevState, isLoading: true }));
                return;
            }
            if (activeThread?._id == "new") {
                return;
            }
            const fetchInitialMessages = async () => {
                setState((prevState) => ({ ...prevState, isLoading: true }));
                try {
                    let payload: IFetchComments = {
                        offset: 0,
                        limit: 10,
                        threadUid: activeThread?._id,
                    };
                    const res = await loadMoreMessages(payload);
                    setState((prevState) => ({
                        ...prevState,
                        isLoading: false,
                        commentCount: res.count,
                        comments: res.comments,
                    }));
                } catch (error) {
                    setState((prevState) => ({
                        ...prevState,
                        isLoading: false,
                    }));
                    console.error(error);
                }
            };
            fetchInitialMessages();
        }, []);

        const contextValue = useMemo<IThreadContext>(
            () => ({
                inviteMetadata,
                userState: state.userState,
                commentCount: state.commentCount,
                setThreadState: setState,
                error,
                setError,
                onCreateComment,
                onEditComment,
                onDeleteComment,
                onDeleteThread,
                onClose,
                editComment: state.editComment,
                activeThread,
                setActiveThread,
                createNewThread,
            }),
            [
                inviteMetadata,
                state.userState,
                state.commentCount,
                error,
                state.editComment,
                activeThread,
            ]
        );

        return (
            <ThreadProvider.Provider value={contextValue}>
                <div
                    className={classNames(
                        "collab-thread--wrapper",
                        collabStyles()["collab-thread--wrapper"]
                    )}
                >
                    <ThreadHeader
                        onClose={onClose}
                        onResolve={onResolve}
                        displayResolve={
                            !!activeThread && activeThread?._id !== "new"
                        }
                        commentCount={state.commentCount}
                        activeThread={activeThread}
                    />
                    <div
                        class={classNames(
                            "collab-thread--container",
                            collabStyles()["collab-thread--container"]
                        )}
                    >
                        <ThreadBody
                            handleOnSaveRef={handleOnSaveRef}
                            onClose={onClose}
                            userState={state.userState}
                            isLoading={state.isLoading}
                            comments={state.comments}
                            fetchingMore={isFetchingMore}
                            editComment={state.editComment}
                        />
                        <ThreadFooter
                            onClose={onClose}
                            handleOnSaveRef={handleOnSaveRef}
                            isDisabled={error.hasError}
                            editComment={state.editComment}
                        />
                    </div>
                </div>
            </ThreadProvider.Provider>
        );
    }
);

export default ThreadPopup;
