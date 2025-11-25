/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useScrollToField } from "../useScrollToField";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";

// Mock dependencies
vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        on: vi.fn(),
    },
}));

describe("useScrollToField", () => {
    let mockOn: ReturnType<typeof vi.fn>;
    let mockElement: HTMLElement;

    beforeEach(() => {
        vi.clearAllMocks();
        mockOn = vi.fn();
        (visualBuilderPostMessage as any).on = mockOn;

        // Create a mock element with data-cslp attribute
        mockElement = document.createElement("div");
        mockElement.setAttribute(
            "data-cslp",
            "content_type_uid.entry_uid.locale.path"
        );
        document.body.appendChild(mockElement);

        // Mock scrollIntoView
        mockElement.scrollIntoView = vi.fn();
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("should register event listener for SCROLL_TO_FIELD", () => {
        useScrollToField();

        expect(mockOn).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.SCROLL_TO_FIELD,
            expect.any(Function)
        );
    });

    it("should scroll to element when event is triggered with matching cslp", () => {
        useScrollToField();

        const handler = mockOn.mock.calls[0][1];
        handler({
            data: {
                cslpData: {
                    content_type_uid: "content_type_uid",
                    entry_uid: "entry_uid",
                    locale: "locale",
                    path: "path",
                },
            },
        });

        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "center",
        });
    });

    it("should not scroll if element is not found", () => {
        useScrollToField();

        const handler = mockOn.mock.calls[0][1];
        handler({
            data: {
                cslpData: {
                    content_type_uid: "non_existent",
                    entry_uid: "non_existent",
                    locale: "non_existent",
                    path: "non_existent",
                },
            },
        });

        expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
    });

    it("should handle empty string values in cslpData", () => {
        useScrollToField();

        const handler = mockOn.mock.calls[0][1];
        handler({
            data: {
                cslpData: {
                    content_type_uid: "",
                    entry_uid: "",
                    locale: "",
                    path: "",
                },
            },
        });

        // Should generate cslpValue "..." and not find element
        expect(mockElement.scrollIntoView).not.toHaveBeenCalled();
    });

    it("should construct cslpValue correctly from event data", () => {
        useScrollToField();

        const handler = mockOn.mock.calls[0][1];
        const testElement = document.createElement("div");
        testElement.setAttribute("data-cslp", "type1.entry1.locale1.path1");
        document.body.appendChild(testElement);
        testElement.scrollIntoView = vi.fn();

        handler({
            data: {
                cslpData: {
                    content_type_uid: "type1",
                    entry_uid: "entry1",
                    locale: "locale1",
                    path: "path1",
                },
            },
        });

        expect(testElement.scrollIntoView).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "center",
        });

        testElement.remove();
    });
});

