import { getCurrentPageUrl } from "../getCurrentPageUrl";

describe("getCurrentPageUrl", () => {
    const setHref = (href: string) => {
        Object.defineProperty(window, "location", {
            value: new URL(href),
            writable: true,
        });
    };

    it("should return the page URL as-is when there are no live preview params", () => {
        setHref("https://example.com/products/shoes");

        expect(getCurrentPageUrl()).toBe("https://example.com/products/shoes");
    });

    it("should drop live preview's own query params", () => {
        setHref(
            "https://example.com/page?live_preview=abc&content_type_uid=hero&entry_uid=blt1&preview_timestamp=123"
        );

        expect(getCurrentPageUrl()).toBe("https://example.com/page");
    });

    it("should keep the site's own query params", () => {
        setHref("https://example.com/search?q=fountains&live_preview=abc");

        expect(getCurrentPageUrl()).toBe(
            "https://example.com/search?q=fountains"
        );
    });

    it("should keep the path that distinguishes one page from another", () => {
        setHref("https://example.com/vp1995-riverside-gardens");

        expect(getCurrentPageUrl()).toContain("/vp1995-riverside-gardens");
    });
});
