/** @jsxImportSource preact */
import React from "preact/compat";
import { useEffect, useState, useContext, useCallback } from "preact/hooks";
import { collabStyles } from "../../../collab.style";
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
    onClose: (isResolved?: boolean) => void;
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
    ({ userState, handleOnSaveRef, comment, onClose }) => {
        const [state, setState] = useState<ICommentState>(initialState);

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

        useEffect(() => {
            const textArea = document.getElementById(
                "collab-thread-body--input--textarea"
            );
            if (!textArea) return;

            const baseClasses = {
                focus: {
                    base: "collab-thread-body--input--textarea--focus",
                    goober: collabStyles()[
                        "collab-thread-body--input--textarea--focus"
                    ],
                },
                hover: {
                    base: "collab-thread-body--input--textarea--hover",
                    goober: collabStyles()[
                        "collab-thread-body--input--textarea--hover"
                    ],
                },
            };

            const handleFocus = () => {
                textArea.classList.add(
                    baseClasses.focus.base,
                    baseClasses.focus.goober
                );
            };

            const handleBlur = () => {
                textArea.classList.remove(
                    baseClasses.focus.base,
                    baseClasses.focus.goober
                );
            };

            const handleMouseEnter = () => {
                textArea.classList.add(
                    baseClasses.hover.base,
                    baseClasses.hover.goober
                );
            };

            const handleMouseLeave = () => {
                textArea.classList.remove(
                    baseClasses.hover.base,
                    baseClasses.hover.goober
                );
            };

            textArea.addEventListener("focus", handleFocus);
            textArea.addEventListener("blur", handleBlur);
            textArea.addEventListener("mouseenter", handleMouseEnter);
            textArea.addEventListener("mouseleave", handleMouseLeave);

            return () => {
                textArea.removeEventListener("focus", handleFocus);
                textArea.removeEventListener("blur", handleBlur);
                textArea.removeEventListener("mouseenter", handleMouseEnter);
                textArea.removeEventListener("mouseleave", handleMouseLeave);
            };
        }, []);

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
                    onClose(false);
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
                    onClose(false);
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
                        ></textarea>
                    </div>
                </div>

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
