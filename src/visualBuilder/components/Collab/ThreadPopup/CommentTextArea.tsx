/** @jsxImportSource preact */
import React from "preact/compat";
import { useEffect } from "preact/hooks";
import { useCommentTextArea } from "../../../hooks/useCommentTextArea";
import { collabStyles, flexAlignCenter } from "../../../collab.style";
import {
    ICommentTextAreaProps,
    IMentionList,
} from "../../../types/collab.types";
import classNames from "classnames";
import Tooltip from "../Tooltip/Tooltip";

const ErrorIndicator: React.FC<{ errorMessage: string }> = ({
    errorMessage,
}) => (
    <div
        className={classNames(
            "collab-thread-input-indicator--error",
            collabStyles()["collab-thread-input-indicator--error"]
        )}
    >
        {errorMessage}
    </div>
);

const CharacterCounter: React.FC<{
    currentLength: number;
    maxLength: number;
}> = ({ currentLength, maxLength }) => (
    <div
        className={classNames(
            "collab-thread-input-indicator--count",
            collabStyles()["collab-thread-input-indicator--count"]
        )}
    >
        {currentLength}/{maxLength}
    </div>
);

const MentionSuggestionsList: React.FC<{
    filteredUsers: IMentionList[];
    selectedIndex: number;
    cursorPosition: { top: number; showAbove: boolean };
    inputRef: React.RefObject<HTMLTextAreaElement>;
    listRef: React.RefObject<HTMLUListElement>;
    itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
    insertMention: (user: IMentionList) => void;
    handleKeyDown: (event: KeyboardEvent) => void;
}> = ({
    filteredUsers,
    selectedIndex,
    cursorPosition,
    inputRef,
    listRef,
    itemRefs,
    insertMention,
    handleKeyDown,
}) => {
    if (filteredUsers.length === 0) return null;

    return (
        <ul
            className={classNames(
                "collab-thread-body--input--textarea--suggestionsList",
                collabStyles()[
                    "collab-thread-body--input--textarea--suggestionsList"
                ]
            )}
            style={{
                ...(cursorPosition.showAbove
                    ? {
                          bottom: `${window.innerHeight - (inputRef.current?.getBoundingClientRect().top || 0) - cursorPosition.top}px`,
                          top: "auto",
                      }
                    : {
                          top: `${(inputRef.current?.getBoundingClientRect().top || 0) + cursorPosition.top}px`,
                      }),
            }}
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
                        index === selectedIndex
                            ? collabStyles()[
                                  "collab-thread-body--input--textarea--suggestionsList--item-selected"
                              ]
                            : ""
                    )}
                    ref={(el) => (itemRefs.current[index] = el)}
                    onKeyDown={(e) =>
                        e.key === "Enter"
                            ? insertMention(user)
                            : handleKeyDown(e as KeyboardEvent)
                    }
                    tabIndex={-1}
                    aria-selected={index === selectedIndex}
                >
                    {user.display == user.email ? (
                        user.display.length > 20 ? (
                            <Tooltip content={user.display || ""}>
                                {(user.display || "").substring(0, 18) + "..."}
                            </Tooltip>
                        ) : (
                            user.display
                        )
                    ) : (
                        <Tooltip
                            content={user.display + " - " + user.email || ""}
                        >
                            {user.display.length > 20
                                ? (user.display || "").substring(0, 18) + "..."
                                : user.display}
                        </Tooltip>
                    )}
                </li>
            ))}
        </ul>
    );
};

const CommentTextArea: React.FC<ICommentTextAreaProps> = React.memo(
    ({ userState, handleOnSaveRef, comment, onClose }) => {
        const {
            state,
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
        } = useCommentTextArea(userState, comment, onClose);

        const onChangeHandler = (event: Event) =>
            handleInputChange(event as any);
        const onKeyDownHandler = (event: KeyboardEvent) =>
            handleKeyDown(event as any);

        useEffect(() => {
            handleOnSaveRef.current = handleSubmit;
        }, [handleSubmit, handleOnSaveRef]);

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
                            onChange={onChangeHandler}
                            onKeyDown={onKeyDownHandler}
                            maxLength={maxMessageLength}
                            placeholder="Enter a comment or tag others using “@”"
                            ref={inputRef}
                        />
                        {showSuggestions && (
                            <MentionSuggestionsList
                                filteredUsers={filteredUsers}
                                selectedIndex={selectedIndex}
                                cursorPosition={cursorPosition}
                                inputRef={inputRef}
                                listRef={listRef}
                                itemRefs={itemRefs}
                                insertMention={insertMention}
                                handleKeyDown={handleKeyDown}
                            />
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
                        flexAlignCenter
                    )}
                >
                    <ErrorIndicator errorMessage={error.message} />
                    <CharacterCounter
                        currentLength={state.message.length}
                        maxLength={maxMessageLength}
                    />
                </div>
            </div>
        );
    }
);

export default CommentTextArea;
