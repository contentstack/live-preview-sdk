/**
 * @vitest-environment jsdom
 */

import { renderHook } from "@testing-library/preact";
import { vi } from "vitest";
import useDynamicTextareaRows from "../useDynamicTextareaRows";

describe("useDynamicTextareaRows", () => {
    let textarea: HTMLTextAreaElement;

    beforeEach(() => {
        textarea = document.createElement("textarea");
        textarea.className = "test-textarea";
        textarea.setAttribute("rows", "1");
        document.body.appendChild(textarea);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("should set rows to expandedRows when dependency has content", () => {
        renderHook(() =>
            useDynamicTextareaRows(".test-textarea", "some text", 1, 3)
        );

        expect(textarea.getAttribute("rows")).toBe("3");
    });

    it("should set rows to defaultRows when dependency is empty", () => {
        renderHook(() => useDynamicTextareaRows(".test-textarea", "", 1, 3));

        expect(textarea.getAttribute("rows")).toBe("1");
    });

    it("should update rows when dependency changes", () => {
        const { rerender } = renderHook(
            ({ dependency }) =>
                useDynamicTextareaRows(".test-textarea", dependency, 1, 3),
            {
                initialProps: { dependency: "" },
            }
        );

        expect(textarea.getAttribute("rows")).toBe("1");

        rerender({ dependency: "new text" });

        expect(textarea.getAttribute("rows")).toBe("3");

        rerender({ dependency: "" });

        expect(textarea.getAttribute("rows")).toBe("1");
    });

    it("should use custom defaultRows and expandedRows", () => {
        renderHook(() =>
            useDynamicTextareaRows(".test-textarea", "text", 2, 5)
        );

        expect(textarea.getAttribute("rows")).toBe("5");
    });

    it("should reset to defaultRows on cleanup", () => {
        const { unmount } = renderHook(() =>
            useDynamicTextareaRows(".test-textarea", "some text", 1, 3)
        );

        expect(textarea.getAttribute("rows")).toBe("3");

        unmount();

        expect(textarea.getAttribute("rows")).toBe("1");
    });

    it("should handle when textarea is not found", () => {
        const consoleSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        renderHook(() => useDynamicTextareaRows(".non-existent", "text", 1, 3));

        // Should not throw error, just silently fail
        expect(consoleSpy).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it("should handle multiple textareas with same selector", () => {
        const textarea2 = document.createElement("textarea");
        textarea2.className = "test-textarea";
        textarea2.setAttribute("rows", "1");
        document.body.appendChild(textarea2);

        renderHook(() =>
            useDynamicTextareaRows(".test-textarea", "text", 1, 3)
        );

        // querySelector returns first match, so only first textarea is updated
        expect(textarea.getAttribute("rows")).toBe("3");
        // Second textarea is not updated because querySelector only returns first match
        expect(textarea2.getAttribute("rows")).toBe("1");
    });
});
