import { hasWindow, addParamsToUrl } from "../index";
import { vi } from "vitest";

// Mock addLivePreviewQueryTags function
vi.mock("../addLivePreviewQueryTags", () => ({
    addLivePreviewQueryTags: vi.fn()
}));

// Import the mocked function after setting up the mock
import { addLivePreviewQueryTags } from "../addLivePreviewQueryTags";

describe("hasWindow() function", () => {
    test("must check if window is available", () => {
        expect(hasWindow()).toBe(typeof window !== "undefined");
    });
});


describe("addParamsToUrl", () => {
    let mockAddEventListener: any;
    let mockDocument: any;
    let clickHandler: (event: any) => void;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        
        // Mock window.addEventListener to capture the click handler
        mockAddEventListener = vi.fn((event, handler) => {
            if (event === "click") {
                clickHandler = handler;
            }
        });
        
        // Setup mock return value for addLivePreviewQueryTags
        vi.mocked(addLivePreviewQueryTags).mockImplementation((url) => `${url}?live_preview=test&content_type_uid=test&entry_uid=test`);
        
        // Mock document and window
        mockDocument = {
            location: {
                origin: "https://example.com"
            }
        };

        global.window = {
            addEventListener: mockAddEventListener,
            document: mockDocument
        } as any;
        
        global.document = mockDocument as any;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should add event listener when function is called", () => {
        addParamsToUrl();
        
        expect(mockAddEventListener).toHaveBeenCalledWith("click", expect.any(Function));
    });

    describe("when clicking on elements", () => {
        beforeEach(() => {
            addParamsToUrl();
        });

        test("should handle click directly on anchor tag", () => {
            // Create mock anchor element
            const mockAnchor = {
                href: "https://example.com/page",
                closest: vi.fn().mockReturnValue(null),
                contains: vi.fn().mockReturnValue(true)
            };
            mockAnchor.closest.mockReturnValue(mockAnchor); // closest('a') returns self
            
            const mockEvent = {
                target: mockAnchor
            };

            // Trigger the click event
            clickHandler(mockEvent);

            expect(mockAnchor.closest).toHaveBeenCalledWith('a');
            expect(mockAnchor.contains).toHaveBeenCalledWith(mockAnchor);
            expect(addLivePreviewQueryTags).toHaveBeenCalledWith("https://example.com/page");
            expect(mockAnchor.href).toBe("https://example.com/page?live_preview=test&content_type_uid=test&entry_uid=test");
        });

        test("should handle click on child element of anchor tag", () => {
            // Create mock child element and parent anchor
            const mockChild = {
                closest: vi.fn()
            };
            
            const mockAnchor = {
                href: "https://example.com/child-page",
                contains: vi.fn().mockReturnValue(true)
            };
            
            mockChild.closest.mockReturnValue(mockAnchor); // closest('a') returns parent anchor
            
            const mockEvent = {
                target: mockChild
            };

            // Trigger the click event
            clickHandler(mockEvent);

            expect(mockChild.closest).toHaveBeenCalledWith('a');
            expect(mockAnchor.contains).toHaveBeenCalledWith(mockChild);
            expect(addLivePreviewQueryTags).toHaveBeenCalledWith("https://example.com/child-page");
            expect(mockAnchor.href).toBe("https://example.com/child-page?live_preview=test&content_type_uid=test&entry_uid=test");
        });

        test("should not process click when no anchor element is found", () => {
            const mockElement = {
                closest: vi.fn().mockReturnValue(null)
            };
            
            const mockEvent = {
                target: mockElement
            };

            clickHandler(mockEvent);

            expect(mockElement.closest).toHaveBeenCalledWith('a');
            expect(addLivePreviewQueryTags).not.toHaveBeenCalled();
        });

        test("should not process click when anchor doesn't contain clicked element", () => {
            const mockChild = {
                closest: vi.fn()
            };
            
            const mockAnchor = {
                href: "https://example.com/page",
                contains: vi.fn().mockReturnValue(false) // Anchor doesn't contain the clicked element
            };
            
            mockChild.closest.mockReturnValue(mockAnchor);
            
            const mockEvent = {
                target: mockChild
            };

            clickHandler(mockEvent);

            expect(mockChild.closest).toHaveBeenCalledWith('a');
            expect(mockAnchor.contains).toHaveBeenCalledWith(mockChild);
            expect(addLivePreviewQueryTags).not.toHaveBeenCalled();
        });

        test("should not process external links", () => {
            const mockAnchor = {
                href: "https://external-site.com/page",
                closest: vi.fn().mockReturnValue(null),
                contains: vi.fn().mockReturnValue(true)
            };
            mockAnchor.closest.mockReturnValue(mockAnchor);
            
            const mockEvent = {
                target: mockAnchor
            };

            clickHandler(mockEvent);

            expect(addLivePreviewQueryTags).not.toHaveBeenCalled();
            expect(mockAnchor.href).toBe("https://external-site.com/page"); // Unchanged
        });

        test("should not process links that already contain live_preview", () => {
            const mockAnchor = {
                href: "https://example.com/page?live_preview=existing",
                closest: vi.fn().mockReturnValue(null),
                contains: vi.fn().mockReturnValue(true)
            };
            mockAnchor.closest.mockReturnValue(mockAnchor);
            
            const mockEvent = {
                target: mockAnchor
            };

            clickHandler(mockEvent);

            expect(addLivePreviewQueryTags).not.toHaveBeenCalled();
            expect(mockAnchor.href).toBe("https://example.com/page?live_preview=existing"); // Unchanged
        });

        test("should not process links without href", () => {
            const mockAnchor = {
                href: "",
                closest: vi.fn().mockReturnValue(null),
                contains: vi.fn().mockReturnValue(true)
            };
            mockAnchor.closest.mockReturnValue(mockAnchor);
            
            const mockEvent = {
                target: mockAnchor
            };

            clickHandler(mockEvent);

            expect(addLivePreviewQueryTags).not.toHaveBeenCalled();
            expect(mockAnchor.href).toBe(""); // Unchanged
        });

        test("should handle case when addLivePreviewQueryTags returns empty string", () => {
            vi.mocked(addLivePreviewQueryTags).mockReturnValue("");
            
            const originalHref = "https://example.com/page";
            const mockAnchor = {
                href: originalHref,
                closest: vi.fn().mockReturnValue(null),
                contains: vi.fn().mockReturnValue(true)
            };
            mockAnchor.closest.mockReturnValue(mockAnchor);
            
            const mockEvent = {
                target: mockAnchor
            };

            clickHandler(mockEvent);

            expect(addLivePreviewQueryTags).toHaveBeenCalledWith(originalHref);
            expect(mockAnchor.href).toBe(originalHref); // Falls back to original href when empty string returned
        });

        test("should handle nested child elements", () => {
            // Create deeply nested structure: span > button > a
            const mockDeepChild = {
                closest: vi.fn()
            };
            
            const mockAnchor = {
                href: "https://example.com/nested-page",
                contains: vi.fn().mockReturnValue(true)
            };
            
            mockDeepChild.closest.mockReturnValue(mockAnchor);
            
            const mockEvent = {
                target: mockDeepChild
            };

            clickHandler(mockEvent);

            expect(mockDeepChild.closest).toHaveBeenCalledWith('a');
            expect(mockAnchor.contains).toHaveBeenCalledWith(mockDeepChild);
            expect(addLivePreviewQueryTags).toHaveBeenCalledWith("https://example.com/nested-page");
            expect(mockAnchor.href).toBe("https://example.com/nested-page?live_preview=test&content_type_uid=test&entry_uid=test");
        });
    });
});
