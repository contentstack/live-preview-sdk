/** @jsxImportSource preact */
import { visualBuilderStyles } from "../../visualBuilder.style";
import classNames from "classnames";
import React, { useState, useRef, useEffect } from "preact/compat";
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

const inviteMetadata: IInviteMetadata = {
    currentUser: {
        email: "om.prakash@contentstack.com",
        identityHash: "blte26110c4ea641ed9",
    },
    users: [
        {
            email: "om.prakash@contentstack.com",
            identityHash: "blte26110c4ea641ed9",
        },
    ],
    inviteUid: "123456789",
};

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

    // // Set initial state based on props
    // const [activeThread, setActiveThread] = useState<IActiveThread>({
    //     _id: "678d11da0c8ec2f3250b5386",
    //     author: inviteMetadata.currentUser.email,
    //     inviteUid: inviteMetadata.inviteUid,
    //     position: { x: 0, y: 0 },
    //     elementXPath: "",
    //     isElementPresent: true,
    //     pageRoute: "/",
    //     createdBy: inviteMetadata.currentUser.identityHash,
    //     sequenceNumber: 1,
    //     threadState: 1,
    //     createdAt: "2025-01-19T14:53:14.809Z",
    //     updatedAt: "2025-01-19T14:53:14.809Z",
    // });

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
            if (config?.collab?.state === false) {
                Config.set("collab.state", true);
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

        if (config?.collab?.state === false) {
            Config.set("collab.state", true);
        }
    };

    const popupClass = css`
        position: fixed;
        z-index: 1000;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        overflow: auto;
    `;

    return (
        <>
            <button
                ref={buttonRef}
                className={classNames(
                    "collab-indicator",
                    visualBuilderStyles()["visual-builder__collab-indicator"]
                )}
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
                    className={classNames("collab-popup", popupClass)}
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
                            const response = {
                                notice: "Comment created succesfully",
                                comment: {
                                    _id: "678d12660c8ec2f3250b5387",
                                    threadUid: "678d11da0c8ec2f3250b5386",
                                    message: payload.commentPayload.message,
                                    author: inviteMetadata.currentUser.email,
                                    toUsers: [],
                                    images: [],
                                    createdAt: "2025-01-19T14:55:34.017Z",
                                    updatedAt: "2025-01-19T14:55:34.017Z",
                                    createdBy:
                                        inviteMetadata.currentUser.identityHash,
                                },
                            };
                            return response;
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
                            const response = {
                                notice: "Comment Updated succesfully",
                                comment: {
                                    _id: "678d12660c8ec2f3250b5387",
                                    threadUid: "678d11da0c8ec2f3250b5386",
                                    message: payload.payload.message,
                                    author: inviteMetadata.currentUser.email,
                                    toUsers: [],
                                    images: [],
                                    createdAt: "2025-01-19T14:55:34.017Z",
                                    updatedAt: "2025-01-19T14:55:34.017Z",
                                    createdBy:
                                        inviteMetadata.currentUser.identityHash,
                                },
                            };
                            return response;
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
                            const response = {
                                notice: "Comment deleted succesfully",
                            };
                            return response;
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

                            // const response = {
                            //     notice: "Thread updated successfully",
                            //     thread: {
                            //         _id: "678d11da0c8ec2f3250b5386",
                            //         author: inviteMetadata.currentUser.email,
                            //         inviteUid: inviteMetadata.inviteUid,
                            //         position: { x: 0, y: 0 },
                            //         elementXPath: "",
                            //         isElementPresent: true,
                            //         pageRoute: "/",
                            //         createdBy:
                            //             inviteMetadata.currentUser.identityHash,
                            //         sequenceNumber: 1,
                            //         threadState: 2,
                            //         createdAt: "2025-01-19T14:53:14.809Z",
                            //         updatedAt: "2025-01-19T14:53:14.809Z",
                            //     },
                            // };

                            // return response;
                        }}
                        inviteMetadata={inviteMetadata}
                        loadMoreMessages={async (payload) => {
                            const data = (await visualBuilderPostMessage?.send(
                                VisualBuilderPostMessageEvents.COLLAB_FETCH_COMMENTS,
                                { payload }
                            )) as IFetchCommentsResponse;

                            return data;
                            return {
                                count: 3,
                                comments: [
                                    {
                                        _id: "678d12660c8ec2f3250b5387",
                                        threadUid: "678d11da0c8ec2f3250b5386",
                                        message: "This is a comment",
                                        author: inviteMetadata.currentUser
                                            .email,
                                        toUsers: [],
                                        images: [],
                                        createdAt: "2025-01-19T14:55:34.017Z",
                                        updatedAt: "2025-01-19T14:55:34.017Z",
                                        createdBy:
                                            inviteMetadata.currentUser
                                                .identityHash,
                                    },
                                    {
                                        _id: "678d12660c8ec2f3250b5387",
                                        threadUid: "678d11da0c8ec2f3250b5386",
                                        message: "This is a comment",
                                        author: inviteMetadata.currentUser
                                            .email,
                                        toUsers: [],
                                        images: [],
                                        createdAt: "2025-01-19T14:55:34.017Z",
                                        updatedAt: "2025-01-19T14:55:34.017Z",
                                        createdBy:
                                            inviteMetadata.currentUser
                                                .identityHash,
                                    },
                                    {
                                        _id: "678d12660c8ec2f3250b5387",
                                        threadUid: "678d11da0c8ec2f3250b5386",
                                        message: "This is a comment",
                                        author: inviteMetadata.currentUser
                                            .email,
                                        toUsers: [],
                                        images: [],
                                        createdAt: "2025-01-19T14:55:34.017Z",
                                        updatedAt: "2025-01-19T14:55:34.017Z",
                                        createdBy:
                                            inviteMetadata.currentUser
                                                .identityHash,
                                    },
                                ],
                            };
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

                            // const response = {
                            //     notice: "Thread created successfully",
                            //     thread: {
                            //         _id: "678d11da0c8ec2f3250b5386",
                            //         author: inviteMetadata.currentUser.email,
                            //         inviteUid: inviteMetadata.inviteUid,
                            //         position: payload.position,
                            //         elementXPath: payload.elementXPath,
                            //         isElementPresent: true,
                            //         pageRoute: payload.pageRoute,
                            //         createdBy:
                            //             inviteMetadata.currentUser.identityHash,
                            //         sequenceNumber: 1,
                            //         threadState: 1,
                            //         createdAt: "2025-01-19T14:53:14.809Z",
                            //         updatedAt: "2025-01-19T14:53:14.809Z",
                            //     },
                            // };

                            // if (buttonRef.current) {
                            //     const parentDiv =
                            //         buttonRef.current.closest(
                            //             "div[field-path]"
                            //         );
                            //     if (parentDiv) {
                            //         parentDiv.setAttribute(
                            //             "threadUid",
                            //             response.thread._id
                            //         );
                            //     }
                            // }

                            // return response;
                        }}
                    />
                    ;
                </div>
            )}
        </>
    );
};

export default CollabIndicator;
