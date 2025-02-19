/** @jsxImportSource preact */
import React, { forwardRef, Ref } from "preact/compat";
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
    IMentionList,
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
import Tooltip from "../Tooltip/Tooltip";

interface ICommentTextArea {
    userState: IUserState;
    onClose: (isResolved?: boolean) => void;
    handleOnSaveRef: React.MutableRefObject<any>;
    comment?: IMessageDTO | null;
}

interface TooltipProps {
    text: string;
    onClick: () => void;
    onKeyDown: (e: any) => void;
    ariaSelected: boolean;
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
        const [selectedIndex, setSelectedIndex] = useState(0);
        const [filteredUsers, setFilteredUsers] = useState<IMentionList[]>([]);
        const inputRef = useRef<HTMLTextAreaElement>(null);
        const listRef = useRef<HTMLUListElement>(null);
        const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

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

        // Update refs array when users change
        useEffect(() => {
            itemRefs.current = itemRefs.current.slice(
                0,
                userState.mentionsList.length
            );
        }, [userState.mentionsList]);

        useEffect(() => {
            // Filter users based on search term
            const filteredUsersList = userState.mentionsList.filter((user) => {
                if (!searchTerm) return true;
                return user.display
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
            });
            setFilteredUsers(filteredUsersList);
        }, [searchTerm]);

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
            const newValue = `${beforeMention}@${user.display} ${afterMention}`;

            const updatedMentions = filterOutInvalidMentions(newValue, [
                ...(state.toUsers || []),
                { display: user.display, id: user.uid || "" },
            ]);

            setState((prevState) => ({
                ...prevState,
                message: newValue,
                toUsers: updatedMentions.toUsers,
            }));
            setShowSuggestions(false);

            // Focus back on input after selection
            const ele = inputRef.current as HTMLTextAreaElement | null;
            if (ele) {
                ele.focus();
            }
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
                    display: `${user.display || getUserName(user)}`,
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
                setSelectedIndex(0);
            } else {
                setShowSuggestions(false);
            }

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
                setSelectedIndex(0);
            }

            if (!showSuggestions) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredUsers.length - 1 ? prev + 1 : prev
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (showSuggestions) {
                        insertMention(filteredUsers[selectedIndex]);
                    }
                    break;
                case "Escape":
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                    break;
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
                        {showSuggestions && filteredUsers.length > 0 && (
                            <ul
                                className={classNames(
                                    "collab-thread-body--input--textarea--suggestionsList",
                                    collabStyles()[
                                        "collab-thread-body--input--textarea--suggestionsList"
                                    ]
                                )}
                                // style={{
                                //     left: `${cursorPosition.left}px`,
                                //     top: `${cursorPosition.top}px`,
                                // }}
                                ref={listRef}
                            >
                                {filteredUsers.map((user, index) => (
                                    <li
                                        key={user.uid}
                                        onClick={() => insertMention(user)}
                                        className={classNames(
                                            "collab-thread-body--input--textarea--suggestionsList--item",

                                            collabStyles()[
                                                "collab-thread-body--input--textarea--suggestionsList--item"
                                            ],
                                            "collab-thread-body--input--textarea--suggestionsList--item-selected",

                                            index === selectedIndex
                                                ? collabStyles()[
                                                      "collab-thread-body--input--textarea--suggestionsList--item-selected"
                                                  ]
                                                : ""
                                        )}
                                        ref={(el: any) =>
                                            (itemRefs.current[index] = el)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                insertMention(user);
                                            } else {
                                                handleKeyDown(e);
                                            }
                                        }}
                                        tabIndex={-1}
                                        aria-selected={index === selectedIndex}
                                    >
                                        <Tooltip
                                            content={user.display}
                                        ></Tooltip>
                                        {user.display.length > 20
                                            ? user.display.substring(0, 18) +
                                              "..."
                                            : user.display}
                                    </li>
                                ))}
                            </ul>
                        )}
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
