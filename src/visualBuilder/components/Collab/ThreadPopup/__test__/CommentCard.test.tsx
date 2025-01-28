/** @jsxImportSource preact */
import { render, screen, waitFor } from "@testing-library/preact";
import CommentCard from "../CommentCard";
import { getUserName } from "../../../../utils/collabUtils";
import { Mock } from "vitest";

// Mock necessary components and utilities
vi.mock("../CommentTextArea", () => ({
    default: () => <div>Comment Text Area</div>,
}));
vi.mock("../CommentResolvedText", () => ({
    default: () => <div>Comment Resolved Text</div>,
}));
vi.mock("../CommentActionBar", () => ({
    default: () => <div>Comment Action Bar</div>,
}));
vi.mock("../loader/threadBody", () => ({
    default: () => <div>Loading...</div>,
}));
vi.mock("../../../../utils/collabUtils", () => ({
    getUserName: vi.fn(),
}));

// Mock moment to control date formatting in tests
vi.mock("moment", () => {
    return {
        default: (date: any) => ({
            format: vi.fn().mockReturnValue("Jan 01, 2025, 12:00 PM"),
        }),
    };
});

// Dummy props for testing
const mockUserState = {
    userMap: {
        user1: {
            identityHash: "user1",
            email: "john.doe@example.com",
        },
    },
    currentUser: {
        identityHash: "user1",
        email: "jane.doe@example.com",
    },
    mentionsList: [],
};

const mockComment = {
    _id: "comment1",
    threadUid: "thread-1",
    message: "This is a comment",
    author: "jane.doe@example.com",
    toUsers: [],
    images: [],
    createdAt: "2022-01-01T12:00:00Z",
    createdBy: "user1",
};

describe("CommentCard", () => {
    it("should render loading state when comment user is not found", () => {
        const mockCommentForLoading = {
            _id: "comment1",
            threadUid: "thread-1",
            message: "This is a comment",
            author: "jane.doe@example.com",
            toUsers: [],
            images: [],
            createdAt: "2022-01-01T12:00:00Z",
            createdBy: "user2",
        };
        // Render the component with null comment
        render(
            <CommentCard
                comment={mockCommentForLoading}
                userState={mockUserState}
                mode="view"
                handleOnSaveRef={{ current: vi.fn() }}
            />
        );

        // Verify that the loader is shown
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render comment details in view mode", async () => {
        // Mock getUserName to return a name
        (getUserName as Mock).mockReturnValue("John Doe");

        // Render the component
        render(
            <CommentCard
                comment={mockComment}
                userState={mockUserState}
                mode="view"
                handleOnSaveRef={{ current: vi.fn() }}
            />
        );

        // Verify that user name and formatted date are displayed
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jan 01, 2025, 12:00 PM")).toBeInTheDocument();

        // Verify that CommentResolvedText is rendered
        expect(screen.getByText("Comment Resolved Text")).toBeInTheDocument();
    });

    it("should render comment details in edit mode", async () => {
        // Mock getUserName to return a name
        (getUserName as Mock).mockReturnValue("John Doe");

        // Render the component in edit mode
        render(
            <CommentCard
                comment={mockComment}
                userState={mockUserState}
                mode="edit"
                handleOnSaveRef={{ current: vi.fn() }}
            />
        );

        // Verify that user name is displayed
        expect(screen.getByText("John Doe")).toBeInTheDocument();

        // Verify that CommentTextArea is rendered
        expect(screen.getByText("Comment Text Area")).toBeInTheDocument();
    });

    it("should set the comment user correctly", async () => {
        // Mock getUserName to return a name
        (getUserName as Mock).mockReturnValue("John Doe");

        // Render the component with the mock comment
        render(
            <CommentCard
                comment={mockComment}
                userState={mockUserState}
                mode="view"
                handleOnSaveRef={{ current: vi.fn() }}
            />
        );

        // Wait for state update
        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });
});
