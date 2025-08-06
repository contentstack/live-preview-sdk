import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { inNewTab, getCommunicationTarget } from "../inNewTab";

describe("inNewTab", () => {
    let windowSpy: any;

    beforeEach(() => {
        windowSpy = vi.spyOn(window, "window", "get");
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    test("should return false if no window.opener", () => {
        windowSpy.mockImplementation(() => ({
            opener: null,
        }));

        expect(inNewTab()).toBe(false);
    });

    test("should return false if window.opener equals window", () => {
        const mockWindow: any = {
            opener: null,
        };
        mockWindow.opener = mockWindow; // Self-reference

        windowSpy.mockImplementation(() => mockWindow);

        expect(inNewTab()).toBe(false);
    });

    test("should return true if opened via window.open", () => {
        const mockOpener = { location: { href: "parent-url" } };
        windowSpy.mockImplementation(() => ({
            opener: mockOpener,
        }));

        expect(inNewTab()).toBe(true);
    });

    test("should return false in case of any error", () => {
        windowSpy.mockImplementation(() => {
            throw new Error("Test error");
        });

        expect(inNewTab()).toBe(false);
    });
});

describe("getCommunicationTarget", () => {
    let windowSpy: any;

    beforeEach(() => {
        windowSpy = vi.spyOn(window, "window", "get");
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    test("should return opener when available", () => {
        const mockOpener = { location: { href: "parent-url" } };
        const mockWindow = {
            opener: mockOpener,
            parent: { location: { href: "iframe-parent" } },
        };

        windowSpy.mockImplementation(() => mockWindow);

        expect(getCommunicationTarget()).toBe(mockOpener);
    });

    test("should return parent when opener not available", () => {
        const mockParent = { location: { href: "iframe-parent" } };
        const mockWindow = {
            opener: null,
            parent: mockParent,
        };

        windowSpy.mockImplementation(() => mockWindow);

        expect(getCommunicationTarget()).toBe(mockParent);
    });

    test("should return null when opener equals window", () => {
        const mockWindow: any = {
            opener: null,
            parent: null,
        };
        mockWindow.opener = mockWindow; // Self-reference
        mockWindow.parent = mockWindow; // Self-reference

        windowSpy.mockImplementation(() => mockWindow);

        expect(getCommunicationTarget()).toBe(null);
    });

    test("should return null in case of any error", () => {
        windowSpy.mockImplementation(() => {
            throw new Error("Test error");
        });

        expect(getCommunicationTarget()).toBe(null);
    });
}); 