import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { wasFocusOverlayDisabled } from "../generateOverlay";

describe("wasFocusOverlayDisabled", () => {
    let focusOverlayWrapper: HTMLDivElement;
    let outlineDOM: HTMLDivElement;

    beforeEach(() => {
        focusOverlayWrapper = document.createElement("div");
        outlineDOM = document.createElement("div");
        outlineDOM.classList.add("visual-builder__overlay--outline");
        focusOverlayWrapper.appendChild(outlineDOM);
        document.body.appendChild(focusOverlayWrapper);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should return true when outline color is disabled color", () => {
        outlineDOM.style.outlineColor = "#909090";
        expect(wasFocusOverlayDisabled(focusOverlayWrapper)).toBe(true);
    });

    it("should return false when outline color is enabled color", () => {
        outlineDOM.style.outlineColor = "#715cdd";
        expect(wasFocusOverlayDisabled(focusOverlayWrapper)).toBe(false);
    });

    it("should return false when outline color is not set", () => {
        expect(wasFocusOverlayDisabled(focusOverlayWrapper)).toBe(false);
    });

    it("should return false when outline DOM element does not exist", () => {
        const emptyWrapper = document.createElement("div");
        expect(wasFocusOverlayDisabled(emptyWrapper)).toBe(false);
    });
});

