/** @jsxImportSource preact */
import { render } from "preact";
import CollabIndicator from "../components/CollabIndicator";
import DiscussionPopup from "../components/Collab/DiscussionPopup";

const highlighCommentOffset = 30;

const generateRandomUID = (offset: number) =>
    `${offset}-${Math.random().toString(36).substring(2, 10)}`;
const mockLoadMoreMessages = (offset: number, limit: number) => {
    return Promise.resolve({
        count: 10,
        conversations: [
            {
                discussion_uid: "discussion-1",
                uid: `${offset}1`, // First comment fixed UID to perform update and delete
                to_users: [],
                to_roles: [],
                message: "First comment",
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
            {
                discussion_uid: "discussion-1",
                uid: generateRandomUID(offset),
                to_users: [],
                to_roles: [],
                message: "Fifth comment",
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
                message: "Sixth comment",
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
                message: "Seventh comment",
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
                message: "Eighth comment",
                entry_uid: "entry-1",
                locale: "en-US",
                created_at: new Date().toISOString(),
                created_by: "u1",
            },
            {
                discussion_uid: "discussion-1",
                uid: generateRandomUID(offset),
                to_users: [],
                to_roles: [],
                message: "Ninth comment",
                entry_uid: "entry-1",
                locale: "en-US",
                created_at: new Date().toISOString(),
                created_by: "u1",
            },
            {
                discussion_uid: "discussion-1",
                uid: generateRandomUID(offset),
                to_users: [],
                to_roles: [],
                message: "Tenth comment",
                entry_uid: "entry-1",
                locale: "en-US",
                created_at: new Date().toISOString(),
                created_by: "u1",
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

export function generateThread(payload: any): void {
    const { relativeX, relativeY, xpath } = payload;

    const element = getElementByXpath(xpath);
    if (!element) {
        console.error("Element not found for the given XPath:", xpath);
        return;
    }
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY + relativeY * rect.height;
    const left = rect.left + window.scrollX + relativeX * rect.width;

    const popupContainer = document.createElement("div");
    popupContainer.setAttribute("field-path", xpath);
    popupContainer.setAttribute("relative", `x: ${relativeX}, y: ${relativeY}`);
    popupContainer.style.position = "absolute";
    popupContainer.style.top = `${top - highlighCommentOffset}px`;
    popupContainer.style.left = `${left - highlighCommentOffset}px`;
    popupContainer.style.zIndex = "1000";
    popupContainer.style.cursor = "pointer";
    popupContainer.className = "collab-thread";

    // render(<CollabIndicator />, popupContainer);

    // render(
    //     <FeedbackPopup
    //         name="Richton Wins"
    //         message="There are several images that are of higher dimensions. You might want to optimize the image."
    //         onClose={() => {}}
    //     />,
    //     popupContainer
    // );

    // render(
    //     <div className={styles}>{formatCommentDate(new Date())}</div>,
    //     popupContainer
    // );

    render(
        <DiscussionPopup
            onCreateComment={async (payload) => {
                // Implement the function to return ICommentResponse
                const response: any = {
                    // populate the response object with appropriate values
                };
                return response;
            }}
            onEditComment={async (payload) => {
                // Implement the function to return ICommentResponse
                const response: any = {
                    // populate the response object with appropriate values
                };
                return response;
            }}
            onDeleteComment={async (payload) => {
                // Implement the function to return ICommentResponse
                const response: any = {
                    // populate the response object with appropriate values
                };
                return response;
            }}
            onClose={async () => {
                // Implement the function to handle close event
                const response: any = {
                    // populate the response object with appropriate values
                };
                return response;
            }}
            onResolve={async (payload) => {
                // Implement the function to return ICommentResponse
                const response: any = {
                    // populate the response object with appropriate values
                };
                return response;
            }}
            stackMetadata={stackMetadata}
            loadMoreMessages={mockLoadMoreMessages}
            activeDiscussion={activeDiscussion}
            setActiveDiscussion={() => {
                // Implement the function to set active discussion
            }}
            createNewDiscussion={async () => {
                // Implement the function to create new discussion
                const response: any = {
                    // populate the response object with appropriate values
                };
                return response;
            }}
        />,
        popupContainer
    );

    const visualBuilderContainer = document.querySelector(
        ".visual-builder__container"
    );
    if (visualBuilderContainer) {
        let highlightCommentWrapper = visualBuilderContainer.querySelector(
            ".visual-builder__collab-wrapper"
        );
        if (!highlightCommentWrapper) {
            highlightCommentWrapper = document.createElement("div");
            highlightCommentWrapper.className =
                "visual-builder__collab-wrapper";
            visualBuilderContainer.appendChild(highlightCommentWrapper);
        }
        highlightCommentWrapper.appendChild(popupContainer);
    } else {
        document.body.appendChild(popupContainer);
    }
}

export function updateCollabIconPosition() {
    const icons = document.querySelectorAll(".collab-thread");

    icons.forEach((icon) => {
        if (icon && icon instanceof HTMLElement) {
            const path = icon.getAttribute("field-path");
            const relative = icon.getAttribute("relative");

            if (!path || !relative) {
                console.error("Missing field-path or relative attribute.");
                return;
            }

            const match = relative.match(/x: ([\d.]+), y: ([\d.]+)/);
            if (!match) {
                console.error("Invalid relative attribute format.");
                return;
            }
            const relativeX = parseFloat(match[1]);
            const relativeY = parseFloat(match[2]);

            const targetElement = getElementByXpath(path);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const x = rect.left + rect.width * relativeX + window.scrollX;
                const y = rect.top + rect.height * relativeY + window.scrollY;

                icon.style.top = `${y - highlighCommentOffset}px`;
                icon.style.left = `${x - highlighCommentOffset}px`;
            }
        }
    });
}

function getElementByXpath(xpath: string): HTMLElement | null {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue as HTMLElement | null;
}
