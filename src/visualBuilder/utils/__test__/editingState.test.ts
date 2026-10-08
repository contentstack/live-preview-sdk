import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isVisualEditorEditing } from "../editingState";

const ATTR = "data-cslp-field-type";

describe("isVisualEditorEditing", () => {
    let el: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = "";
        el = document.createElement("div");
        document.body.appendChild(el);
    });

    it("returns false when nothing is being edited", () => {
        expect(isVisualEditorEditing()).toBe(false);
        expect(isVisualEditorEditing(el)).toBe(false);
    });

    it("returns true when a descendant of the element is being edited", () => {
        const child = document.createElement("span");
        el.appendChild(child);
        child.setAttribute(ATTR, "singleline");

        expect(isVisualEditorEditing(el)).toBe(true);
    });

    it("returns true when the element itself carries the attribute", () => {
        el.setAttribute(ATTR, "singleline");
        expect(isVisualEditorEditing(el)).toBe(true);
    });

    it("scopes the check to the given element", () => {
        const other = document.createElement("div");
        document.body.appendChild(other);
        const child = document.createElement("span");
        other.appendChild(child);
        child.setAttribute(ATTR, "singleline");

        expect(isVisualEditorEditing(el)).toBe(false);
        expect(isVisualEditorEditing(other)).toBe(true);
    });

    it("checks the whole document when no element is passed", () => {
        expect(isVisualEditorEditing()).toBe(false);
        el.setAttribute(ATTR, "singleline");
        expect(isVisualEditorEditing()).toBe(true);
    });

    describe("without a DOM (SSR)", () => {
        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it("returns false", () => {
            vi.stubGlobal("document", undefined);
            expect(isVisualEditorEditing()).toBe(false);
        });
    });
});
