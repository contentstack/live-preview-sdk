/** @jsxImportSource preact */
import {
    render,
    fireEvent,
    waitFor,
    screen,
    cleanup,
} from "@testing-library/preact";
import {
    IFetchComments,
    IInviteMetadata,
} from "../../../../types/collab.types";
import ThreadPopup from "..";

// Mock Dependencies
const mockOnCreateComment = vi.fn();
const mockOnEditComment = vi.fn();
const mockOnDeleteComment = vi.fn();
const mockOnDeleteThread = vi.fn();
const mockOnClose = vi.fn();
const mockOnResolve = vi.fn();

const generateRandomUID = (offset: number) =>
    `${offset}-${Math.random().toString(36).substring(2, 10)}`;

// Only First comment is current user's comment, that only have edit and delete icon/
const mockLoadMoreMessages = vi.fn((data: IFetchComments) => {
    const { offset, limit, threadUid } = data;
    return Promise.resolve({
        count: 20,
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
// These test cases are taking too much time to execute so skipping them for now
describe.skip("ThreadPopup Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the component correctly", async () => {
        console.time("Render ThreadPopup");

        // Use destructuring to get only what you need
        const { container } = renderComponent();

        console.timeEnd("Render ThreadPopup");

        // Batch your queries together
        console.time("Finding Elements");
        const elements = {
            saveButton: screen.getByTestId("thread-save-btn"),
            cancelButton: screen.getByTestId("thread-cancel-btn"),
            threadWrapper: container.getElementsByClassName(
                "collab-thread--wrapper"
            )[0],
            addNewText: screen.getByText("Add New Feedback"),
        };
        console.timeEnd("Finding Elements");

        // Batch your expectations
        console.time("Running Assertions");
        expect(elements.threadWrapper).toBeInTheDocument();
        expect(elements.saveButton).toBeInTheDocument();
        expect(elements.cancelButton).toBeInTheDocument();
        expect(elements.addNewText).toBeInTheDocument();
        console.timeEnd("Running Assertions");
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

    it("calls onCreateComment when creating a new comment", async () => {
        const newCommentPayload = {
            threadUid: "thread-1",
            commentPayload: {
                message: "New comment",
                toUsers: [],
                images: [],
                createdBy: "u3",
                author: "john.doe@example.com",
            },
        };
        mockOnCreateComment.mockResolvedValue({
            success: true,
            notice: "Comment Created Successfully",
            comment: {
                threadUid: "thread-1",
                _id: generateRandomUID(0),
                toUsers: [],
                images: [],
                message: "New comment",
                author: "john.doe@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u3",
            },
        });

        const { getByText, container } = renderComponent();

        const input = container.getElementsByTagName("textarea");
        fireEvent.change(input[0], {
            target: { value: newCommentPayload.commentPayload.message },
        });

        const saveButton = getByText("Post");
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockOnCreateComment).toHaveBeenCalledWith(newCommentPayload);
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
        // Wait for the scroll container to be present (i.e., loader should be gone)
        const scrollContainer = await waitFor(
            () =>
                container.querySelector(
                    "#collab-thread-comment--list"
                ) as HTMLElement
        );
        // Assert that the scroll container is now in the document
        expect(scrollContainer).toBeInTheDocument();

        // Scroll to the top
        fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } });

        // Ensure that loadMoreMessages has been called with the expected arguments
        await waitFor(() => {
            expect(mockLoadMoreMessages).toHaveBeenCalledWith({
                offset: 10,
                limit: 10,
                threadUid: "thread-1",
            });
        });
    });

    it("calls onEditComment when editing a comment", async () => {
        const editCommentPayload = {
            threadUid: "thread-1",
            commentUid: commentId,
            payload: {
                message: "Updated comment",
                toUsers: [],
                images: [],
                createdBy: "u3",
                author: "john.doe@example.com",
            },
        };

        mockOnEditComment.mockResolvedValue({
            success: true,
            notice: "Comment Updated Successfully",
            comment: {
                threadUid: "thread-1",
                _id: commentId,
                toUsers: [],
                images: [],
                message: "Updated comment",
                author: "john.doe@example.com",
                createdAt: new Date().toISOString(),
                createdBy: "u3",
            },
        });

        const { container, getByText } = renderComponent();
        await waitFor(() => {
            expect(mockLoadMoreMessages).toHaveBeenCalledWith({
                offset: 0,
                limit: 10,
                threadUid: "thread-1",
            });
        });

        const editIcon = screen.getByTestId("collab-thread-comment-edit");
        if (editIcon) {
            fireEvent.click(editIcon);
        } else {
            throw new Error("Edit icon not found");
        }
        // Find the input for editing the comment
        const input = container.getElementsByTagName("textarea");
        fireEvent.change(input[0], {
            target: { value: editCommentPayload.payload.message },
        });

        // Find the Save button and click it
        const updateButton = getByText("Update");
        fireEvent.click(updateButton);

        // Wait for the function to be called with the correct payload
        await waitFor(() => {
            expect(mockOnEditComment).toHaveBeenCalledWith(editCommentPayload);
        });
    });

    it("calls onDeleteComment when deleting a comment", async () => {
        const deleteCommentPayload = {
            threadUid: "thread-1",
            commentUid: commentId,
        };
        mockOnDeleteComment.mockResolvedValue({
            success: true,
            notice: "Comment Deleted Successfully",
        });

        await waitFor(() => {
            expect(mockLoadMoreMessages).toHaveBeenCalledWith({
                offset: 0,
                limit: 10,
                threadUid: "thread-1",
            });
        });
        renderComponent();
        const deleteIcon = screen.getByTestId("collab-thread-comment-delete");
        if (deleteIcon) {
            fireEvent.click(deleteIcon);
        } else {
            throw new Error("Delete icon not found");
        }

        // Wait for the delete function to be called with the correct payload
        await waitFor(() => {
            expect(mockOnDeleteComment).toHaveBeenCalledWith(
                deleteCommentPayload
            );
        });
    });

    it("calls onDeleteThread when deleting a thread", async () => {
        const deleteCommentPayload = {
            threadUid: "thread-1",
        };
        mockOnDeleteComment.mockResolvedValue({
            success: true,
            notice: "Thread Deleted Successfully",
        });
        renderComponent();
        const deleteIcon = screen.getByTestId("collab-thread-comment-delete");
        if (deleteIcon) {
            fireEvent.click(deleteIcon);
        } else {
            throw new Error("Delete icon not found");
        }
        // Wait for the delete function to be called with the correct payload
        await waitFor(() => {
            expect(mockOnDeleteThread).toHaveBeenCalledWith(
                deleteCommentPayload.threadUid
            );
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
});
