import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { inIframe } from "../inIframe";

describe("inIframe", () => {
    let windowSpy: any;

    beforeEach(() => {
        windowSpy = vi.spyOn(window, "window", "get");
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    test("should return false if outside iframe", () => {
        windowSpy.mockImplementation(() => ({
            self: "test",
            top: "test",
            opener: null,
        }));

        expect(inIframe()).toBe(false);
    });

    test("should return true if inside iframe", () => {
        windowSpy.mockImplementation(() => ({
            self: "test-self",
            top: "test-top",
            opener: null,
        }));

        expect(inIframe()).toBe(true);
    });

    test("should return false if in new tab (has opener)", () => {
        const mockOpener = { location: { href: "parent-url" } };
        windowSpy.mockImplementation(() => ({
            self: "test-self",
            top: "test-top", 
            opener: mockOpener,
        }));

        expect(inIframe()).toBe(false);
    });

    test("should return false if opener equals window", () => {
        const mockWindow: any = {
            self: "test-self",
            top: "test-top",
            opener: null,
        };
        mockWindow.opener = mockWindow; // Self-reference

        windowSpy.mockImplementation(() => mockWindow);

        expect(inIframe()).toBe(true); // Falls back to iframe check
    });

    test("should return true in case of any error", () => {
        windowSpy.mockImplementation(() => {
            throw new Error("Test error");
        });

        expect(inIframe()).toBe(true);
    });
});
