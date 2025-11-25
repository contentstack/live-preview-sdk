/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useHighlightCommentIcon } from "../useHighlightCommentIcon";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import {
    highlightCommentIconOnCanvas,
    removeAllHighlightedCommentIcons,
} from "../../generators/generateHighlightedComment";

// Mock dependencies
vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        on: vi.fn(),
    },
}));

vi.mock("../../generators/generateHighlightedComment", () => ({
    highlightCommentIconOnCanvas: vi.fn(),
    removeAllHighlightedCommentIcons: vi.fn(),
}));

describe("useHighlightCommentIcon", () => {
    let mockOn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockOn = vi.fn();
        (visualBuilderPostMessage as any).on = mockOn;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should register event listeners for HIGHLIGHT_ACTIVE_COMMENTS and REMOVE_HIGHLIGHTED_COMMENTS", () => {
        useHighlightCommentIcon();

        expect(mockOn).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.HIGHLIGHT_ACTIVE_COMMENTS,
            expect.any(Function)
        );
        expect(mockOn).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.REMOVE_HIGHLIGHTED_COMMENTS,
            expect.any(Function)
        );
    });

    it("should call highlightCommentIconOnCanvas when HIGHLIGHT_ACTIVE_COMMENTS is triggered", () => {
        useHighlightCommentIcon();

        const highlightHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] ===
                VisualBuilderPostMessageEvents.HIGHLIGHT_ACTIVE_COMMENTS
        )[1];

        const mockPayload = [
            {
                fieldMetadata: {
                    content_type_uid: "test_uid",
                    entry_uid: "test_entry",
                    locale: "en-us",
                    fieldPath: "test_field",
                },
                fieldSchema: {
                    uid: "test_uid",
                    display_name: "Test Field",
                    data_type: "text",
                },
                discussion: {
                    id: "discussion_1",
                },
                absolutePath: "test_path",
            },
        ];

        highlightHandler({
            data: {
                payload: mockPayload,
            },
        });

        expect(highlightCommentIconOnCanvas).toHaveBeenCalledWith(mockPayload);
    });

    it("should call removeAllHighlightedCommentIcons when REMOVE_HIGHLIGHTED_COMMENTS is triggered", () => {
        useHighlightCommentIcon();

        const removeHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] ===
                VisualBuilderPostMessageEvents.REMOVE_HIGHLIGHTED_COMMENTS
        )[1];

        removeHandler({});

        expect(removeAllHighlightedCommentIcons).toHaveBeenCalled();
    });

    it("should handle empty payload array", () => {
        useHighlightCommentIcon();

        const highlightHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] ===
                VisualBuilderPostMessageEvents.HIGHLIGHT_ACTIVE_COMMENTS
        )[1];

        highlightHandler({
            data: {
                payload: [],
            },
        });

        expect(highlightCommentIconOnCanvas).toHaveBeenCalledWith([]);
    });
});

