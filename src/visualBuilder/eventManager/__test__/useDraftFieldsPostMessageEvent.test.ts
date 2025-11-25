/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useDraftFieldsPostMessageEvent } from "../useDraftFieldsPostMessageEvent";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { visualBuilderStyles } from "../../visualBuilder.style";

// Mock dependencies
vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        on: vi.fn(),
    },
}));

vi.mock("../../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn(() => ({
        "visual-builder__draft-field": "visual-builder__draft-field",
    })),
}));

describe("useDraftFieldsPostMessageEvent", () => {
    let mockOn: ReturnType<typeof vi.fn>;
    let element1: HTMLElement;
    let element2: HTMLElement;

    beforeEach(() => {
        vi.clearAllMocks();
        mockOn = vi.fn();
        (visualBuilderPostMessage as any).on = mockOn;

        // Create mock elements with data-cslp attributes
        element1 = document.createElement("div");
        element1.setAttribute("data-cslp", "field1");
        document.body.appendChild(element1);

        element2 = document.createElement("div");
        element2.setAttribute("data-cslp", "field2");
        document.body.appendChild(element2);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("should register event listeners for SHOW_DRAFT_FIELDS and REMOVE_DRAFT_FIELDS", () => {
        useDraftFieldsPostMessageEvent();

        expect(mockOn).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.SHOW_DRAFT_FIELDS,
            expect.any(Function)
        );
        expect(mockOn).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.REMOVE_DRAFT_FIELDS,
            expect.any(Function)
        );
    });

    it("should add draft field class to elements when SHOW_DRAFT_FIELDS is triggered", () => {
        useDraftFieldsPostMessageEvent();

        const showHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] === VisualBuilderPostMessageEvents.SHOW_DRAFT_FIELDS
        )[1];

        showHandler({
            data: {
                fields: ["field1", "field2"],
            },
        });

        expect(element1.classList.contains("visual-builder__draft-field")).toBe(
            true
        );
        expect(element2.classList.contains("visual-builder__draft-field")).toBe(
            true
        );
    });

    it("should remove draft field class from all elements when REMOVE_DRAFT_FIELDS is triggered", () => {
        // First add the class
        element1.classList.add("visual-builder__draft-field");
        element2.classList.add("visual-builder__draft-field");

        useDraftFieldsPostMessageEvent();

        const removeHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] === VisualBuilderPostMessageEvents.REMOVE_DRAFT_FIELDS
        )[1];

        removeHandler({});

        expect(element1.classList.contains("visual-builder__draft-field")).toBe(
            false
        );
        expect(element2.classList.contains("visual-builder__draft-field")).toBe(
            false
        );
    });

    it("should remove existing draft field classes before adding new ones", () => {
        // Add class to element1 first
        element1.classList.add("visual-builder__draft-field");

        useDraftFieldsPostMessageEvent();

        const showHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] === VisualBuilderPostMessageEvents.SHOW_DRAFT_FIELDS
        )[1];

        // Show only field2
        showHandler({
            data: {
                fields: ["field2"],
            },
        });

        expect(element1.classList.contains("visual-builder__draft-field")).toBe(
            false
        );
        expect(element2.classList.contains("visual-builder__draft-field")).toBe(
            true
        );
    });

    it("should not add class to non-existent fields", () => {
        useDraftFieldsPostMessageEvent();

        const showHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] === VisualBuilderPostMessageEvents.SHOW_DRAFT_FIELDS
        )[1];

        showHandler({
            data: {
                fields: ["non_existent_field"],
            },
        });

        expect(element1.classList.contains("visual-builder__draft-field")).toBe(
            false
        );
        expect(element2.classList.contains("visual-builder__draft-field")).toBe(
            false
        );
    });

    it("should handle empty fields array", () => {
        useDraftFieldsPostMessageEvent();

        const showHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] === VisualBuilderPostMessageEvents.SHOW_DRAFT_FIELDS
        )[1];

        // First add classes
        element1.classList.add("visual-builder__draft-field");
        element2.classList.add("visual-builder__draft-field");

        showHandler({
            data: {
                fields: [],
            },
        });

        // Should remove all classes when fields array is empty
        expect(element1.classList.contains("visual-builder__draft-field")).toBe(
            false
        );
        expect(element2.classList.contains("visual-builder__draft-field")).toBe(
            false
        );
    });

    it("should handle duplicate fields in array", () => {
        useDraftFieldsPostMessageEvent();

        const showHandler = mockOn.mock.calls.find(
            (call) =>
                call[0] === VisualBuilderPostMessageEvents.SHOW_DRAFT_FIELDS
        )[1];

        showHandler({
            data: {
                fields: ["field1", "field1", "field2"],
            },
        });

        // Should still work correctly with duplicates
        expect(element1.classList.contains("visual-builder__draft-field")).toBe(
            true
        );
        expect(element2.classList.contains("visual-builder__draft-field")).toBe(
            true
        );
    });
});

