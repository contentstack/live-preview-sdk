/** @jsxImportSource preact */
import React from "preact/compat";
import {
    useState,
    useEffect,
    useCallback,
    useRef,
    useContext,
} from "preact/hooks";
import { cloneDeep, findIndex } from "lodash-es";
import {
    ICommentState,
    IMentionList,
    IMentionItem,
    IMessageDTO,
    IUserState,
    IUserDTO,
    IThreadResponseDTO,
    ICommentResponse,
    ICommentPayload,
    IThreadPopupState,
} from "../types/collab.types";
import {
    validateCommentAndMentions,
    filterOutInvalidMentions,
    getMessageWithDisplayName,
    getUserName,
    getCommentBody,
} from "../utils/collabUtils";
import { collabStyles } from "../collab.style";
import { maxMessageLength } from "../utils/constants";
import { ThreadProvider } from "../components/Collab/ThreadPopup/ContextProvider";
import useDynamicTextareaRows from "../hooks/useDynamicTextareaRows";

const initialState: ICommentState = {
    message: "",
    toUsers: [],
    images: [],
    createdBy: "",
    author: "",
};

export const useCommentTextArea = (
    userState: IUserState,
    comment: IMessageDTO | null | undefined,
    onClose: (isResolved?: boolean) => void
) => {
    const [state, setState] = useState<ICommentState>(initialState);

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
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

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(
            0,
            userState.mentionsList.length
        );
    }, [userState.mentionsList]);

    useEffect(() => {
        const filteredUsersList = userState.mentionsList.filter((user) => {
            if (!searchTerm) return true;
            return user.display
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        });
        setFilteredUsers(filteredUsersList);
    }, [searchTerm, userState.mentionsList]);

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

    useEffect(() => {
        if (!comment) return;

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
    }, [comment, userState]);

    const findMentionSearchPosition = useCallback(
        (text: string, cursorPos: number) => {
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
        },
        []
    );

    const calculatePosition = useCallback(
        (textarea: HTMLTextAreaElement, cursorPosition: number) => {
            const text = textarea?.value;
            const textBeforeCursor = text?.slice(0, cursorPosition);
            const lines = textBeforeCursor?.split("\n");
            const currentLineNumber = (lines?.length || 0) - 1;
            const currentLine = lines?.[currentLineNumber];

            const style = window.getComputedStyle(textarea);
            const lineHeight = parseInt(style.lineHeight);
            const paddingLeft = parseInt(style.paddingLeft);
            const paddingTop = parseInt(style.paddingTop);

            const span = document.createElement("span");
            span.style.font = style.font;
            span.style.visibility = "hidden";
            span.style.position = "absolute";
            span.style.whiteSpace = "pre";
            span.textContent = currentLine ? currentLine : "";
            document.body.appendChild(span);

            const left = Math.min(
                span.offsetWidth + paddingLeft,
                textarea.offsetWidth - 200
            );
            document.body.removeChild(span);

            const currentLineY = currentLineNumber * lineHeight + paddingTop;
            const nextLineY = currentLineY + lineHeight;

            const viewportHeight = window.innerHeight;
            const suggestionsHeight = 160;

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
        },
        []
    );

    const insertMention = useCallback(
        (user: IMentionList) => {
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

            const ele = inputRef.current;
            if (ele) {
                ele.focus();
            }
        },
        [state.message, state.toUsers, findMentionSearchPosition]
    );

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
                    calculatePosition(
                        inputRef.current as HTMLTextAreaElement,
                        newPosition
                    )
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
        },
        [state.toUsers, findMentionSearchPosition, calculatePosition, setError]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "@") {
                const position = calculatePosition(
                    inputRef.current as HTMLTextAreaElement,
                    (e.target as HTMLTextAreaElement).selectionStart
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
        },
        [
            showSuggestions,
            filteredUsers,
            selectedIndex,
            insertMention,
            calculatePosition,
        ]
    );

    useEffect(() => {
        itemRefs.current[selectedIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
        });
    }, [selectedIndex]);

    const handleSubmit = useCallback(async () => {
        if (error.hasError) return;

        try {
            let threadUID: string = activeThread?._id;
            if (activeThread?._id == "new") {
                let currentThread: IThreadResponseDTO = await createNewThread();
                threadUID = currentThread?.thread?._id;
                setActiveThread(currentThread?.thread);
            }

            const commentState = {
                ...state,
                createdBy: userState.currentUser.uid,
                author: userState.currentUser.email,
            };

            const commentPayload = {
                ...getCommentBody(commentState),
            };

            const commentData: ICommentPayload = {
                threadUid: threadUID,
                commentPayload,
            };

            if (editComment) {
                let commentResponse: ICommentResponse = await onEditComment({
                    threadUid: threadUID,
                    commentUid: editComment,
                    payload: commentPayload,
                });

                setThreadState((prevState: IThreadPopupState) => {
                    const updatedComments = cloneDeep(prevState.comments);
                    const commentIndex = findIndex(
                        updatedComments,
                        (c) => c._id === comment?._id
                    );

                    updatedComments.splice(
                        commentIndex,
                        1,
                        commentResponse?.comment
                    );

                    return {
                        ...prevState,
                        editComment: "",
                        comments: updatedComments,
                    };
                });
                onClose(false);
            } else {
                let commentResponse: ICommentResponse =
                    await onCreateComment(commentData);
                setThreadState((prevState: IThreadPopupState) => ({
                    ...prevState,
                    comments: [commentResponse.comment, ...prevState.comments],
                    commentCount: prevState.commentCount + 1,
                }));

                setState(initialState);
                onClose(false);
            }
        } catch (error: any) {
            console.error("Error submitting comment:", error);
        }
    }, [error.hasError, state, activeThread]);

    useEffect(() => {
        if (state.message.length === 0) {
            setError({ hasError: true, message: "" });
        }
    }, [state.message, setError]);

    return {
        state,
        setState,
        error,
        showSuggestions,
        cursorPosition,
        selectedIndex,
        filteredUsers,
        inputRef,
        listRef,
        itemRefs,
        handleInputChange,
        handleKeyDown,
        handleSubmit,
        insertMention,
        maxMessageLength,
    };
};
