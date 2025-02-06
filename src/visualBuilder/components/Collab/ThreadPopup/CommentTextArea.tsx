/** @jsxImportSource preact */
import React from "preact/compat";
import {
    useEffect,
    useState,
    useContext,
    useCallback,
    useRef,
} from "preact/hooks";
import { collabStyles } from "../../../visualBuilder.style";
import {
    ICommentPayload,
    ICommentResponse,
    ICommentState,
    IThreadPopupState,
    IThreadResponseDTO,
    IMentionItem,
    IMessageDTO,
    IUserDTO,
    IUserState,
} from "../../../types/collab.types";
import {
    validateCommentAndMentions,
    filterOutInvalidMentions,
    getMessageWithDisplayName,
    getUserName,
    getCommentBody,
} from "../../../utils/collabUtils";
import { maxMessageLength } from "../../../utils/constants";
import { ThreadProvider } from "./ContextProvider";
import useDynamicTextareaRows from "../../../hooks/useDynamicTextareaRows";
import { cloneDeep, findIndex } from "lodash-es";
import classNames from "classnames";

interface ICommentTextArea {
    userState: IUserState;
    handleOnSaveRef: React.MutableRefObject<any>;
    comment?: IMessageDTO | null;
}

const initialState: ICommentState = {
    message: "",
    toUsers: [],
    images: [],
    createdBy: "",
    author: "",
};

const CommentTextArea: React.FC<ICommentTextArea> = React.memo(
    ({ userState, handleOnSaveRef, comment }) => {
        const [state, setState] = useState<ICommentState>(initialState);
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [cursorPosition, setCursorPosition] = useState(0);
        const [searchTerm, setSearchTerm] = useState("");
        const inputRef = useRef(null);

        const {
            error,
            setError,
            onCreateComment,
            onEditComment,
            editComment,
            setThreadState,
            activeThread,
            setActiveThread,
            createNewThread,
        } = useContext(ThreadProvider)!;

        useDynamicTextareaRows(
            ".collab-thread-body--input--textarea",
            state.message
        );

        // Find the @ symbol position and extract search term
        const findMentionSearchPosition = (text: string, cursorPos: any) => {
            const textBeforeCursor = text.slice(0, cursorPos);
            const atSymbolIndex = textBeforeCursor.lastIndexOf("@");

            if (atSymbolIndex === -1) return null;

            const textBetweenAtAndCursor = textBeforeCursor.slice(
                atSymbolIndex + 1
            );
            if (textBetweenAtAndCursor.includes(" ")) return null;

            return {
                start: atSymbolIndex,
                searchTerm: textBetweenAtAndCursor,
            };
        };

        // Filter users based on search term
        const filteredUsers = userState.mentionsList.filter((user) => {
            if (!searchTerm) return false;
            return (
                user.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        const insertMention = (user: any) => {
            const mention = findMentionSearchPosition(
                state.message,
                cursorPosition
            );
            if (!mention) return;

            const beforeMention = state.message.slice(0, mention.start);
            const afterMention = state.message.slice(cursorPosition);
            const newValue = `${beforeMention}@${user.email} ${afterMention}`;

            setState((prevState) => ({
                ...prevState,
                message: newValue,
                toUsers: [
                    ...(prevState.toUsers || []),
                    { display: user.email, id: user.identityHash },
                ],
            }));
            setShowSuggestions(false);

            // Focus back on input after selection
            const ele = inputRef.current as HTMLTextAreaElement | null;
            if (ele) {
                ele.focus();
            }
        };

        const handleSubmit = useCallback(async () => {
            // If there's a validation error, don't proceed with saving.
            if (error.hasError) return;

            try {
                let threadUID: string = activeThread?._id;
                if (activeThread?._id == "new") {
                    let currentThread: IThreadResponseDTO =
                        await createNewThread();
                    threadUID = currentThread?.thread?._id;
                    setActiveThread(currentThread?.thread);
                }
                // Prepare the comment data by constructing the body with mentions replaced by UIDs.
                setState((prevState) => ({
                    ...prevState,
                    createdBy: userState.currentUser.identityHash,
                }));

                const commentPayload = {
                    ...getCommentBody({
                        ...state,
                        createdBy: userState.currentUser.identityHash,
                        author: userState.currentUser.email,
                    }),
                };

                const commentData: ICommentPayload = {
                    threadUid: threadUID,
                    commentPayload,
                };

                if (editComment) {
                    // If editing an existing comment, call the edit function and update the state accordingly.
                    let commentResponse: ICommentResponse = await onEditComment(
                        {
                            threadUid: threadUID,
                            commentUid: editComment,
                            payload: commentPayload,
                        }
                    );
                    setThreadState((prevState: IThreadPopupState) => {
                        const updatedComments = cloneDeep(prevState.comments);
                        const commentIndex = findIndex(
                            updatedComments,
                            (c) => c._id === comment?._id
                        );

                        // Replace the existing comment with the updated one in the comments array.
                        updatedComments.splice(
                            commentIndex,
                            1,
                            commentResponse?.comment
                        );

                        return {
                            ...prevState,
                            editComment: "", // Clear the edit mode
                            comments: updatedComments, // Update the comments list in the state
                        };
                    });
                } else {
                    // If creating a new comment, call the create function and add the new comment to the state.
                    let commentResponse: ICommentResponse =
                        await onCreateComment(commentData);
                    setThreadState((prevState: IThreadPopupState) => ({
                        ...prevState,
                        comments: [
                            commentResponse.comment,
                            ...prevState.comments,
                        ], // Prepend the new comment
                        commentCount: prevState.commentCount + 1, // Increment the comment count
                    }));
                    // Reset the state to its initial form after a successful comment creation.
                    setState(initialState);
                }
            } catch (error: any) {}
        }, [error.hasError, state, activeThread]);

        useEffect(() => {
            if (state.message.length === 0) {
                setError({ hasError: true, message: "" });
            }
            handleOnSaveRef.current = handleSubmit;
        }, [state, activeThread]);

        useEffect(() => {
            const toUsers: Array<IMentionItem> = [];

            comment?.toUsers?.forEach((userId) => {
                const user: IUserDTO = userState.userMap[userId];
                toUsers.push({
                    display: `@${user.display || getUserName(user)}`,
                    id: userId,
                });
            });

            setState({
                message:
                    getMessageWithDisplayName(comment, userState, "text") ?? "",
                toUsers,
                images: comment?.images ?? [],
                createdBy: comment?.createdBy ?? "",
                author: comment?.author ?? "",
            });
        }, [comment]);

        const handleInputChange = (
            event: React.ChangeEvent<HTMLTextAreaElement>
        ) => {
            const target = event.target as HTMLTextAreaElement | null;
            if (!target) return;
            const newPlainTextValue = target.value;
            const newPosition = target.selectionStart;
            setCursorPosition(newPosition);

            const mention = findMentionSearchPosition(
                newPlainTextValue,
                newPosition
            );
            if (mention) {
                setSearchTerm(mention.searchTerm);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
            const trimmedValue = newPlainTextValue.trim();

            // TODO mentions will be handled in upcoming PRs this is a zombie code for now
            // const to_users = [...state.to_users];
            // mentions.forEach((mention) => {
            //     if (userState.userMap[mention.id]) {
            //         to_users.push({
            //             id: mention.id,
            //             display: mention.display,
            //         });
            //     }
            // });

            // const updatedMentions = filterOutInvalidMentions(
            //     newPlainTextValue,
            //     to_users
            // );

            // Perform your custom logic here
            const errorMessage = validateCommentAndMentions(
                newPlainTextValue,
                state.toUsers ?? []
            );
            setError({
                hasError: errorMessage !== "" || trimmedValue === "",
                message: errorMessage,
            });

            setState((prevState) => ({
                ...prevState,
                message: newPlainTextValue,
            }));
        };

        return (
            <div
                className={classNames(
                    "collab-thread-body--input--wrapper",
                    collabStyles()["collab-thread-body--input--wrapper"]
                )}
            >
                <div
                    className={classNames(
                        "collab-thread-body--input",
                        collabStyles()["collab-thread-body--input"]
                    )}
                >
                    <div
                        className={classNames(
                            "collab-thread-body--input--textarea--wrapper",
                            collabStyles()[
                                "collab-thread-body--input--textarea--wrapper"
                            ]
                        )}
                    >
                        <textarea
                            name="collab-thread-body--input--textarea"
                            id="collab-thread-body--input--textarea"
                            rows={1}
                            className={classNames(
                                "collab-thread-body--input--textarea",
                                collabStyles()[
                                    "collab-thread-body--input--textarea"
                                ]
                            )}
                            value={state.message}
                            onChange={handleInputChange}
                            maxLength={maxMessageLength}
                            placeholder="Enter a comment"
                            ref={inputRef}
                        ></textarea>
                    </div>
                </div>

                {showSuggestions && filteredUsers.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredUsers.map((user) => (
                            <button
                                key={user.email}
                                onClick={() => insertMention(user)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                            >
                                <div className="font-medium">
                                    @{user.display}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <div
                    className={classNames(
                        "collab-thread-input-indicator--wrapper",
                        "flex-v-center",
                        collabStyles()[
                            "collab-thread-input-indicator--wrapper"
                        ],
                        collabStyles()["flex-v-center"]
                    )}
                >
                    <div
                        className={classNames(
                            "collab-thread-input-indicator--error",
                            collabStyles()[
                                "collab-thread-input-indicator--error"
                            ]
                        )}
                    >
                        {error.message}
                    </div>
                    <div
                        className={classNames(
                            "collab-thread-input-indicator--count",
                            collabStyles()[
                                "collab-thread-input-indicator--count"
                            ]
                        )}
                    >
                        {state.message.length}/{maxMessageLength}
                    </div>
                </div>
            </div>
        );
    }
);

export default CommentTextArea;
