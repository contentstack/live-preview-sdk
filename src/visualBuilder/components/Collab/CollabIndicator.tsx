/** @jsxImportSource preact */
import { collabStyles } from "../../collab.style";
import classNames from "classnames";
import React from "preact/compat";
import ThreadPopup from "./ThreadPopup";
import Config from "../../../configManager/configManager";
import { IActiveThread, IInviteMetadata } from "../../types/collab.types";
import { useCollabIndicator } from "../../hooks/useCollabIndicator";
import { useCollabOperations } from "../../hooks/useCollabOperations";
import { handleEmptyThreads } from "../../generators/generateThread";
import { iconComponents } from "../icons/CollabIcons";
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
        if (isResolved) {
            buttonRef.current?.closest("div[field-path]")?.remove();
        }
        handleEmptyThreads();
        setShowPopup(false);

        if (config?.collab?.isFeedbackMode === false) {
            Config.set("collab.isFeedbackMode", true);
        }
    };
    const IconComponent = iconComponents["Indicator"];

    return (
        <>
            <button
                ref={buttonRef}
                data-testid="collab-indicator"
                className={classNames(
                    "collab-indicator",
                    collabStyles()["collab-indicator"]
                )}
                onClick={togglePopup}
            >
                <IconComponent active={!showPopup} />
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
                        onDeleteThread={deleteThread}
                        createNewThread={() =>
                            createNewThread(buttonRef, inviteMetadata)
                        }
                    />
                </div>
            )}
        </>
    );
};

export default CollabIndicator;
