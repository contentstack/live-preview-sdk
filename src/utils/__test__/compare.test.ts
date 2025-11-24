import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { registerCompareElement } from "../compare";

describe("registerCompareElement", () => {
    test("should register cs-compare custom element when not already registered", () => {
        // Note: In actual test environment, element may already be registered from previous tests
        // This test verifies the registration logic works
        expect(() => {
            registerCompareElement();
        }).not.toThrow();

        expect(customElements.get("cs-compare")).toBeDefined();
    });

    test("should not throw error when called multiple times", () => {
        // First registration
        registerCompareElement();

        // Second registration should not throw (guarded by if condition)
        expect(() => {
            registerCompareElement();
        }).not.toThrow();
    });

    test("should register element extending HTMLSpanElement", () => {
        registerCompareElement();

        const element = document.createElement("span", {
            is: "cs-compare",
        }) as HTMLSpanElement;

        expect(element).toBeInstanceOf(HTMLSpanElement);
        expect(element.tagName.toLowerCase()).toBe("span");
    });

    test("should allow creating multiple instances", () => {
        registerCompareElement();

        const element1 = document.createElement("span", {
            is: "cs-compare",
        });
        const element2 = document.createElement("span", {
            is: "cs-compare",
        });

        expect(element1).toBeInstanceOf(HTMLElement);
        expect(element2).toBeInstanceOf(HTMLElement);
        expect(element1).not.toBe(element2);
    });
});
