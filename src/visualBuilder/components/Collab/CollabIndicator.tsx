/** @jsxImportSource preact */
import { collabStyles } from "../../visualBuilder.style";
import classNames from "classnames";
import React from "preact/compat";
import { useState, useRef, useEffect } from "preact/hooks";
import { css } from "goober";
import ThreadPopup from "./ThreadPopup";
import Config from "../../../configManager/configManager";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import {
    IActiveThread,
    ICommentResponse,
    IFetchCommentsResponse,
    IThreadResponseDTO,
    IThreadPayload,
    IInviteMetadata,
    IDefaultAPIResponse,
} from "../../types/collab.types";

export interface ICollabIndicator {
    newThread?: boolean;
    activeThread?: IActiveThread;
}

const CollabIndicator: React.FC<ICollabIndicator> = (props) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const config = Config.get();

    const [showPopup, setShowPopup] = useState(props.newThread || false);

    // Set initial state based on props
    const [activeThread, setActiveThread] = useState(
        props.newThread ? { _id: "new" } : props.activeThread || { _id: "new" }
    );

    const [inviteMetadata, setInviteMetadata] = useState<IInviteMetadata>(
        config?.collab?.inviteMetadata
    );

    // Update activeDiscussion when props.activeDiscussion changes
    useEffect(() => {
        if (props.activeThread) {
            setActiveThread(props.activeThread);
        }
    }, [props.activeThread]);

    useEffect(() => {
        const handleExternalClose = () => {
            setShowPopup(false);
        };
        document.addEventListener(
            "closeCollabPopup" as any,
            handleExternalClose
        );

        return () => {
            document.removeEventListener(
                "closeCollabPopup" as any,
                handleExternalClose
            );
        };
    }, []);

    const calculatePopupPosition = () => {
        if (!buttonRef.current || !popupRef.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const popupHeight = 422;
        const popupWidth = 334;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const spaceAbove = buttonRect.top;
        const spaceBelow = viewportHeight - buttonRect.bottom;

        let top, left;

        if (spaceAbove >= popupHeight) {
            top = buttonRect.top - popupHeight - 8;
        } else {
            top = buttonRect.bottom + 8;
        }

        left = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;

        top = Math.max(top, 0);
        left = Math.max(left, 0);
        left = Math.min(left, viewportWidth - popupWidth);

        popupRef.current.style.top = `${top}px`;
        popupRef.current.style.left = `${left}px`;
    };

    const togglePopup = () => {
        if (!showPopup) {
            document.dispatchEvent(new CustomEvent("closeCollabPopup"));
            setShowPopup(true);
        } else {
            setShowPopup(false);
            if (config?.collab?.isFeedbackMode === false) {
                Config.set("collab.isFeedbackMode", true);
            }
        }
    };

    useEffect(() => {
        if (showPopup) {
            calculatePopupPosition();
        }
    }, [showPopup]);

    const handleClose = (isResolved: boolean = false) => {
        if (isResolved || activeThread._id === "new") {
            if (buttonRef.current) {
                const parentDiv = buttonRef.current.closest("div[field-path]");
                if (parentDiv) {
                    parentDiv.remove();
                }
            }
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
                        onCreateComment={async (payload) => {
                            const data = (await visualBuilderPostMessage?.send(
                                VisualBuilderPostMessageEvents.COLLAB_CREATE_COMMENT,
                                { payload }
                            )) as ICommentResponse;
                            if (!data) {
                                throw new Error("Failed to create comment");
                            }
                            return data;
                        }}
                        onEditComment={async (payload) => {
                            const data = (await visualBuilderPostMessage?.send(
                                VisualBuilderPostMessageEvents.COLLAB_EDIT_COMMENT,
                                { payload }
                            )) as ICommentResponse;
                            if (!data) {
                                throw new Error("Failed to update comment");
                            }
                            return data;
                        }}
                        onDeleteComment={async (payload) => {
                            const data = (await visualBuilderPostMessage?.send(
                                VisualBuilderPostMessageEvents.COLLAB_DELETE_COMMENT,
                                { payload }
                            )) as IDefaultAPIResponse;
                            if (!data) {
                                throw new Error("Failed to delete comment");
                            }
                            return data;
                        }}
                        onClose={handleClose}
                        onResolve={async (payload) => {
                            const data = (await visualBuilderPostMessage?.send(
                                VisualBuilderPostMessageEvents.COLLAB_RESOLVE_THREAD,
                                { payload }
                            )) as IThreadResponseDTO;
                            if (!data) {
                                throw new Error("Failed to resolve thread");
                            }

                            return data;
                        }}
                        inviteMetadata={inviteMetadata}
                        loadMoreMessages={async (payload) => {
                            const data = (await visualBuilderPostMessage?.send(
                                VisualBuilderPostMessageEvents.COLLAB_FETCH_COMMENTS,
                                { payload }
                            )) as IFetchCommentsResponse;

                            return data;
                        }}
                        activeThread={activeThread}
                        setActiveThread={setActiveThread}
                        createNewThread={async () => {
                            let payload: IThreadPayload = {
                                elementXPath: "",
                                position: { x: 0, y: 0 },
                                author: inviteMetadata.currentUser.email,
                                pageRoute: window.location.pathname,
                                inviteUid: inviteMetadata.inviteUid,
                                createdBy:
                                    inviteMetadata.currentUser.identityHash,
                            };
                            if (buttonRef.current) {
                                const parentDiv =
                                    buttonRef.current.closest(
                                        "div[field-path]"
                                    );
                                if (parentDiv) {
                                    const fieldPath =
                                        parentDiv.getAttribute("field-path");
                                    const relative =
                                        parentDiv.getAttribute("relative");

                                    const match = relative?.match(
                                        /x: ([\d.]+), y: ([\d.]+)/
                                    );
                                    if (!match) {
                                        throw new Error(
                                            "Failed to create thread"
                                        );
                                    }
                                    const relativeX = parseFloat(match[1]);
                                    const relativeY = parseFloat(match[2]);

                                    if (fieldPath && relative) {
                                        payload = {
                                            elementXPath: fieldPath,
                                            position: {
                                                x: relativeX,
                                                y: relativeY,
                                            },
                                            author: inviteMetadata.currentUser
                                                .email,
                                            pageRoute: window.location.pathname,
                                            inviteUid: inviteMetadata.inviteUid,
                                            createdBy:
                                                inviteMetadata.currentUser
                                                    .identityHash,
                                        };
                                    }
                                }
                            }

                            const data = (await visualBuilderPostMessage?.send(
                                VisualBuilderPostMessageEvents.COLLAB_CREATE_THREAD,
                                { payload }
                            )) as IThreadResponseDTO;

                            if (buttonRef.current) {
                                const parentDiv =
                                    buttonRef.current.closest(
                                        "div[field-path]"
                                    );
                                if (parentDiv) {
                                    parentDiv.setAttribute(
                                        "threaduid",
                                        data.thread._id
                                    );
                                }
                            }

                            return data;
                        }}
                    />
                    ;
                </div>
            )}
        </>
    );
};

export default CollabIndicator;
