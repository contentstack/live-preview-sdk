/** @jsxImportSource preact */
import React from "preact/compat";
import {
    useEffect,
    useState,
    useContext,
    useCallback,
    useRef,
} from "preact/hooks";
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
        const [showSuggestions, setShowSuggestions] = useState(false);
        const [cursorPosition, setCursorPosition] = useState({
            top: 0,
            left: 0,
        });
        const [searchTerm, setSearchTerm] = useState("");
        const inputRef = useRef<HTMLTextAreaElement>(null);

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
            if (!searchTerm) return true;
            return (
                user.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        const insertMention = (user: any) => {
            const mention = findMentionSearchPosition(
                state.message,
                inputRef.current?.selectionStart || 0
            );
            if (!mention) return;

            const beforeMention = state.message.slice(0, mention.start);
            const afterMention = state.message.slice(
                inputRef.current?.selectionStart || 0
            );
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

        // Get cursor coordinates
        const getCursorCoordinates = () => {
            if (!inputRef.current) return { x: 0, y: 0 };

            const input = inputRef.current as HTMLTextAreaElement;
            const cursorPosition = input.selectionStart;

            // Create a temporary div to measure text
            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.visibility = "hidden";
            div.style.whiteSpace = "pre-wrap";
            div.style.wordWrap = "break-word";
            div.style.font = window.getComputedStyle(input).font;
            div.style.padding = window.getComputedStyle(input).padding;

            // Get text before cursor
            const textBeforeCursor = input.value.substring(0, cursorPosition);
            div.textContent = textBeforeCursor;
            document.body.appendChild(div);

            // Calculate coordinates
            const inputRect = input.getBoundingClientRect();
            const divRect = div.getBoundingClientRect();

            document.body.removeChild(div);

            return {
                x: inputRect.left + (divRect.width % inputRect.width),
                y:
                    inputRect.top +
                    Math.floor(divRect.width / inputRect.width) *
                        parseInt(window.getComputedStyle(input).lineHeight),
            };
        };

        const calculatePosition = (textarea: any, cursorPosition: any) => {
            const text = inputRef.current?.value;
            const textBeforeCursor = text?.slice(0, cursorPosition);
            const lines = textBeforeCursor?.split("\n");
            const currentLineNumber = (lines?.length || 0) - 1;
            const currentLine = lines?.[currentLineNumber];

            // Get textarea properties
            const style = window.getComputedStyle(textarea);
            const lineHeight = parseInt(style.lineHeight);
            const paddingLeft = parseInt(style.paddingLeft);
            const paddingTop = parseInt(style.paddingTop);

            // Create temporary span to measure text width up to cursor
            const span = document.createElement("span");
            span.style.font = style.font;
            span.style.visibility = "hidden";
            span.style.position = "absolute";
            span.style.whiteSpace = "pre";
            span.textContent = currentLine ? currentLine : "";
            document.body.appendChild(span);

            // Calculate horizontal position based on current line text width
            const left = Math.min(
                span.offsetWidth + paddingLeft,
                textarea.offsetWidth - 200 // Keep list inside textarea
            );
            document.body.removeChild(span);

            // Calculate vertical position based on current line
            const currentLineY = currentLineNumber * lineHeight + paddingTop;
            const nextLineY = currentLineY + lineHeight;

            // Check if suggestion list would go below textarea
            const textareaBottom = textarea.getBoundingClientRect().bottom;
            const viewportHeight = window.innerHeight;
            const suggestionsHeight = 160; // Fixed height for suggestions

            // Adjust position to show above the current line if there's not enough space below
            const spaceBelow =
                viewportHeight -
                (textarea.getBoundingClientRect().top + nextLineY);
            const showAbove = spaceBelow < suggestionsHeight;

            const top = showAbove
                ? currentLineY - suggestionsHeight
                : nextLineY;

            return {
                top,
                left,
                showAbove,
            };
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
                    createdBy: userState.currentUser.uid,
                }));

                const commentPayload = {
                    ...getCommentBody({
                        ...state,
                        createdBy: userState.currentUser.uid,
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
            const newPosition = target.selectionStart;

            const mention = findMentionSearchPosition(
                newPlainTextValue,
                newPosition
            );
            if (mention) {
                setSearchTerm(mention.searchTerm);
                setShowSuggestions(true);
                setCursorPosition(
                    calculatePosition(inputRef.current, newPosition)
                );
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

        const handleKeyDown = (e: any) => {
            if (e.key === "@") {
                const position = calculatePosition(
                    inputRef.current,
                    e.target.selectionStart
                );
                setCursorPosition(position);
            }
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
                            onKeyDown={handleKeyDown}
                            maxLength={maxMessageLength}
                            placeholder="Enter a comment"
                            ref={inputRef}
                        ></textarea>
                    </div>
                </div>

                {showSuggestions && filteredUsers.length > 0 && (
                    <div
                        className={classNames(
                            "collab-thread-body--input--textarea--suggestionsList",
                            collabStyles()[
                                "collab-thread-body--input--textarea--suggestionsList"
                            ]
                        )}
                        style={{
                            left: `${cursorPosition.left}px`,
                            top: `${cursorPosition.top}px`,
                        }}
                    >
                        {filteredUsers.map((user) => (
                            <button
                                key={user.email}
                                onClick={() => insertMention(user)}
                                className={classNames(
                                    "collab-thread-body--input--textarea--suggestionsList--button",
                                    collabStyles()[
                                        "collab-thread-body--input--textarea--suggestionsList--button"
                                    ]
                                )}
                            >
                                {user.display}
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
