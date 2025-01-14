/** @jsxImportSource preact */
import { visualBuilderStyles } from "../../visualBuilder.style";
import classNames from "classnames";
import React, { useState, useRef, useEffect } from "preact/compat";
import { css } from "goober";
import DiscussionPopup from "./DiscussionPopup";
import Config from "../../../configManager/configManager";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";

const stackMetadata = {
    currentUser: {
        uid: "blte26110c4ea641ed9",
        first_name: "Om",
        last_name: "Prakash",
        email: "om.prakash@contentstack.com",
        username: "Om Prakash",
        active: true,
    },
    users: [
        {
            uid: "blte26110c4ea641ed9",
            active: true,
            username: "Om Prakash",
            first_name: "Om",
            last_name: "Prakash",
            email: "om.prakash@contentstack.com",
        },
    ],
    roles: [
        {
            uid: "r1",
            name: "Admin",
        },
    ],
    invite: {
        id: "123456789",
    },
};

export interface ICollabIndicator {
    newThread?: boolean;
    activeDiscussion?: { uid: string; [key: string]: any }; // Add more fields as per your structure
}

const CollabIndicator: React.FC<ICollabIndicator> = (props) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const [showPopup, setShowPopup] = useState(props.newThread || false);

    // Set initial state based on props
    const [activeDiscussion, setActiveDiscussion] = useState(
        props.newThread
            ? { uid: "new" }
            : props.activeDiscussion || { uid: "new" }
    );

    // Update activeDiscussion when props.activeDiscussion changes
    useEffect(() => {
        if (props.activeDiscussion) {
            setActiveDiscussion(props.activeDiscussion);
        }
    }, [props.activeDiscussion]);

    console.log("CollabIndicator -> activeDiscussion", activeDiscussion);

    const config = Config.get();

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
                {!showPopup && "1"}
            </button>
            {showPopup && (
                <div
                    ref={popupRef}
                    className={classNames("collab-popup", popupClass)}
                >
                    <DiscussionPopup
                        onCreateComment={async (payload) => {
                            const data: any =
                                await visualBuilderPostMessage?.send(
                                    VisualBuilderPostMessageEvents.COLLAB_CREATE_COMMENT,
                                    { payload }
                                );

                            const response = {
                                notice: "conversation created successfully",
                                conversation: {
                                    uid: data._id,
                                    discussion_uid: data.threadId,
                                    entry_uid: "blt1bbd1c10058a089d",
                                    locale: "en-us",
                                    message: data.message,
                                    to_users: [],
                                    to_roles: [],
                                    created_at: data.createdAt,
                                    created_by: "blte26110c4ea641ed9",
                                    deleted_at: false,
                                },
                            };
                            return response;
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
                        stackMetadata={stackMetadata}
                        loadMoreMessages={async (offset, limit) => {
                            let payload = {
                                threadID: activeDiscussion?.uid,
                                offset,
                                limit,
                            };
                            const data: any =
                                await visualBuilderPostMessage?.send(
                                    VisualBuilderPostMessageEvents.COLLAB_FETCH_COMMENTS,
                                    { payload }
                                );

                            const response = {
                                count: data.length,
                                conversations: data.map((item: any) => ({
                                    uid: item._id,
                                    discussion_uid: item.threadId,
                                    entry_uid: "blt1bbd1c10058a089d",
                                    locale: "en-us",
                                    message: item.message,
                                    to_users: [],
                                    to_roles: [],
                                    created_at: item.createdAt,
                                    created_by: "blte26110c4ea641ed9",
                                    deleted_at: false,
                                })),
                            };
                            return response;
                        }}
                        activeDiscussion={activeDiscussion}
                        setActiveDiscussion={setActiveDiscussion}
                        createNewDiscussion={async () => {
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
                                            author: stackMetadata.currentUser
                                                .email,
                                            pageRoute: "/",
                                            inviteId: stackMetadata.invite.id,
                                        };
                                    }
                                }
                            }

                            const data: any =
                                await visualBuilderPostMessage?.send(
                                    VisualBuilderPostMessageEvents.COLLAB_CREATE_THREAD,
                                    { payload }
                                );

                            response = {
                                notice: "discussion created successfully",
                                discussion: {
                                    api_key: "blt05d58ee84d13fd72",
                                    _content_type_uid: "page",
                                    entry_uid: "blt1bbd1c10058a089d",
                                    locale: "en-us",
                                    status: 1,
                                    uid: data?._id,
                                    title: "Description-1736860796142",
                                    field: {
                                        uid: "description",
                                        path: "sections.home.csdc2330a19d43171f.hero_section.description",
                                        og_path:
                                            "sections.home.hero_section.description",
                                    },
                                    org_uid: "blt739e38d90d4fc4e6",
                                    created_by: "blte26110c4ea641ed9",
                                    created_at: data?.createdAt,
                                },
                            };

                            return response;
                        }}
                    />
                    ;
                </div>
            )}
        </>
    );
};

export default CollabIndicator;
