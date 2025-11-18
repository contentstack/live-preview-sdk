import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { waitForHoverOutline } from "./utils";

describe("waitForHoverOutline", () => {
    beforeEach(() => {
        // Clear DOM before each test
        document.body.innerHTML = "";
    });

    afterEach(() => {
        // Clean up after each test
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    test("should resolve when hover outline exists with style attribute", async () => {
        // Create hover outline element with style
        const hoverOutline = document.createElement("div");
        hoverOutline.setAttribute("data-testid", "visual-builder__hover-outline");
        hoverOutline.setAttribute("style", "top: 10px; left: 10px; width: 100px; height: 50px;");
        document.body.appendChild(hoverOutline);

        // Should resolve immediately since element exists with style
        await expect(waitForHoverOutline()).resolves.not.toThrow();
    });

    test("should wait for hover outline to appear", async () => {
        // Initially no element
        const promise = waitForHoverOutline();

        // Add element after a short delay
        setTimeout(() => {
            const hoverOutline = document.createElement("div");
            hoverOutline.setAttribute("data-testid", "visual-builder__hover-outline");
            hoverOutline.setAttribute("style", "top: 10px; left: 10px;");
            document.body.appendChild(hoverOutline);
        }, 100);

        // Should resolve once element appears
        await expect(promise).resolves.not.toThrow();
    });

    test("should timeout if element does not exist", async () => {
        // No element created - should timeout after default waitFor timeout
        await expect(waitForHoverOutline()).rejects.toThrow();
    }, 10000);
});

