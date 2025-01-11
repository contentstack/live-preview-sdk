/** @jsxImportSource preact */
import React, { useEffect, useMemo, useRef, useState } from "preact/compat";
import DiscussionHeader from "./DiscussionHeader";
import DiscussionFooter from "./DiscussionFooter";
import DiscussionBody from "./DiscussionBody";
import {
    IActiveDiscussion,
    ICommentPayload,
    ICommentResponse,
    IDefaultAPIResponse,
    IDeleteCommentArgs,
    IDiscussionContext,
    IDiscussionPopupState,
    IDiscussionResponseDTO,
    IEditCommentArgs,
    IErrorState,
    IMentionList,
    IStackMetadata,
} from "../../../types/collab.types";
import { getUserName } from "../../../utils/collabUtils";
import { DiscussionProvider } from "./ContextProvider/DiscussionProvider";
import useInfiniteScroll from "../../../hooks/use-infinite-scroll/useInfiniteScroll";
import { collabStyles } from "../../../visualBuilder.style";

interface IDiscussionPopup {
    onCreateComment: (payload: ICommentPayload) => Promise<ICommentResponse>;
    onEditComment: (data: IEditCommentArgs) => Promise<ICommentResponse>;
    onDeleteComment: (data: IDeleteCommentArgs) => Promise<IDefaultAPIResponse>;
    onClose: () => void;
    onResolve: (discussion: IActiveDiscussion) => Promise<IDefaultAPIResponse>;
    stackMetadata: IStackMetadata;
    loadMoreMessages: (offset: number, limit: number) => Promise<any>;
    activeDiscussion: IActiveDiscussion;
    setActiveDiscussion: (discussion: IActiveDiscussion) => void;
    createNewDiscussion: () => Promise<IDiscussionResponseDTO>;
}

const initialErrorState: IErrorState = {
    hasError: false,
    message: "",
};

const DiscussionPopup: React.FC<IDiscussionPopup> = React.memo(
    ({
        onCreateComment,
        onEditComment,
        onDeleteComment,
        onClose,
        onResolve,
        stackMetadata,
        loadMoreMessages,
        activeDiscussion,
        setActiveDiscussion,
        createNewDiscussion,
    }) => {
        const handleOnSaveRef = useRef(null);

        const [state, setState] = useState<IDiscussionPopupState>({
            isLoading: false,
            commentCount: 0,
            comments: [],
            editComment: "",
            userState: {
                mentionsList: [],
                currentUser: stackMetadata?.currentUser,
                userMap: {},
                roleMap: {},
            },
        });

        const [error, setError] = useState<IErrorState>(initialErrorState);

        const isFetchingMore = useInfiniteScroll({
            containerId: "collab-discussion-comment--list",
            isFetching: false,
            canFetchMore: state.commentCount > state.comments.length,
            loadMore: async (offset, limit) => {
                try {
                    const res = await loadMoreMessages(offset, limit);
                    setState((prevState) => ({
                        ...prevState,
                        commentCount: res.count,
                        comments: [...prevState.comments, ...res.conversations],
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
            const roleMap: Record<string, any> = {};

            stackMetadata?.users?.forEach((user) => {
                if (user?.active) {
                    const userName = getUserName(user);
                    userList.push({
                        display: userName,
                        id: user.uid,
                        uid: user.uid,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username,
                    });
                    userMap[user.uid] = { ...user, display: userName };
                }
            });

            stackMetadata?.roles?.forEach((role) => {
                userList.push({
                    display: role.name,
                    id: role.uid,
                    uid: role.uid,
                });
                roleMap[role.uid] = role;
            });

            setState((prevState) => ({
                ...prevState,
                userState: {
                    mentionsList: userList,
                    userMap,
                    roleMap,
                    currentUser: stackMetadata?.currentUser,
                },
            }));
        }, [stackMetadata]);

        useEffect(() => {
            if (!activeDiscussion) {
                setState((prevState) => ({ ...prevState, isLoading: true }));
                return;
            }
            if (activeDiscussion?.uid == "new") {
                return;
            }
            const fetchInitialMessages = async () => {
                setState((prevState) => ({ ...prevState, isLoading: true }));
                try {
                    const res = await loadMoreMessages(0, 10);
                    setState((prevState) => ({
                        ...prevState,
                        isLoading: false,
                        commentCount: res.count,
                        comments: res.conversations,
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

        const contextValue = useMemo<IDiscussionContext>(
            () => ({
                stackMetadata,
                userState: state.userState,
                commentCount: state.commentCount,
                setDiscussionState: setState,
                error,
                setError,
                onCreateComment,
                onEditComment,
                onDeleteComment,
                onClose,
                editComment: state.editComment,
                activeDiscussion,
                setActiveDiscussion,
                createNewDiscussion,
            }),
            [
                stackMetadata,
                state.userState,
                state.commentCount,
                error,
                state.editComment,
                activeDiscussion,
            ]
        );

        return (
            <DiscussionProvider.Provider value={contextValue}>
                <div className={collabStyles()["collab-discussion--wrapper"]}>
                    <DiscussionHeader
                        onClose={onClose}
                        onResolve={onResolve}
                        displayResolve={
                            !!activeDiscussion &&
                            activeDiscussion?.uid !== "new"
                        }
                        commentCount={state.commentCount}
                        activeDiscussion={activeDiscussion}
                    />
                    <DiscussionBody
                        handleOnSaveRef={handleOnSaveRef}
                        userState={state.userState}
                        isLoading={state.isLoading}
                        comments={state.comments}
                        fetchingMore={isFetchingMore}
                        editComment={state.editComment}
                    />
                    <DiscussionFooter
                        onClose={onClose}
                        handleOnSaveRef={handleOnSaveRef}
                        isDisabled={error.hasError}
                        editComment={state.editComment}
                    />
                </div>
            </DiscussionProvider.Provider>
        );
    }
);

export default DiscussionPopup;
