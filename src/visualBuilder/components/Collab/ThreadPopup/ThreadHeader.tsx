/** @jsxImportSource preact */
import React from "preact/compat";
import { useCallback } from "preact/hooks";
import classNames from "classnames";
import Button from "../Button/Button";
import { collabStyles, flexAlignCenter } from "../../../collab.style";
import { getThreadTitle } from "../../../utils/collabUtils";
import {
    IDefaultAPIResponse,
    IThreadHeader,
} from "../../../types/collab.types";

const ThreadHeader: React.FC<IThreadHeader> = React.memo(
    ({ onClose, displayResolve, onResolve, commentCount, activeThread }) => {
        // Handler for deleting a comment
        const handleResolve = useCallback(async () => {
            try {
                // Call the onResolveComment function
                const payload = {
                    threadUid: activeThread._id,
                    payload: {
                        threadState: 2,
                    },
                };
                const resolveResponse: IDefaultAPIResponse =
                    await onResolve(payload);
                onClose(true);
            } catch (error: any) {}
        }, [activeThread]);

        return (
            <div
                className={classNames(
                    "collab-thread-header--wrapper",
                    "flex-v-center",
                    collabStyles()["collab-thread-header--wrapper"],
                    flexAlignCenter
                )}
            >
                <div
                    className={classNames(
                        "collab-thread-header--container",
                        "flex-v-center",
                        collabStyles()["collab-thread-header--container"],
                        flexAlignCenter
                    )}
                >
                    <div
                        className={classNames(
                            "collab-thread-header--title",
                            collabStyles()["collab-thread-header--title"]
                        )}
                    >
                        {getThreadTitle(commentCount)}
                    </div>
                    {displayResolve ? (
                        <Button
                            buttonType="tertiary"
                            className={classNames(
                                "collab-thread-header--resolve",
                                collabStyles()["collab-thread-header--resolve"]
                            )}
                            icon="RightMarkActive"
                            iconProps={{
                                className: classNames(
                                    collabStyles()[
                                        "collab-thread-header--resolve--icon"
                                    ],
                                    "collab-thread-header--resolve--icon"
                                ),
                            }}
                            onClick={handleResolve}
                            testId="collab-thread-resolve-btn"
                        >
                            <span
                                className={classNames(
                                    "collab-thread-header--resolve--text",
                                    collabStyles()[
                                        "collab-thread-header--resolve--text"
                                    ]
                                )}
                            >
                                Resolve
                            </span>
                        </Button>
                    ) : null}
                </div>
            </div>
        );
    }
);

export default ThreadHeader;
