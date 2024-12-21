import { describe, it, expect, vi } from "vitest";
import { insertSpaceAtCursor } from "../insertSpaceAtCursor";
import { unicodeNonBreakingSpace } from "../constants";

describe("insertSpaceAtCursor", () => {
    // Mock setup to simulate browser selection behavior
    const setupMockSelection = (initialContent = "") => {
        const element = document.createElement("div");
        element.textContent = initialContent;

        // Mock window.getSelection
        const mockSelection = {
            rangeCount: 1,
            getRangeAt: vi.fn(),
            removeAllRanges: vi.fn(),
            addRange: vi.fn(),
        };

        // Mock Range object
        const mockRange = {
            deleteContents: vi.fn(),
            insertNode: vi.fn(),
            setStartAfter: vi.fn(),
            setEndAfter: vi.fn(),
        };

        vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as any);
        mockSelection.getRangeAt.mockReturnValue(mockRange);

        return { element, mockSelection, mockRange };
    };

    it("should insert a non-breaking space when selection exists", () => {
        const { element, mockSelection, mockRange } =
            setupMockSelection("Hello World");

        insertSpaceAtCursor(element);

        // Verify that space node was created and inserted
        expect(mockRange.deleteContents).toHaveBeenCalled();
        expect(mockRange.insertNode).toHaveBeenCalledWith(
            expect.objectContaining({
                nodeType: Node.TEXT_NODE,
                textContent: unicodeNonBreakingSpace,
            })
        );
        expect(mockRange.setStartAfter).toHaveBeenCalled();
        expect(mockRange.setEndAfter).toHaveBeenCalled();
        expect(mockSelection.removeAllRanges).toHaveBeenCalled();
        expect(mockSelection.addRange).toHaveBeenCalled();
    });

    it("should do nothing if no selection exists", () => {
        const { element, mockSelection } = setupMockSelection();

        // Simulate no ranges
        mockSelection.rangeCount = 0;

        // Should handle this case without throwing
        expect(() => insertSpaceAtCursor(element)).not.toThrow();
    });

    it("should replace existing selection with non-breaking space", () => {
        const { element, mockRange } = setupMockSelection("Selected Text");

        insertSpaceAtCursor(element);

        // Verify that existing content is deleted before inserting space
        expect(mockRange.deleteContents).toHaveBeenCalled();
    });

    // Edge case: Test with different types of elements
    it.each(["button", "div", "span", "p", "textarea"])(
        "should work with %s element",
        (tagName) => {
            const element = document.createElement(tagName);
            const { mockRange } = setupMockSelection();

            insertSpaceAtCursor(element);

            // Basic verification that insertion process was attempted
            expect(mockRange.insertNode).toHaveBeenCalled();
        }
    );
});
