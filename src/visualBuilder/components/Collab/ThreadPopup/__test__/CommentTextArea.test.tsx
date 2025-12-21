/** @jsxImportSource preact */
import { render, screen, fireEvent } from "@testing-library/preact";
import CommentTextArea from "../CommentTextArea";
import { useCommentTextArea } from "../../../../hooks/useCommentTextArea";
import { Mock } from "vitest";
import React from "preact/compat";
import classNames from "classnames";

// Mock dependencies
vi.mock("../../../../hooks/useCommentTextArea");
vi.mock("../Tooltip/Tooltip", () => ({
    default: ({ children, content }) => (
        <div data-tooltip={content}>{children}</div>
    ),
}));
vi.mock("../../../../collab.style", () => ({
    collabStyles: () => ({
        "collab-thread-input-indicator--error": "mocked-error-class",
        "collab-thread-input-indicator--count": "mocked-count-class",
        "collab-thread-body--input--wrapper": "mocked-wrapper-class",
        "collab-thread-body--input": "mocked-input-class",
        "collab-thread-body--input--textarea--wrapper":
            "mocked-textarea-wrapper-class",
        "collab-thread-body--input--textarea": "mocked-textarea-class",
        "collab-thread-body--input--textarea--suggestionsList":
            "mocked-suggestions-list-class",
        "collab-thread-body--input--textarea--suggestionsList--item":
            "mocked-suggestion-item-class",
        "collab-thread-body--input--textarea--suggestionsList--item-selected":
            "mocked-selected-item-class",
        "collab-thread-input-indicator--wrapper":
            "mocked-indicator-wrapper-class",
    }),
    flexAlignCenter: "flex-align-center-class",
}));

const mockUserState = {
    userMap: {
        user1: {
            uid: "user1",
            email: "john.doe@example.com",
        },
    },
    currentUser: {
        uid: "user1",
        email: "john.doe@example.com",
    },
    mentionsList: [
        {
            uid: "user1",
            email: "john.doe@example.com",
            display: "John Doe",
        },
        {
            uid: "user2",
            email: "jane.smith@example.com",
            display: "Jane Smith",
        },
    ],
};

const mockComment = {
    _id: "comment1",
    threadUid: "thread-1",
    message: "This is a comment",
    author: "john.doe@example.com",
    toUsers: [],
    images: [],
    createdAt: "2022-01-01T12:00:00Z",
    createdBy: "user1",
};

const mockHandleOnSaveRef = { current: vi.fn() };
const mockOnClose = vi.fn();

// Mock implementation of useCommentTextArea hook
const setupMockHook = (overrides = {}) => {
    const defaultMock = {
        state: { message: "Test message" },
        error: { message: "" },
        showSuggestions: false,
        cursorPosition: { top: 20, showAbove: false },
        selectedIndex: 0,
        filteredUsers: [],
        inputRef: { current: null },
        listRef: { current: null },
        itemRefs: { current: [] },
        handleInputChange: vi.fn(),
        handleKeyDown: vi.fn(),
        handleSubmit: vi.fn(),
        insertMention: vi.fn(),
        maxMessageLength: 1000,
    };

    const mockImplementation = { ...defaultMock, ...overrides };
    (useCommentTextArea as Mock).mockReturnValue(mockImplementation);
    return mockImplementation;
};

describe("CommentTextArea", () => {
    beforeEach(() => {
        setupMockHook();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render the textarea with correct placeholder", () => {
        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        // Use a more reliable query that doesn't depend on exact placeholder text
        const textarea = screen.getByRole("textbox");
        expect(textarea).toBeInTheDocument();

        // Check if placeholder contains the expected text without worrying about exact quotes
        const placeholder = textarea.getAttribute("placeholder");
        expect(placeholder).toContain("Enter a comment or tag others using");
        expect(placeholder).toContain("@");
    });

    it("should set handleOnSaveRef.current to handleSubmit from the hook", () => {
        const mockHook = setupMockHook();
        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        expect(mockHandleOnSaveRef.current).toBe(mockHook.handleSubmit);
    });

    it("should call handleInputChange when typing in textarea", () => {
        const mockHook = setupMockHook();
        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        const textarea = screen.getByRole("textbox");
        fireEvent.change(textarea, { target: { value: "New text" } });

        expect(mockHook.handleInputChange).toHaveBeenCalled();
    });

    it("should call handleKeyDown when pressing keys in textarea", () => {
        const mockHook = setupMockHook();
        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        const textarea = screen.getByRole("textbox");
        fireEvent.keyDown(textarea, { key: "Enter" });

        expect(mockHook.handleKeyDown).toHaveBeenCalled();
    });

    it("should display error message when there is an error", () => {
        setupMockHook({ error: { message: "Error message" } });
        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText("Error message")).toBeInTheDocument();
    });

    it("should display character counter with correct values", () => {
        setupMockHook({ state: { message: "Hello" }, maxMessageLength: 100 });
        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText("5/100")).toBeInTheDocument();
    });

    it("should render MentionSuggestionsList when showSuggestions is true", () => {
        setupMockHook({
            showSuggestions: true,
            filteredUsers: [
                {
                    uid: "user1",
                    email: "john@example.com",
                    display: "John Doe",
                },
                {
                    uid: "user2",
                    email: "jane@example.com",
                    display: "Jane Smith",
                },
            ],
            selectedIndex: 0,
        });

        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("should not render MentionSuggestionsList when showSuggestions is false", () => {
        setupMockHook({
            showSuggestions: false,
            filteredUsers: [
                {
                    uid: "user1",
                    email: "john@example.com",
                    display: "John Doe",
                },
                {
                    uid: "user2",
                    email: "jane@example.com",
                    display: "Jane Smith",
                },
            ],
        });

        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
});

// Test sub-components individually
describe("ErrorIndicator", () => {
    it("should render error message", () => {
        // We can access the ErrorIndicator through the CommentTextArea component
        setupMockHook({ error: { message: "Test error message" } });
        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText("Test error message")).toBeInTheDocument();
    });
});

describe("CharacterCounter", () => {
    it("should display current and max length", () => {
        setupMockHook({ state: { message: "Test" }, maxMessageLength: 50 });
        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText("4/50")).toBeInTheDocument();
    });
});

describe("MentionSuggestionsList", () => {
    it("should display filtered users and highlight the selected one", () => {
        setupMockHook({
            showSuggestions: true,
            filteredUsers: [
                {
                    uid: "user1",
                    email: "john@example.com",
                    display: "John Doe",
                },
                {
                    uid: "user2",
                    email: "jane@example.com",
                    display: "Jane Smith",
                },
            ],
            selectedIndex: 1,
        });

        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        const selectedItem = screen.getByText("Jane Smith").closest("li");
        expect(selectedItem).toHaveAttribute("aria-selected", "true");
    });

    it("should truncate long display names", () => {
        setupMockHook({
            showSuggestions: true,
            filteredUsers: [
                {
                    uid: "user3",
                    email: "very.long.email@example.com",
                    display: "Very Long Name That Should Be Truncated",
                },
            ],
            selectedIndex: 0,
        });

        render(
            <CommentTextArea
                userState={mockUserState}
                handleOnSaveRef={mockHandleOnSaveRef}
                comment={mockComment}
                onClose={mockOnClose}
            />
        );

        // Use a more flexible approach to find truncated text
        const truncatedTextElement = screen.getByText((content, element) => {
            return (
                content.includes("Very Long Name") &&
                content.includes("...") &&
                element.tagName.toLowerCase() !== "html" &&
                element.tagName.toLowerCase() !== "body"
            );
        });

        expect(truncatedTextElement).toBeInTheDocument();
    });
});
