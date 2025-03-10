/** @jsxImportSource preact */
import React from "preact/compat";
import { useCallback, useState } from "preact/hooks";
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
        const [isResolving, setIsResolving] = useState(false);

        const handleResolve = useCallback(async () => {
            if (isResolving) return;

            try {
                setIsResolving(true);
                const payload = {
                    threadUid: activeThread._id,
                    payload: {
                        threadState: 2,
                    },
                };
                await onResolve(payload);
                onClose(true);
            } catch (error: any) {
            } finally {
                setIsResolving(false);
            }
        }, [activeThread, isResolving, onResolve, onClose]);

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
                            isLoading={isResolving}
                            loadingColor="secondary"
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
