import { describe, test, expect, vi, beforeEach } from "vitest";
import { addLivePreviewQueryTags } from "../addLivePreviewQueryTags";
import { PublicLogger } from "../../logger/logger";

// Mock the logger
vi.mock("../../logger/logger", () => ({
    PublicLogger: {
        error: vi.fn(),
    },
}));

describe("addLivePreviewQueryTags", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("should return original URL when no live preview parameters in current location", () => {
        // This test works with current document.location (likely has no live preview params)
        const targetUrl = "http://example.com/target-page";
        
        const result = addLivePreviewQueryTags(targetUrl);
        
        // Should return unchanged since no live preview params in current location
        expect(result).toBe(targetUrl);
    });

    test("should log error and return original link when target URL is invalid", () => {
        const targetUrl = "not-a-valid-url-at-all-invalid";

        const result = addLivePreviewQueryTags(targetUrl);

        expect(PublicLogger.error).toHaveBeenCalledWith("Error while adding live preview to URL");
        expect(result).toBe(targetUrl);
    });

    test("should handle empty string input", () => {
        const targetUrl = "";

        const result = addLivePreviewQueryTags(targetUrl);

        expect(PublicLogger.error).toHaveBeenCalledWith("Error while adding live preview to URL");
        expect(result).toBe(targetUrl);
    });

    test("should handle malformed URLs gracefully", () => {
        const targetUrl = "http://";

        const result = addLivePreviewQueryTags(targetUrl);

        expect(PublicLogger.error).toHaveBeenCalledWith("Error while adding live preview to URL");
        expect(result).toBe(targetUrl);
    });

    test("should handle valid URLs without errors", () => {
        const targetUrl = "https://example.com/valid-page";

        const result = addLivePreviewQueryTags(targetUrl);

        // Should not throw errors and return some result
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    test("should add live preview query tags to URL with all required query parameters", () => {
        const originalUrl =
            "http://example.com?live_preview=hash&content_type_uid=ctuid&entry_uid=entryuid";
        const expectedUrl =
            "http://example.com/?live_preview=hash&content_type_uid=ctuid&entry_uid=entryuid";

        global.window = Object.create(window);
        Object.defineProperty(window, "location", {
            value: {
                href: originalUrl,
            },
            writable: true,
        });
        const result = addLivePreviewQueryTags(originalUrl);

        expect(result).toEqual(expectedUrl);
    });
});
