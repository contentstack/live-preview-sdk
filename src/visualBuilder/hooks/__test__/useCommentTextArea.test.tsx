/**
 * @vitest-environment jsdom
 */

/** @jsxImportSource preact */
import { renderHook, act, waitFor } from "@testing-library/preact";
import { vi } from "vitest";
import React from "preact/compat";
import { useCommentTextArea } from "../useCommentTextArea";
import { ThreadProvider } from "../../components/Collab/ThreadPopup/ContextProvider";
import {
    validateCommentAndMentions,
    filterOutInvalidMentions,
    getMessageWithDisplayName,
    getUserName,
    getCommentBody,
} from "../../utils/collabUtils";
import { collabStyles } from "../../collab.style";
import { maxMessageLength } from "../../utils/constants";

// Mock dependencies
vi.mock("../../utils/collabUtils", () => ({
    validateCommentAndMentions: vi.fn(() => ""),
    filterOutInvalidMentions: vi.fn((message, toUsers) => ({
        toUsers: toUsers.filter((u: any) => message.includes(u.display)),
    })),
    getMessageWithDisplayName: vi.fn((comment) => comment?.message || ""),
    getUserName: vi.fn((user) => user.display || user.email),
    getCommentBody: vi.fn((state) => ({
        message: state.message,
        toUsers: state.toUsers?.map((u: any) => u.id) || [],
        images: state.images || [],
        createdBy: state.createdBy,
        author: state.author,
    })),
}));

vi.mock("../../collab.style", () => ({
    collabStyles: vi.fn(() => ({
        "collab-thread-body--input--textarea--focus": "focus-class",
        "collab-thread-body--input--textarea--hover": "hover-class",
    })),
}));

vi.mock("../useDynamicTextareaRows", () => ({
    default: vi.fn(),
}));

describe("useCommentTextArea", () => {
    let mockContextValue: any;
    let mockOnClose: any;
    let mockUserState: any;
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
        vi.clearAllMocks();

        textarea = document.createElement("textarea");
        textarea.id = "collab-thread-body--input--textarea";
        document.body.appendChild(textarea);

        mockOnClose = vi.fn();
        mockUserState = {
            userMap: {
                user1: {
                    uid: "user1",
                    email: "user1@example.com",
                    display: "User One",
                },
                user2: {
                    uid: "user2",
                    email: "user2@example.com",
                    display: "User Two",
                },
            },
            currentUser: {
                uid: "user1",
                email: "user1@example.com",
                display: "User One",
            },
            mentionsList: [
                {
                    uid: "user1",
                    email: "user1@example.com",
                    display: "User One",
                },
                {
                    uid: "user2",
                    email: "user2@example.com",
                    display: "User Two",
                },
            ],
        };

        mockContextValue = {
            error: { hasError: false, message: "" },
            setError: vi.fn(),
            onCreateComment: vi.fn().mockResolvedValue({
                comment: {
                    _id: "comment-123",
                    message: "Test comment",
                },
            }),
            onEditComment: vi.fn().mockResolvedValue({
                comment: {
                    _id: "comment-123",
                    message: "Updated comment",
                },
            }),
            editComment: "",
            setThreadState: vi.fn(),
            activeThread: { _id: "new" },
            setActiveThread: vi.fn(),
            createNewThread: vi.fn().mockResolvedValue({
                thread: { _id: "thread-123" },
            }),
        };
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    const renderHookWithProvider = (props: {
        userState?: any;
        comment?: any;
        onClose?: any;
        contextValue?: any;
    }) => {
        const {
            userState = mockUserState,
            comment = null,
            onClose = mockOnClose,
            contextValue = mockContextValue,
        } = props;

        const wrapper = ({ children }: any) => (
            <ThreadProvider.Provider value={contextValue}>
                {children}
            </ThreadProvider.Provider>
        );

        return renderHook(
            () => useCommentTextArea(userState, comment, onClose),
            { wrapper }
        );
    };

    it("should initialize with empty state", () => {
        const { result } = renderHookWithProvider({});

        expect(result.current.state.message).toBe("");
        expect(result.current.state.toUsers).toEqual([]);
        expect(result.current.showSuggestions).toBe(false);
        expect(mockContextValue.setError).toHaveBeenCalled();
    });

    it("should initialize state from comment when provided", () => {
        const comment = {
            _id: "comment-123",
            message: "Test comment",
            toUsers: ["user1"],
            images: [],
            createdBy: "user1",
            author: "user1@example.com",
        };

        const { result } = renderHookWithProvider({ comment });

        expect(getMessageWithDisplayName).toHaveBeenCalledWith(
            comment,
            mockUserState,
            "text"
        );
        expect(result.current.state.message).toBeDefined();
    });

    it("should handle input change, show suggestions, and validate", () => {
        const { result } = renderHookWithProvider({});

        act(() => {
            result.current.inputRef.current = textarea;
        });

        act(() => {
            result.current.handleInputChange({
                target: {
                    value: "Hello @User",
                    selectionStart: 12,
                },
            } as any);
        });

        expect(validateCommentAndMentions).toHaveBeenCalled();
        expect(result.current.state.message).toBe("Hello @User");
        expect(result.current.showSuggestions).toBe(true);
        expect(result.current.filteredUsers.length).toBeGreaterThan(0);
    });

    it("should handle keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)", () => {
        const { result } = renderHookWithProvider({});

        act(() => {
            result.current.inputRef.current = textarea;
            Object.defineProperty(textarea, "selectionStart", {
                value: 7,
                writable: true,
            });
        });

        act(() => {
            result.current.handleInputChange({
                target: {
                    value: "Hello @",
                    selectionStart: 7,
                },
            } as any);
        });

        expect(result.current.showSuggestions).toBe(true);

        // ArrowDown
        act(() => {
            result.current.handleKeyDown({
                key: "ArrowDown",
                preventDefault: vi.fn(),
                target: textarea,
            } as any);
        });
        expect(result.current.selectedIndex).toBe(1);

        // ArrowUp
        act(() => {
            result.current.handleKeyDown({
                key: "ArrowUp",
                preventDefault: vi.fn(),
                target: textarea,
            } as any);
        });
        expect(result.current.selectedIndex).toBe(0);

        // Enter - inserts mention
        act(() => {
            result.current.handleKeyDown({
                key: "Enter",
                preventDefault: vi.fn(),
                target: textarea,
            } as any);
        });
        expect(result.current.showSuggestions).toBe(false);

        // Escape - closes suggestions
        act(() => {
            result.current.handleInputChange({
                target: {
                    value: "Hello @",
                    selectionStart: 7,
                },
            } as any);
        });
        act(() => {
            result.current.handleKeyDown({
                key: "Escape",
                target: textarea,
            } as any);
        });
        expect(result.current.showSuggestions).toBe(false);
    });

    it("should insert mention when insertMention is called", () => {
        const { result } = renderHookWithProvider({});

        act(() => {
            result.current.inputRef.current = textarea;
            Object.defineProperty(textarea, "selectionStart", {
                value: 12,
                writable: true,
            });
        });

        act(() => {
            result.current.setState({
                message: "Hello @User",
                toUsers: [],
                images: [],
                createdBy: "",
                author: "",
            });
        });

        const user = mockUserState.mentionsList[0];

        act(() => {
            result.current.insertMention(user);
        });

        expect(result.current.showSuggestions).toBe(false);
        expect(result.current.state.message).toContain("@User One");
    });

    it("should handle submit - create new comment", async () => {
        const { result } = renderHookWithProvider({});

        mockContextValue.setError.mockImplementation((error: any) => {
            mockContextValue.error = error;
        });
        mockContextValue.error = { hasError: false, message: "" };

        act(() => {
            result.current.setState({
                message: "Test comment",
                toUsers: [],
                images: [],
                createdBy: "",
                author: "",
            });
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockContextValue.onCreateComment).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalledWith(false);
    });

    it("should handle submit - edit existing comment", async () => {
        const comment = {
            _id: "comment-123",
            message: "Original comment",
            toUsers: [],
            images: [],
            createdBy: "user1",
            author: "user1@example.com",
        };

        mockContextValue.editComment = "comment-123";
        mockContextValue.error = { hasError: false, message: "" };

        const { result } = renderHookWithProvider({ comment });

        act(() => {
            result.current.setState({
                message: "Updated comment",
                toUsers: [],
                images: [],
                createdBy: "user1",
                author: "user1@example.com",
            });
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockContextValue.onEditComment).toHaveBeenCalled();
        expect(mockContextValue.setThreadState).toHaveBeenCalled();
    });

    it("should create new thread when activeThread is new", async () => {
        mockContextValue.activeThread = { _id: "new" };
        mockContextValue.error = { hasError: false, message: "" };

        const { result } = renderHookWithProvider({});

        act(() => {
            result.current.setState({
                message: "New comment",
                toUsers: [],
                images: [],
                createdBy: "",
                author: "",
            });
        });

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockContextValue.createNewThread).toHaveBeenCalled();
        expect(mockContextValue.setActiveThread).toHaveBeenCalled();
    });

    it("should not submit when there is an error", async () => {
        mockContextValue.error = { hasError: true, message: "Error message" };

        const { result } = renderHookWithProvider({});

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(mockContextValue.onCreateComment).not.toHaveBeenCalled();
    });

    it("should handle textarea focus and hover events", async () => {
        renderHookWithProvider({});

        act(() => {
            textarea.dispatchEvent(new Event("focus"));
            textarea.dispatchEvent(new Event("mouseenter"));
        });

        await waitFor(() => {
            expect(textarea.classList.contains("collab-thread-body--input--textarea--focus")).toBe(true);
            expect(textarea.classList.contains("collab-thread-body--input--textarea--hover")).toBe(true);
        });

        act(() => {
            textarea.dispatchEvent(new Event("blur"));
            textarea.dispatchEvent(new Event("mouseleave"));
        });

        await waitFor(() => {
            expect(textarea.classList.contains("collab-thread-body--input--textarea--focus")).toBe(false);
            expect(textarea.classList.contains("collab-thread-body--input--textarea--hover")).toBe(false);
        });
    });
});
