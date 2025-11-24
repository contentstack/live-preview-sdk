import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { handlePageTraversal } from "../handlePageTraversal";

describe("handlePageTraversal", () => {
    let mockPostMessage: any;
    let mockAddEventListener: any;
    let unloadHandler: (event: Event) => void;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock postMessage
        mockPostMessage = vi.fn();
        global.window.parent = {
            postMessage: mockPostMessage,
        } as any;

        // Mock addEventListener to capture the unload handler
        mockAddEventListener = vi.fn((event, handler) => {
            if (event === "unload") {
                unloadHandler = handler;
            }
        });

        global.window.addEventListener = mockAddEventListener;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should add unload event listener when function is called", () => {
        handlePageTraversal();

        expect(mockAddEventListener).toHaveBeenCalledWith(
            "unload",
            expect.any(Function)
        );
    });

    describe("when activeElement is an anchor element", () => {
        test("should post message with targetURL when href is truthy", () => {
            handlePageTraversal();

            const mockAnchor = {
                href: "https://example.com/target-page",
            } as HTMLAnchorElement;

            Object.defineProperty(document, "activeElement", {
                value: mockAnchor,
                writable: true,
                configurable: true,
            });

            unloadHandler(new Event("unload"));

            expect(mockPostMessage).toHaveBeenCalledWith(
                {
                    from: "live-preview",
                    type: "url-change",
                    data: {
                        targetURL: "https://example.com/target-page",
                    },
                },
                "*"
            );
        });

        test("should handle various URL formats (relative, query params, hash, combined)", () => {
            handlePageTraversal();

            const testCases = [
                "/relative/path",
                "https://example.com/page?param=value&other=test",
                "https://example.com/page#section",
                "https://example.com/page?param=value#section",
            ];

            testCases.forEach((url) => {
                vi.clearAllMocks();
                const mockAnchor = {
                    href: url,
                } as HTMLAnchorElement;

                Object.defineProperty(document, "activeElement", {
                    value: mockAnchor,
                    writable: true,
                    configurable: true,
                });

                unloadHandler(new Event("unload"));

                expect(mockPostMessage).toHaveBeenCalledWith(
                    {
                        from: "live-preview",
                        type: "url-change",
                        data: {
                            targetURL: url,
                        },
                    },
                    "*"
                );
            });
        });

        test("should not post message when href is falsy", () => {
            handlePageTraversal();

            const falsyValues = ["", null, undefined];

            falsyValues.forEach((href) => {
                vi.clearAllMocks();
                const mockAnchor = {
                    href,
                } as HTMLAnchorElement;

                Object.defineProperty(document, "activeElement", {
                    value: mockAnchor,
                    writable: true,
                    configurable: true,
                });

                unloadHandler(new Event("unload"));

                expect(mockPostMessage).not.toHaveBeenCalled();
            });
        });
    });

    describe("when activeElement is not an anchor element", () => {
        test("should not post message for non-anchor elements", () => {
            handlePageTraversal();

            const testCases = [
                document.createElement("button"),
                document.createElement("div"),
                document.createElement("input"),
            ];

            testCases.forEach((element) => {
                vi.clearAllMocks();
                Object.defineProperty(document, "activeElement", {
                    value: element,
                    writable: true,
                    configurable: true,
                });

                unloadHandler(new Event("unload"));

                expect(mockPostMessage).not.toHaveBeenCalled();
            });
        });

        test("should throw error when activeElement is null or undefined", () => {
            handlePageTraversal();

            const testCases = [null, undefined];

            testCases.forEach((value) => {
                Object.defineProperty(document, "activeElement", {
                    value,
                    writable: true,
                    configurable: true,
                });

                expect(() => {
                    unloadHandler(new Event("unload"));
                }).toThrow();
            });
        });
    });
});
