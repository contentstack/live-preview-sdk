/** @jsxImportSource preact */
import { collabStyles } from "../../visualBuilder.style";
import classNames from "classnames";
import React from "preact/compat";
import ThreadPopup from "./ThreadPopup";
import Config from "../../../configManager/configManager";
import { IActiveThread, IInviteMetadata } from "../../types/collab.types";
import { useCollabIndicator } from "../../hooks/useCollabIndicator";
import { useCollabOperations } from "../../hooks/useCollabOperations";
export interface ICollabIndicator {
    newThread?: boolean;
    activeThread?: IActiveThread;
}

const CollabIndicator: React.FC<ICollabIndicator> = (props) => {
    const config = Config.get();
    const inviteMetadata: IInviteMetadata = config?.collab?.inviteMetadata;

    const {
        buttonRef,
        popupRef,
        showPopup,
        setShowPopup,
        activeThread,
        setActiveThread,
        togglePopup,
    } = useCollabIndicator({
        newThread: props.newThread ?? false,
        thread: props.activeThread || { _id: "new" },
    });

    const {
        createComment,
        editComment,
        deleteComment,
        resolveThread,
        fetchComments,
        createNewThread,
        deleteThread,
    } = useCollabOperations();

    const handleClose = (isResolved: boolean = false) => {
        if (isResolved || activeThread._id === "new") {
            buttonRef.current?.closest("div[field-path]")?.remove();
        }
        setShowPopup(false);

        if (config?.collab?.isFeedbackMode === false) {
            Config.set("collab.isFeedbackMode", true);
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                className={classNames(
                    "collab-indicator",
                    collabStyles()["collab-indicator"]
                )}
                data-testid="collab-indicator"
                onClick={togglePopup}
            >
                {!showPopup && (
                    <span className={"collab-indicator"}>
                        {activeThread.sequenceNumber}
                    </span>
                )}
            </button>
            {showPopup && (
                <div
                    ref={popupRef}
                    className={classNames(
                        "collab-popup",
                        collabStyles()["collab-popup"]
                    )}
                    data-testid="collab-popup"
                >
                    <ThreadPopup
                        onCreateComment={createComment}
                        onEditComment={editComment}
                        onDeleteComment={deleteComment}
                        onClose={handleClose}
                        onResolve={resolveThread}
                        inviteMetadata={inviteMetadata}
                        loadMoreMessages={fetchComments}
                        activeThread={activeThread}
                        setActiveThread={setActiveThread}
                        createNewThread={() =>
                            createNewThread(buttonRef, inviteMetadata)
                        }
                        onDeleteThread={deleteThread}
                    />
                    ;
                </div>
            )}
        </>
    );
};

export default CollabIndicator;
