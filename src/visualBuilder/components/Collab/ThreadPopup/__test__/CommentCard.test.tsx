/** @jsxImportSource preact */
import { render, screen, waitFor } from "@testing-library/preact";
import CommentCard from "../CommentCard";
import { getUserName, formatDate } from "../../../../utils/collabUtils";
import { Mock } from "vitest";

vi.mock("../CommentTextArea", () => ({
    default: () => <div>Comment Text Area</div>,
}));
vi.mock("../CommentResolvedText", () => ({
    default: () => <div>Comment Resolved Text</div>,
}));
vi.mock("../CommentActionBar", () => ({
    default: () => <div>Comment Action Bar</div>,
}));
vi.mock("../loader/ThreadBody", () => ({
    default: () => <div>Loading...</div>,
}));

vi.mock("../../../../utils/collabUtils", async () => {
    const actual = (await import(
        "../../../../utils/collabUtils"
    )) as typeof import("../../../../utils/collabUtils");

    return {
        ...actual,
        getUserName: vi.fn(),
        formatDate: vi.fn(),
    };
});

const onClose: () => void = vi.fn();
const handleOnSaveRef = { current: vi.fn() };

const mockUserState = {
    userMap: {
        user1: {
            uid: "user1",
            email: "john.doe@example.com",
        },
    },
    currentUser: {
        uid: "user1",
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
        render(
            <CommentCard
                comment={mockCommentForLoading}
                userState={mockUserState}
                onClose={onClose}
                mode="view"
                handleOnSaveRef={handleOnSaveRef}
            />
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render comment details in view mode", async () => {
        (getUserName as Mock).mockReturnValue("John Doe");
        (formatDate as Mock).mockReturnValue("Jan 1, 2022, 12:00 PM");

        render(
            <CommentCard
                comment={mockComment}
                userState={mockUserState}
                onClose={onClose}
                mode="view"
                handleOnSaveRef={handleOnSaveRef}
            />
        );

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jan 1, 2022, 12:00 PM")).toBeInTheDocument();

        expect(screen.getByText("Comment Resolved Text")).toBeInTheDocument();
    });

    it("should render comment details in edit mode", async () => {
        (getUserName as Mock).mockReturnValue("John Doe");
        (formatDate as Mock).mockReturnValue("Jan 1, 2022, 12:00 PM");

        render(
            <CommentCard
                comment={mockComment}
                userState={mockUserState}
                onClose={onClose}
                mode="edit"
                handleOnSaveRef={handleOnSaveRef}
            />
        );

        expect(screen.getByText("John Doe")).toBeInTheDocument();

        expect(screen.getByText("Comment Text Area")).toBeInTheDocument();
    });

    it("should set the comment user correctly", async () => {
        (getUserName as Mock).mockReturnValue("John Doe");
        (formatDate as Mock).mockReturnValue("Jan 1, 2022, 12:00 PM");

        render(
            <CommentCard
                comment={mockComment}
                userState={mockUserState}
                onClose={onClose}
                mode="view"
                handleOnSaveRef={handleOnSaveRef}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });
});
