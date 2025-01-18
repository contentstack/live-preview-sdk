/** @jsxImportSource preact */
import { visualBuilderStyles } from "../../visualBuilder.style";
import classNames from "classnames";
import React, { useState, useRef, useEffect } from "preact/compat";
import { css } from "goober";
import ThreadPopup from "./ThreadPopup";
import Config from "../../../configManager/configManager";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";

const inviteMetadata = {
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
    activeThread?: { _id: string; [key: string]: any }; // Add more fields as per your structure
}

const CollabIndicator: React.FC<ICollabIndicator> = (props) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const [showPopup, setShowPopup] = useState(props.newThread || false);

    // Set initial state based on props
    const [activeThread, setActiveThread] = useState(
        props.newThread ? { _id: "new" } : props.activeThread || { _id: "new" }
    );

    console.log("collab root -> activeThread", activeThread);

    // Update activeDiscussion when props.activeDiscussion changes
    useEffect(() => {
        if (props.activeThread) {
            setActiveThread(props.activeThread);
        }
    }, [props.activeThread]);

    const config = Config.get();

    const calculatePopupPosition = () => {
        if (!buttonRef.current || !popupRef.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        // NEED to Fix the hardcoded values
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

    const handleClose = () => {
        setShowPopup(false);

        if (config?.collab?.state === false) {
            Config.set("collab.state", true);
        }
    };

    const popupClass = css`
        position: fixed;
        z-index: 50;
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
                {/* NEED TO USE THE SEQUENCE NUMBER HERE*/}
                {!showPopup && "1"}
            </button>
            {showPopup && (
                <div
                    ref={popupRef}
                    className={classNames("collab-popup", popupClass)}
                >
                    <ThreadPopup
                        onCreateComment={async (payload) => {
                            const data: any =
                                await visualBuilderPostMessage?.send(
                                    VisualBuilderPostMessageEvents.COLLAB_CREATE_COMMENT,
                                    { payload }
                                );
                            console.log("onCreateComment payload", payload);
                            console.log("onCreateComment result", data);
                            // const response = {
                            //     notice: "conversation created successfully",
                            //     comment: {
                            //         _id: data._id,
                            //         threadUid: data.threadId,
                            //         message: data.message,
                            //         author: "om.prakash@contentstack.com",
                            //         toUsers: [],
                            //         images: [],
                            //         created_at: data.createdAt,
                            //         created_by: "blte26110c4ea641ed9",
                            //     },
                            // };
                            return data;
                        }}
                        onEditComment={async (payload) => {
                            const response: any = {};
                            return response;
                        }}
                        onDeleteComment={async (payload) => {
                            const response: any = {};
                            return response;
                        }}
                        onClose={handleClose}
                        onResolve={async (payload) => {
                            const response: any = {};
                            handleClose();
                            return response;
                        }}
                        inviteMetadata={inviteMetadata}
                        loadMoreMessages={async (offset, limit) => {
                            let payload = {
                                threadID: activeThread?._id,
                                offset,
                                limit,
                            };
                            const data: any =
                                await visualBuilderPostMessage?.send(
                                    VisualBuilderPostMessageEvents.COLLAB_FETCH_COMMENTS,
                                    { payload }
                                );

                            console.log("loadMoreMessages payload", payload);
                            console.log("loadMoreMessages result", data);

                            // const response = {
                            //     count: data.length,
                            //     comments: data.map((item: any) => ({
                            //         uid: item._id,
                            //         discussion_uid: item.threadId,
                            //         entry_uid: "blt1bbd1c10058a089d",
                            //         locale: "en-us",
                            //         message: item.message,
                            //         to_users: [],
                            //         to_roles: [],
                            //         created_at: item.createdAt,
                            //         created_by: "blte26110c4ea641ed9",
                            //         deleted_at: false,
                            //     })),
                            // };
                            return data;
                        }}
                        activeThread={activeThread}
                        setActiveThread={setActiveThread}
                        createNewThread={async () => {
                            let payload = {};
                            let response: any = {};
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
                                        return response;
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
                                            pageRoute: "/",
                                            inviteUid: inviteMetadata.inviteUid,
                                            createdBy:
                                                inviteMetadata.currentUser
                                                    .identityHash,
                                        };
                                    }
                                }
                            }

                            const data: any =
                                await visualBuilderPostMessage?.send(
                                    VisualBuilderPostMessageEvents.COLLAB_CREATE_THREAD,
                                    { payload }
                                );

                            // response = {
                            //     notice: "discussion created successfully",
                            //     discussion: {
                            //         api_key: "blt05d58ee84d13fd72",
                            //         _content_type_uid: "page",
                            //         entry_uid: "blt1bbd1c10058a089d",
                            //         locale: "en-us",
                            //         status: 1,
                            //         uid: data?._id,
                            //         title: "Description-1736860796142",
                            //         field: {
                            //             uid: "description",
                            //             path: "sections.home.csdc2330a19d43171f.hero_section.description",
                            //             og_path:
                            //                 "sections.home.hero_section.description",
                            //         },
                            //         org_uid: "blt739e38d90d4fc4e6",
                            //         created_by: "blte26110c4ea641ed9",
                            //         created_at: data?.createdAt,
                            //     },
                            // };

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
