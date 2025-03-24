/** @jsxImportSource preact */
import React from "preact/compat";
import { useCallback, useState } from "preact/hooks";
import classNames from "classnames";
import ThreadActionBar from "./ThreadActionBar";
import { collabStyles, flexAlignCenter } from "../../../collab.style";
import { IThreadHeader } from "../../../types/collab.types";

const ThreadHeader: React.FC<IThreadHeader> = React.memo(
    ({ onClose, displayResolve, onResolve, commentCount, activeThread }) => {
        const [isResolving, setIsResolving] = useState(false);

        const handleResolve = useCallback(async () => {
            if (isResolving) return;

            try {
                setIsResolving(true);
                const payload = {
                    threadUid: activeThread._id,
                    payload: { threadState: 2 },
                };
                await onResolve(payload);
            } finally {
                onClose(true);
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
                    <ThreadActionBar
                        commentCount={commentCount}
                        displayResolve={displayResolve}
                        handleResolve={handleResolve}
                        isResolving={isResolving}
                    />
                </div>
            </div>
        );
    }
);

export default ThreadHeader;
