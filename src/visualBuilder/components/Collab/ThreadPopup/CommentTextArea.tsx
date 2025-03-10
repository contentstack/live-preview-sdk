/** @jsxImportSource preact */
import React from "preact/compat";
import { useEffect } from "preact/hooks";
import { collabStyles, flexAlignCenter } from "../../../collab.style";
import { ICommentTextAreaProps } from "../../../types/collab.types";
import { useCommentTextArea } from "../../../hooks/useCommentTextArea";
import classNames from "classnames";
import Tooltip from "../Tooltip/Tooltip";

const CommentTextArea: React.FC<ICommentTextAreaProps> = React.memo(
    ({ userState, handleOnSaveRef, comment, onClose }) => {
        // Use our custom hook to get all the functionality
        const {
            state,
            error,
            showSuggestions,
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

        // Set up save ref for parent component
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
                            onChange={(event) =>
                                handleInputChange(event as any)
                            }
                            onKeyDown={(event) => handleKeyDown(event as any)}
                            maxLength={maxMessageLength}
                            placeholder="Enter a comment or tag others using “@”"
                            ref={inputRef}
                        />
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
                                                handleKeyDown(
                                                    e as KeyboardEvent
                                                );
                                            }
                                        }}
                                        tabIndex={-1}
                                        aria-selected={index === selectedIndex}
                                    >
                                        {user.display.length > 20 ? (
                                            <Tooltip content={user.display}>
                                                {user.display.substring(0, 18) +
                                                    "..."}
                                            </Tooltip>
                                        ) : (
                                            user.display
                                        )}
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
                        flexAlignCenter
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
