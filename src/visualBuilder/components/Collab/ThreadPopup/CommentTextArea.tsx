/** @jsxImportSource preact */
import React, {
    useEffect,
    useState,
    useContext,
    useCallback,
    useRef,
} from "preact/compat";
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
};

const CommentTextArea: React.FC<ICommentTextArea> = React.memo(
    ({ userState, handleOnSaveRef, comment }) => {
        const [state, setState] = useState<ICommentState>(initialState);
        const mentionsInputRef = useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
            const textarea = mentionsInputRef.current;

            if (!textarea) return;

            // Ensure the element has the target class before applying event listeners
            if (!textarea.classList.contains("collab")) {
                return;
            }

            const handleFocus = () =>
                textarea.classList.add(
                    "collab-thread-body--mention__input__focus",
                    collabStyles()["collab-thread-body--mention__input__focus"]
                );
            const handleBlur = () =>
                textarea.classList.remove(
                    "collab-thread-body--mention__input__focus",
                    collabStyles()["collab-thread-body--mention__input__focus"]
                );
            const handleMouseEnter = () =>
                textarea.classList.add(
                    "collab-thread-body--mention__input__hover",
                    collabStyles()["collab-thread-body--mention__input__hover"]
                );
            const handleMouseLeave = () =>
                textarea.classList.remove(
                    "collab-thread-body--mention__input__hover",
                    collabStyles()["collab-thread-body--mention__input__hover"]
                );

            // Attach event listeners
            textarea.addEventListener("focus", handleFocus);
            textarea.addEventListener("blur", handleBlur);
            textarea.addEventListener("mouseenter", handleMouseEnter);
            textarea.addEventListener("mouseleave", handleMouseLeave);

            // Cleanup on component unmount or dependency change
            return () => {
                textarea.removeEventListener("focus", handleFocus);
                textarea.removeEventListener("blur", handleBlur);
                textarea.removeEventListener("mouseenter", handleMouseEnter);
                textarea.removeEventListener("mouseleave", handleMouseLeave);
            };
        }, [mentionsInputRef]);

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

        useDynamicTextareaRows(mentionsInputRef, state.message);

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
                const commentData: ICommentPayload = {
                    ...getCommentBody(state),
                    threadUid: threadUID,
                };

                if (editComment) {
                    // If editing an existing comment, call the edit function and update the state accordingly.
                    let commentResponse: ICommentResponse = await onEditComment(
                        {
                            commentUID: editComment,
                            payload: commentData,
                        }
                    );
                    // successNotification(commentResponse?.notice);
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
                    // successNotification(commentResponse.notice);
                    setThreadState((prevState: IThreadPopupState) => ({
                        ...prevState,
                        comments: [
                            ...prevState.comments,
                            commentResponse.comment,
                        ], // Prepend the new comment
                        commentCount: prevState.commentCount + 1, // Increment the comment count
                    }));
                    // Reset the state to its initial form after a successful comment creation.
                    setState(initialState);
                }
            } catch (error: any) {
                // If an error occurs, display a failure notification with the error details.
                // failureNotification(
                //     error?.data?.error_message || "An error occurred.",
                //     error?.data?.errors
                // );
            }
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
            });
        }, [comment]);

        const handleInputChange = (
            event: React.ChangeEvent<HTMLTextAreaElement>
        ) => {
            const target = event.target as HTMLTextAreaElement | null;
            if (!target) return;
            const newPlainTextValue = target.value;

            // const to_users = [...state.to_users];
            // // TODO need to find the logic of mentions here as not using react mentions
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
                hasError: errorMessage !== "",
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
                    "collab-thread-body--input",
                    collabStyles()["collab-thread-body--input"]
                )}
            >
                <div style={{ position: "relative", overflowY: "visible" }}>
                    <div
                        style={{
                            width: "100%",
                            transition: "height 0.2s ease-in 0s",
                            overflowY: "visible",
                        }}
                    >
                        <textarea
                            name="collab"
                            id="collab"
                            rows={1}
                            className="collab"
                            ref={mentionsInputRef}
                            value={state.message}
                            onChange={handleInputChange}
                            maxLength={maxMessageLength}
                            placeholder="Enter a comment"
                            style={{
                                display: "block",
                                width: "100%",
                                position: "relative",
                                top: "0px",
                                left: "0px",
                                boxSizing: "border-box",
                                backgroundColor: "#ffffff",
                                fontFamily: "inherit",
                                fontSize: "1rem",
                                letterSpacing: "inherit",
                                height: "100%",
                                bottom: "0px",
                                overflow: "auto",
                                resize: "vertical",
                                borderRadius: "4px",
                                border: "0.0625rem solid #dde3ee",
                                color: "#222222",
                                padding: "0.5rem 1rem",
                                maxHeight: "6.25rem",
                                minHeight: "4.125rem",
                            }}
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
