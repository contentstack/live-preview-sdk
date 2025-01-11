/** @jsxImportSource preact */
import React, { useCallback } from "preact/compat";
import classNames from "classnames";
import Button from "../Button/Button";
import { collabStyles } from "../../../visualBuilder.style";
import { getDiscussionTitle } from "../../../utils/collabUtils";
import {
    IActiveDiscussion,
    IDefaultAPIResponse,
} from "../../../types/collab.types";

interface IDiscussionHeader {
    onClose: () => void;
    displayResolve: boolean;
    onResolve: (discussion: IActiveDiscussion) => Promise<IDefaultAPIResponse>;
    commentCount: number;
    activeDiscussion: IActiveDiscussion;
}

const DiscussionHeader: React.FC<IDiscussionHeader> = React.memo(
    ({
        onClose,
        displayResolve,
        onResolve,
        commentCount,
        activeDiscussion,
    }) => {
        // Handler for deleting a comment
        const handleResolve = useCallback(async () => {
            try {
                // Call the onDeleteComment function
                const resolveResponse: IDefaultAPIResponse =
                    await onResolve(activeDiscussion);
                // successNotification(resolveResponse.notice);
                onClose();
            } catch (error: any) {
                // failureNotification(
                //     error?.data?.error_message || "An error occurred.",
                //     error?.data?.errors
                // );
            }
        }, [activeDiscussion]);

        return (
            <div
                className={classNames(
                    collabStyles()["collab-discussion-header--wrapper"],
                    collabStyles()["flex-v-center"]
                )}
            >
                <div
                    className={classNames(
                        collabStyles()["collab-discussion-header--container"],
                        collabStyles()["flex-v-center"]
                    )}
                >
                    <div
                        className={
                            collabStyles()["collab-discussion-header--title"]
                        }
                    >
                        {getDiscussionTitle(commentCount)}
                    </div>
                    {displayResolve ? (
                        <Button
                            buttonType="tertiary"
                            className={
                                collabStyles()[
                                    "collab-discussion-header--resolve"
                                ]
                            }
                            icon="RightMarkActive"
                            iconProps={{
                                className:
                                    collabStyles()[
                                        "collab-discussion-header--resolve--icon"
                                    ],
                            }}
                            onClick={handleResolve}
                            testId="discussion-resolve-btn"
                        >
                            <span
                                className={
                                    collabStyles()[
                                        "collab-discussion-header--resolve--text"
                                    ]
                                }
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

export default DiscussionHeader;
