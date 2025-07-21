import { describe, it, expect, vi } from "vitest";
import getVisualBuilderRedirectionUrl from "../getVisualBuilderRedirectionUrl";
import Config from "../../../configManager/configManager";
import { extractDetailsFromCslp } from "../../../cslp";

vi.mock("../../../configManager/configManager");
vi.mock("../../../cslp");

describe("getVisualBuilderRedirectionUrl", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete window.location;
        window.location = new URL("https://example.com");
    });

    it("should return the correct URL with branch and environment", () => {
        Config.get.mockReturnValue({
            stackDetails: {
                branch: "main",
                apiKey: "12345",
                environment: "production",
                locale: "en-US",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe(
            "https://app.example.com/#!/stack/12345/visual-builder?target-url=https%3A%2F%2Fexample.com&branch=main&environment=production&locale=en-US"
        );
    });

    it("should return the correct URL without branch and environment", () => {
        Config.get.mockReturnValue({
            stackDetails: {
                branch: "",
                apiKey: "12345",
                environment: "",
                locale: "en-US",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe(
            "https://app.example.com/#!/stack/12345/visual-builder?target-url=https%3A%2F%2Fexample.com&locale=en-US"
        );
    });

    it("should use locale from data-cslp attribute if present", () => {
        document.body.innerHTML = '<div data-cslp="some-cslp-data"></div>';
        Config.get.mockReturnValue({
            stackDetails: {
                branch: "main",
                apiKey: "12345",
                environment: "production",
                locale: "en-US",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        extractDetailsFromCslp.mockReturnValue({ locale: "fr-FR" });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe(
            "https://app.example.com/#!/stack/12345/visual-builder?target-url=https%3A%2F%2Fexample.com&branch=main&environment=production&locale=fr-FR"
        );
    });

    it("should return the correct URL without locale", () => {
        document.body.innerHTML = "";
        Config.get.mockReturnValue({
            stackDetails: {
                branch: "main",
                apiKey: "12345",
                environment: "production",
                locale: "",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe(
            "https://app.example.com/#!/stack/12345/visual-builder?target-url=https%3A%2F%2Fexample.com&branch=main&environment=production"
        );
    });

    it("should return the correct URL without query parameters in target-url", () => {
        Object.defineProperty(window, "location", {
            writable: true,
            value: new URL("https://example.com/page?query=test"),
        });

        Config.get.mockReturnValue({
            stackDetails: {
                branch: "main",
                apiKey: "12345",
                environment: "production",
                locale: "en-US",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toContain(
            "target-url=https%3A%2F%2Fexample.com%2Fpage"
        );
        expect(result.toString()).not.toContain("?query=test");
    });
    it("should return the correct URL with slash type hash routing", () => {
        Object.defineProperty(window, "location", {
            writable: true,
            value: new URL("https://example.com/#/page"),
        });
        Config.get.mockReturnValue({
            stackDetails: {
                branch: "main",
                apiKey: "12345",
                environment: "production",
                locale: "en-US",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe(
            "https://app.example.com/#!/stack/12345/visual-builder?target-url=https%3A%2F%2Fexample.com%2Fpage&branch=main&environment=production&locale=en-US"
        );
    });

    it("should return the correct URL with no slash type hash routing", () => {
        Object.defineProperty(window, "location", {
            writable: true,
            value: new URL("https://example.com/#page"),
        });
        Config.get.mockReturnValue({
            stackDetails: {
                branch: "main",
                apiKey: "12345",
                environment: "production",
                locale: "en-US",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe(
            "https://app.example.com/#!/stack/12345/visual-builder?target-url=https%3A%2F%2Fexample.com%2Fpage&branch=main&environment=production&locale=en-US"
        );
    });
    it("should return the correct URL with hash bang type hash routing", () => {
        Object.defineProperty(window, "location", {
            writable: true,
            value: new URL("https://example.com/#!/page"),
        });
        Config.get.mockReturnValue({
            stackDetails: {
                branch: "main",
                apiKey: "12345",
                environment: "production",
                locale: "en-US",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe(
            "https://app.example.com/#!/stack/12345/visual-builder?target-url=https%3A%2F%2Fexample.com%2Fpage&branch=main&environment=production&locale=en-US"
        );
    });

    it("should return the correct URL with hash bang type hash routing", () => {
        Object.defineProperty(window, "location", {
            writable: true,
            value: new URL("https://example.com/#!/page?query=test"),
        });
        Config.get.mockReturnValue({
            stackDetails: {
                branch: "main",
                apiKey: "12345",
                environment: "production",
                locale: "en-US",
            },
            clientUrlParams: {
                url: "https://app.example.com",
            },
        });

        const result = getVisualBuilderRedirectionUrl();
        expect(result.toString()).toBe(
            "https://app.example.com/#!/stack/12345/visual-builder?target-url=https%3A%2F%2Fexample.com%2Fpage&branch=main&environment=production&locale=en-US"
        );
    });
});
