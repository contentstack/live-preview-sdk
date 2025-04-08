/** @jsxImportSource preact */
import React from "preact/compat";
import classNames from "classnames";
import Button from "../Button/Button";
import { collabStyles } from "../../../collab.style";
import { getThreadTitle } from "../../../utils/collabUtils";

interface ThreadActionsProps {
    commentCount: number;
    displayResolve: boolean;
    handleResolve: () => void;
    isResolving: boolean;
}

const ThreadActionBar: React.FC<ThreadActionsProps> = ({
    commentCount,
    displayResolve,
    handleResolve,
    isResolving,
}) => {
    return (
        <>
            <div
                className={classNames(
                    "collab-thread-header--title",
                    collabStyles()["collab-thread-header--title"]
                )}
            >
                {getThreadTitle(commentCount)}
            </div>
            {displayResolve && (
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
            )}
        </>
    );
};

export default ThreadActionBar;
