/** @jsxImportSource preact */
import React, { useCallback } from "preact/compat";
import classNames from "classnames";
import Button from "../Button/Button";
import { collabStyles } from "../../../visualBuilder.style";
import { getThreadTitle } from "../../../utils/collabUtils";
import {
    IActiveThread,
    IDefaultAPIResponse,
} from "../../../types/collab.types";

interface IThreadHeader {
    onClose: () => void;
    displayResolve: boolean;
    onResolve: (thread: IActiveThread) => Promise<IDefaultAPIResponse>;
    commentCount: number;
    activeThread: IActiveThread;
}

const ThreadHeader: React.FC<IThreadHeader> = React.memo(
    ({ onClose, displayResolve, onResolve, commentCount, activeThread }) => {
        // Handler for deleting a comment
        const handleResolve = useCallback(async () => {
            try {
                // Call the onDeleteComment function
                const resolveResponse: IDefaultAPIResponse =
                    await onResolve(activeThread);
                // successNotification(resolveResponse.notice);
                onClose();
            } catch (error: any) {
                // failureNotification(
                //     error?.data?.error_message || "An error occurred.",
                //     error?.data?.errors
                // );
            }
        }, [activeThread]);

        return (
            <div
                className={classNames(
                    "collab-thread-header--wrapper",
                    "flex-v-center",
                    collabStyles()["collab-thread-header--wrapper"],
                    collabStyles()["flex-v-center"]
                )}
            >
                <div
                    className={classNames(
                        "collab-thread-header--container",
                        "flex-v-center",
                        collabStyles()["collab-thread-header--container"],
                        collabStyles()["flex-v-center"]
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
                            testId="thread-resolve-btn"
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
