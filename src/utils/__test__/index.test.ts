import { PublicLogger } from "../../logger/logger";
import { addLivePreviewQueryTags, hasWindow } from "../index";

jest.mock("../../logger/logger", () => ({
    PublicLogger: {
        error: jest.fn(),
    },
}));

describe("hasWindow() function", () => {
    test("must check if window is available", () => {
        expect(hasWindow()).toBe(typeof window !== "undefined");
    });
});

describe("addLivePreviewQueryTags", () => {
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

    test("should log error and return original link if an error occurs while adding live preview query tags", () => {
        const originalUrl =
            "http://example.com?live_preview=hash&content_type_uid=ctuid&entry_uid=entryuid";
        const expectedLoggedError = "Error while adding live preview to URL";

        jest.spyOn(global, "URL").mockImplementation(() => {
            throw new Error("Mock error");
        });

        const result = addLivePreviewQueryTags(originalUrl);

        expect(PublicLogger.error).toHaveBeenCalledWith(expectedLoggedError);

        expect(result).toEqual(originalUrl);
    });
});
