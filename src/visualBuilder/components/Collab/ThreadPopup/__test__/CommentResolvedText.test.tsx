/** @jsxImportSource preact */
import { render, screen } from "@testing-library/preact";
import CommentResolvedText from "../CommentResolvedText";
import {
    getMessageWithDisplayName,
    sanitizeData,
} from "../../../../utils/collabUtils";
import { IUserState } from "../../../../types/collab.types";
import { Mock } from "vitest";

// Mock the utility functions
vi.mock("../../../../utils/collabUtils", () => ({
    getMessageWithDisplayName: vi.fn(),
    sanitizeData: vi.fn(),
}));

// Dummy props
const mockUserState: IUserState = {
    userMap: {
        user3: {
            uid: "user3",
            email: "john.doe@example.com",
        },
    },
    currentUser: {
        uid: "user3",
        email: "jane.doe@example.com",
    },
    mentionsList: [],
};

const mockComment = {
    _id: "comment1",
    threadUid: "thread-1",
    message: "Hello {{user1}}",
    author: "jane.doe@example.com",
    toUsers: ["user1"],
    images: [],
    createdAt: new Date().toISOString(),
    createdBy: "user2",
};

describe("CommentResolvedText", () => {
    it("should render the sanitized comment with display names", () => {
        // Mock the return value of getMessageWithDisplayName
        const sanitizedHtml = "Hello <b>@John Doe</b>";
        (getMessageWithDisplayName as unknown as Mock).mockReturnValue(
            sanitizedHtml
        );

        // Render the component with mock props
        render(
            <CommentResolvedText
                comment={mockComment}
                userState={mockUserState}
            />
        );

        // Expect getMessageWithDisplayName to have been called with proper arguments
        expect(getMessageWithDisplayName).toHaveBeenCalledWith(
            mockComment,
            mockUserState,
            "html"
        );

        // Verify the component renders the sanitized HTML correctly
        const messageElement = screen.getByTestId(
            "collab-thread-comment--message"
        );
        expect(messageElement).toBeInTheDocument();
        expect(messageElement.innerHTML).toBe(sanitizedHtml);
    });
});
