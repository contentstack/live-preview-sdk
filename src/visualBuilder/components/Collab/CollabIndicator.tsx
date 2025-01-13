/** @jsxImportSource preact */
import { visualBuilderStyles } from "../../visualBuilder.style";
import classNames from "classnames";
import React, { useState, useRef, useEffect } from "preact/compat";
import { css } from "goober";
import DiscussionPopup from "./DiscussionPopup";
import Config from "../../../configManager/configManager";

const generateRandomUID = (offset: number) =>
    `${offset}-${Math.random().toString(36).substring(2, 10)}`;
const mockLoadMoreMessages = (offset: number, limit: number) => {
    return Promise.resolve({
        count: 4,
        conversations: [
            {
                discussion_uid: "discussion-1",
                uid: `${offset}1`, // First comment fixed UID to perform update and delete
                to_users: [],
                to_roles: [],
                message:
                    "There are several images thats of higher dimensions. You might want to optimize the image.",
                entry_uid: "entry-1",
                locale: "en-US",
                created_at: new Date().toISOString(),
                created_by: "u3",
            },
            {
                discussion_uid: "discussion-1",
                uid: generateRandomUID(offset),
                to_users: [],
                to_roles: [],
                message: "Second comment",
                entry_uid: "entry-1",
                locale: "en-US",
                created_at: new Date().toISOString(),
                created_by: "u2",
            },
            {
                discussion_uid: "discussion-1",
                uid: generateRandomUID(offset),
                to_users: [],
                to_roles: [],
                message: "Third comment",
                entry_uid: "entry-1",
                locale: "en-US",
                created_at: new Date().toISOString(),
                created_by: "u2",
            },
            {
                discussion_uid: "discussion-1",
                uid: generateRandomUID(offset),
                to_users: [],
                to_roles: [],
                message: "Fourth comment",
                entry_uid: "entry-1",
                locale: "en-US",
                created_at: new Date().toISOString(),
                created_by: "u2",
            },
        ],
    });
};
const stackMetadata = {
    currentUser: {
        uid: "u3",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        username: "johndoe3",
        active: true,
    },
    users: [
        {
            uid: "u1",
            active: true,
            username: "johndoe",
            first_name: "John",
            last_name: "Doe",
            email: "john@example.com",
        },
        {
            uid: "u2",
            active: true,
            username: "janedoe",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@example.com",
        },
        {
            uid: "u3",
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            username: "johndoe3",
            active: true,
        },
        {
            uid: "u4",
            active: false,
            username: "janedoe",
            first_name: "Jane",
            last_name: "Doe",
            email: "jane@example.com",
        },
    ],
    roles: [
        {
            uid: "r1",
            name: "Admin",
        },
    ],
};

// Mock Data
const activeDiscussion = {
    uid: "discussion-1",
    title: "Test Discussion",
    field: {
        uid: "example",
        path: "path",
        og_path: "path",
    },
};

export interface ICollabIndicator {
    newThread?: boolean;
}

const CollabIndicator: React.FC<ICollabIndicator> = (props) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [showPopup, setShowPopup] = useState(props.newThread || false);
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
                            const response: any = {};
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
                        loadMoreMessages={mockLoadMoreMessages}
                        activeDiscussion={activeDiscussion}
                        setActiveDiscussion={() => {}}
                        createNewDiscussion={async () => {
                            const response: any = {};
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
