/**
 * @vitest-environment jsdom
 */

import { renderHook } from "@testing-library/preact";
import { vi } from "vitest";
import { useCollabOperations } from "../useCollabOperations";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { removeCollabIcon } from "../../generators/generateThread";
import Config from "../../../configManager/configManager";
import { normalizePath } from "../../utils/collabUtils";

// Mock dependencies
vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
    },
}));

vi.mock("../../generators/generateThread", () => ({
    removeCollabIcon: vi.fn(),
}));

vi.mock("../../../configManager/configManager", () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

vi.mock("../../utils/collabUtils", () => ({
    normalizePath: vi.fn((path) => path),
}));

describe("useCollabOperations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (Config.get as any).mockReturnValue({
            collab: {
                isFeedbackMode: true,
            },
        });
    });

    describe("createComment", () => {
        it("should create a comment successfully", async () => {
            const mockResponse = {
                comment: {
                    _id: "comment-123",
                    message: "Test comment",
                },
            };

            (visualBuilderPostMessage?.send as any).mockResolvedValue(
                mockResponse
            );

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
                commentPayload: {
                    message: "Test comment",
                    toUsers: [],
                },
            };

            const response = await result.current.createComment(payload);

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_CREATE_COMMENT,
                payload
            );
            expect(response).toEqual(mockResponse);
        });

        it("should throw error when create comment fails", async () => {
            (visualBuilderPostMessage?.send as any).mockResolvedValue(null);

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
                commentPayload: {
                    message: "Test comment",
                    toUsers: [],
                },
            };

            await expect(
                result.current.createComment(payload)
            ).rejects.toThrow("Failed to create comment");
        });
    });

    describe("editComment", () => {
        it("should edit a comment successfully", async () => {
            const mockResponse = {
                comment: {
                    _id: "comment-123",
                    message: "Updated comment",
                },
            };

            (visualBuilderPostMessage?.send as any).mockResolvedValue(
                mockResponse
            );

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
                commentUid: "comment-123",
                payload: {
                    message: "Updated comment",
                    toUsers: [],
                },
            };

            const response = await result.current.editComment(payload);

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_EDIT_COMMENT,
                payload
            );
            expect(response).toEqual(mockResponse);
        });

        it("should throw error when edit comment fails", async () => {
            (visualBuilderPostMessage?.send as any).mockResolvedValue(null);

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
                commentUid: "comment-123",
                payload: {
                    message: "Updated comment",
                    toUsers: [],
                },
            };

            await expect(
                result.current.editComment(payload)
            ).rejects.toThrow("Failed to update comment");
        });
    });

    describe("deleteComment", () => {
        it("should delete a comment successfully", async () => {
            const mockResponse = {
                success: true,
            };

            (visualBuilderPostMessage?.send as any).mockResolvedValue(
                mockResponse
            );

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
                commentUid: "comment-123",
            };

            const response = await result.current.deleteComment(payload);

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_DELETE_COMMENT,
                payload
            );
            expect(response).toEqual(mockResponse);
        });

        it("should throw error when delete comment fails", async () => {
            (visualBuilderPostMessage?.send as any).mockResolvedValue(null);

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
                commentUid: "comment-123",
            };

            await expect(
                result.current.deleteComment(payload)
            ).rejects.toThrow("Failed to delete comment");
        });
    });

    describe("resolveThread", () => {
        it("should resolve a thread successfully", async () => {
            const mockResponse = {
                thread: {
                    _id: "thread-123",
                    resolved: true,
                },
            };

            (visualBuilderPostMessage?.send as any).mockResolvedValue(
                mockResponse
            );

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
            };

            const response = await result.current.resolveThread(payload);

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_RESOLVE_THREAD,
                payload
            );
            expect(response).toEqual(mockResponse);
        });

        it("should throw error when resolve thread fails", async () => {
            (visualBuilderPostMessage?.send as any).mockResolvedValue(null);

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
            };

            await expect(
                result.current.resolveThread(payload)
            ).rejects.toThrow("Failed to resolve thread");
        });
    });

    describe("fetchComments", () => {
        it("should fetch comments successfully", async () => {
            const mockResponse = {
                comments: [
                    { _id: "comment-1", message: "Comment 1" },
                    { _id: "comment-2", message: "Comment 2" },
                ],
            };

            (visualBuilderPostMessage?.send as any).mockResolvedValue(
                mockResponse
            );

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
                offset: 0,
                limit: 10,
            };

            const response = await result.current.fetchComments(payload);

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_FETCH_COMMENTS,
                payload
            );
            expect(response).toEqual(mockResponse);
        });
    });

    describe("createNewThread", () => {
        let mockButton: HTMLButtonElement;
        let mockParentDiv: HTMLDivElement;

        beforeEach(() => {
            mockButton = document.createElement("button");
            mockParentDiv = document.createElement("div");
            mockParentDiv.setAttribute("field-path", "test.field.path");
            mockParentDiv.setAttribute(
                "relative",
                "x: 100.5, y: 200.75"
            );
            mockParentDiv.appendChild(mockButton);
            document.body.appendChild(mockParentDiv);
        });

        afterEach(() => {
            document.body.innerHTML = "";
        });

        it("should create a new thread successfully", async () => {
            const mockResponse = {
                thread: {
                    _id: "thread-123",
                    elementXPath: "test.field.path",
                },
            };

            (visualBuilderPostMessage?.send as any).mockResolvedValue(
                mockResponse
            );

            const { result } = renderHook(() => useCollabOperations());

            const buttonRef = { current: mockButton };
            const inviteMetadata = {
                inviteUid: "invite-123",
                currentUser: {
                    uid: "user-123",
                    email: "user@example.com",
                },
            };

            const response = await result.current.createNewThread(
                buttonRef,
                inviteMetadata
            );

            expect(normalizePath).toHaveBeenCalledWith(
                window.location.pathname
            );
            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_CREATE_THREAD,
                expect.objectContaining({
                    elementXPath: "test.field.path",
                    position: { x: 100.5, y: 200.75 },
                    author: "user@example.com",
                    inviteUid: "invite-123",
                    createdBy: "user-123",
                })
            );
            expect(mockParentDiv.getAttribute("threaduid")).toBe("thread-123");
            expect(response).toEqual(mockResponse);
        });

        it("should throw error when button ref is null", async () => {
            const { result } = renderHook(() => useCollabOperations());

            const buttonRef = { current: null };
            const inviteMetadata = {
                inviteUid: "invite-123",
                currentUser: {
                    uid: "user-123",
                    email: "user@example.com",
                },
            };

            await expect(
                result.current.createNewThread(buttonRef, inviteMetadata)
            ).rejects.toThrow("Button ref not found");
        });

        it("should throw error when parent div is not found", async () => {
            const { result } = renderHook(() => useCollabOperations());

            const standaloneButton = document.createElement("button");
            const buttonRef = { current: standaloneButton };
            const inviteMetadata = {
                inviteUid: "invite-123",
                currentUser: {
                    uid: "user-123",
                    email: "user@example.com",
                },
            };

            await expect(
                result.current.createNewThread(buttonRef, inviteMetadata)
            ).rejects.toThrow("Count not find parent div");
        });

        it("should throw error when field-path is missing", async () => {
            // Keep field-path attribute but set it to empty string
            mockParentDiv.setAttribute("field-path", "");
            mockParentDiv.removeAttribute("relative");

            const { result } = renderHook(() => useCollabOperations());

            const buttonRef = { current: mockButton };
            const inviteMetadata = {
                inviteUid: "invite-123",
                currentUser: {
                    uid: "user-123",
                    email: "user@example.com",
                },
            };

            await expect(
                result.current.createNewThread(buttonRef, inviteMetadata)
            ).rejects.toThrow("Invalid field attributes");
        });

        it("should throw error when relative attribute is invalid", async () => {
            mockParentDiv.setAttribute("relative", "invalid");

            const { result } = renderHook(() => useCollabOperations());

            const buttonRef = { current: mockButton };
            const inviteMetadata = {
                inviteUid: "invite-123",
                currentUser: {
                    uid: "user-123",
                    email: "user@example.com",
                },
            };

            await expect(
                result.current.createNewThread(buttonRef, inviteMetadata)
            ).rejects.toThrow("Invalid relative attribute");
        });
    });

    describe("deleteThread", () => {
        it("should delete a thread successfully", async () => {
            const mockResponse = {
                success: true,
            };

            (visualBuilderPostMessage?.send as any).mockResolvedValue(
                mockResponse
            );
            (Config.get as any).mockReturnValue({
                collab: {
                    isFeedbackMode: false,
                },
            });

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
            };

            const response = await result.current.deleteThread(payload);

            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.COLLAB_DELETE_THREAD,
                payload
            );
            expect(removeCollabIcon).toHaveBeenCalledWith("thread-123");
            expect(Config.set).toHaveBeenCalledWith(
                "collab.isFeedbackMode",
                true
            );
            expect(response).toEqual(mockResponse);
        });

        it("should throw error when delete thread fails", async () => {
            (visualBuilderPostMessage?.send as any).mockResolvedValue(null);

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
            };

            await expect(
                result.current.deleteThread(payload)
            ).rejects.toThrow("Failed to delete thread");
        });

        it("should not set isFeedbackMode when already true", async () => {
            const mockResponse = {
                success: true,
            };

            (visualBuilderPostMessage?.send as any).mockResolvedValue(
                mockResponse
            );
            (Config.get as any).mockReturnValue({
                collab: {
                    isFeedbackMode: true,
                },
            });

            const { result } = renderHook(() => useCollabOperations());

            const payload = {
                threadUid: "thread-123",
            };

            await result.current.deleteThread(payload);

            expect(Config.set).not.toHaveBeenCalled();
        });
    });
});

