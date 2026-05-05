import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    updateHighlightedCommentIconPosition,
    removeAllHighlightedCommentIcons,
} from "../generateHighlightedComment";

describe("updateHighlightedCommentIconPosition", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        container.className = "visual-builder__container";
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    const makeIcon = (fieldPath: string): HTMLDivElement => {
        const icon = document.createElement("div");
        icon.className = "highlighted-comment collab-icon";
        icon.setAttribute("field-path", fieldPath);
        icon.style.position = "fixed";
        icon.style.top = "100px";
        icon.style.left = "200px";
        container.appendChild(icon);
        return icon;
    };

    const makeTarget = (cslpValue: string): HTMLDivElement => {
        const el = document.createElement("div");
        el.setAttribute("data-cslp", cslpValue);
        container.appendChild(el);
        return el;
    };

    it("keeps an icon whose target element is still present", () => {
        const cslp = "content.entry.en-us.field";
        makeTarget(cslp);
        makeIcon(cslp);

        updateHighlightedCommentIconPosition();

        expect(
            document.querySelector(`.highlighted-comment[field-path="${cslp}"]`),
        ).not.toBeNull();
    });

    it("removes an orphaned icon when its target element is no longer found", () => {
        // Stale CSLP with no matching element — simulates the element having
        // been mutated to a variant CSLP value.
        const staleCslp = "content.entry.en-us.old_field";
        makeIcon(staleCslp);

        updateHighlightedCommentIconPosition();

        expect(
            document.querySelector(`.highlighted-comment[field-path="${staleCslp}"]`),
        ).toBeNull();
    });

    it("removes only orphaned icons and keeps valid ones", () => {
        const validCslp = "content.entry.en-us.valid";
        const staleCslp = "content.entry.en-us.stale";

        makeTarget(validCslp);
        makeIcon(validCslp);
        makeIcon(staleCslp);

        updateHighlightedCommentIconPosition();

        expect(
            document.querySelector(`.highlighted-comment[field-path="${validCslp}"]`),
        ).not.toBeNull();
        expect(
            document.querySelector(`.highlighted-comment[field-path="${staleCslp}"]`),
        ).toBeNull();
    });

    it("does not throw when there are no icons", () => {
        expect(() => updateHighlightedCommentIconPosition()).not.toThrow();
    });
});

describe("removeAllHighlightedCommentIcons", () => {
    it("removes every .highlighted-comment element", () => {
        ["a", "b", "c"].forEach((cslp) => {
            const icon = document.createElement("div");
            icon.className = "highlighted-comment collab-icon";
            icon.setAttribute("field-path", cslp);
            document.body.appendChild(icon);
        });

        expect(document.querySelectorAll(".highlighted-comment").length).toBe(3);

        removeAllHighlightedCommentIcons();

        expect(document.querySelectorAll(".highlighted-comment").length).toBe(0);
    });
});
