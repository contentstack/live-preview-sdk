/** @jsxImportSource preact */
import { render, fireEvent, waitFor, screen } from "@testing-library/preact";
import {
    IFetchComments,
    IInviteMetadata,
} from "../../../../types/collab.types";
import { vi } from "vitest";
import {
    IThreadBody,
    IThreadHeader,
    IThreadFooter,
} from "../../../../types/collab.types";

vi.mock("../ThreadHeader", () => ({
    default: ({
        onClose,
        onResolve,
        displayResolve,
        commentCount,
    }: IThreadHeader) => (
        <div data-testid="mock-thread-header">
            <button
                data-testid="collab-thread-resolve-btn"
                onClick={() =>
                    onResolve({
                        threadUid: "thread-1",
                        payload: { threadState: 2 },
                    })
                }
            >
                Resolve
            </button>
            <button data-testid="thread-close-btn" onClick={() => onClose()}>
                Close
            </button>
            <span data-testid="comment-count">{commentCount}</span>
        </div>
    ),
}));

vi.mock("../ThreadBody", () => ({
    default: ({
        comments,
        handleOnSaveRef,
        editComment,
        userState,
        onClose,
    }: IThreadBody) => (
        <div data-testid="mock-thread-body">
            <div id="collab-thread-comment--list">
                {comments.map((comment) => (
                    <div
                        key={comment._id}
                        className="collab-thread-comment--wrapper"
                    >
                        <div className="collab-thread-comment--user-details">
                            <div>{comment.author}</div>

                            {comment.createdBy ===
                                userState.currentUser.uid && (
                                <div className="action-buttons">
                                    <button data-testid="collab-thread-comment-edit">
                                        Edit
                                    </button>
                                    <button data-testid="collab-thread-comment-delete">
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="collab-thread-comment--message">
                            {comment.message}
                        </div>
                    </div>
                ))}
            </div>
            <textarea data-testid="comment-textarea" />
        </div>
    ),
}));

vi.mock("../ThreadFooter", () => ({
    default: ({
        handleOnSaveRef,
        onClose,
        isDisabled,
        editComment,
    }: IThreadFooter) => {
        const onSubmit = async (event: any) => {
            event.preventDefault();
            await handleOnSaveRef.current?.();
        };

        return (
            <div
                className="collab-thread-footer--wrapper flex-v-center"
                data-testid="mock-thread-footer"
            >
                <div className="button-group">
                    <button
                        data-testid="thread-cancel-btn"
                        onClick={() => onClose(false)}
                    >
                        Cancel
                    </button>
                    <button
                        data-testid="thread-save-btn"
                        onClick={onSubmit}
                        disabled={isDisabled}
                    >
                        {editComment === "" ? "Post" : "Update"}
                    </button>
                </div>
                <span>Add New Feedback</span>
            </div>
        );
    },
}));

import ThreadPopup from "..";

const mockOnCreateComment = vi.fn();
const mockOnEditComment = vi.fn();
const mockOnDeleteComment = vi.fn();
const mockOnDeleteThread = vi.fn();
const mockOnClose = vi.fn();
const mockOnResolve = vi.fn();

const generateRandomUID = (offset: number) =>
    `${offset}-${Math.random().toString(36).substring(2, 10)}`;

const mockLoadMoreMessages = vi.fn((data: IFetchComments) => {
    const { offset, limit, threadUid } = data;
    return Promise.resolve({
        count: 10,
        comments: [
            {
                threadUid: threadUid,
                _id: `${offset}1`, // First comment fixed UID to perform update and delete
                toUsers: [],
                images: [],
                message: "First comment",
                author: "john.doe@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u3",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Second comment",
                author: "jane@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u2",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Third comment",
                author: "jane@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u2",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Fourth comment",
                author: "jane@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u2",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Fifth comment",
                author: "jane@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u2",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Sixth comment",
                author: "jane@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u2",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Seventh comment",
                author: "jane@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u2",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Eight comment",
                author: "john@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u1",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Ninth comment",
                author: "john@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u1",
            },
            {
                threadUid: threadUid,
                _id: generateRandomUID(offset),
                toUsers: [],
                images: [],
                message: "Tenth comment",
                author: "john@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u1",
            },
        ],
    });
});

const mockCreateNewThread = vi.fn().mockResolvedValue({});

const inviteMetadata: IInviteMetadata = {
    currentUser: {
        uid: "u3",
        email: "john.doe@example.com",
    },
    users: [
        {
            uid: "u1",
            email: "john@example.com",
        },
        {
            uid: "u2",
            email: "jane@example.com",
        },
        {
            uid: "u3",
            email: "john.doe@example.com",
        },
    ],
    inviteUid: "invite-1",
};

const mockActiveThread = {
    _id: "thread-1",
    author: "john.doe@example.com",
    inviteUid: "invite-1",
    position: {
        x: 10,
        y: 20,
    },
    elementXPath: "/html/body/div[1]",
    isElementPresent: true,
    pageRoute: "/",
    createdBy: "u3",
    sequenceNumber: 1,
    threadState: 1,
    createdAt: new Date().toISOString(),
};

const commentId = "01";

const renderComponent = (props = {}) =>
    render(
        <ThreadPopup
            onCreateComment={mockOnCreateComment}
            onEditComment={mockOnEditComment}
            onDeleteComment={mockOnDeleteComment}
            onDeleteThread={mockOnDeleteThread}
            onClose={mockOnClose}
            onResolve={mockOnResolve}
            inviteMetadata={inviteMetadata}
            loadMoreMessages={mockLoadMoreMessages}
            activeThread={mockActiveThread}
            setActiveThread={vi.fn()}
            createNewThread={mockCreateNewThread}
            {...props}
        />
    );

describe("ThreadPopup Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the component correctly", async () => {
        const { container } = renderComponent();
        const elements = {
            saveButton: screen.getByTestId("thread-save-btn"),
            cancelButton: screen.getByTestId("thread-cancel-btn"),
            threadWrapper: container.getElementsByClassName(
                "collab-thread--wrapper"
            )[0],
            addNewText: screen.getByText("Add New Feedback"),
        };

        expect(elements.threadWrapper).toBeInTheDocument();
        expect(elements.saveButton).toBeInTheDocument();
        expect(elements.cancelButton).toBeInTheDocument();
        expect(elements.addNewText).toBeInTheDocument();
    });

    it("fetches initial messages on mount", async () => {
        renderComponent();
        await waitFor(() => {
            expect(mockLoadMoreMessages).toHaveBeenCalledWith({
                offset: 0,
                limit: 10,
                threadUid: "thread-1",
            });
        });
    });

    it("calls onResolve when resolving a thread", async () => {
        renderComponent();

        const resolveThreadPayload = {
            threadUid: "thread-1",
            payload: {
                threadState: 2,
            },
        };

        const resolveButton = screen.getByTestId("collab-thread-resolve-btn");
        if (resolveButton) {
            fireEvent.click(resolveButton);
        } else {
            throw new Error("Resolve btn not found");
        }

        await waitFor(() => {
            expect(mockOnResolve).toHaveBeenCalledWith(resolveThreadPayload);
        });
    });

    it("loads more messages when scrolling", async () => {
        const { container, getByText } = renderComponent();
        await waitFor(() => {
            expect(mockLoadMoreMessages).toHaveBeenCalledWith({
                offset: 0,
                limit: 10,
                threadUid: "thread-1",
            });
        });

        await waitFor(() =>
            expect(getByText("First comment")).toBeInTheDocument()
        );

        const scrollContainer = await waitFor(
            () =>
                container.querySelector(
                    "#collab-thread-comment--list"
                ) as HTMLElement
        );

        expect(scrollContainer).toBeInTheDocument();

        fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } });

        await waitFor(() => {
            expect(mockLoadMoreMessages).toHaveBeenCalledWith({
                offset: 0,
                limit: 10,
                threadUid: "thread-1",
            });
        });
    });
});
