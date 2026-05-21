import { describe, it, expect, beforeEach } from "vitest";
import { getParentCslp, getWholeFieldElement } from "../getWholeFieldElement";

describe("getParentCslp", () => {
    it("strips the trailing index from a V1 CSLP", () => {
        expect(getParentCslp("ct.entry.en-us.field.0")).toBe("ct.entry.en-us.field");
    });

    it("strips the trailing index from a V2 CSLP", () => {
        expect(getParentCslp("v2:ct.entry_variant.en-us.field.0")).toBe(
            "v2:ct.entry_variant.en-us.field"
        );
    });

    it("handles nested field paths", () => {
        expect(getParentCslp("ct.entry.en-us.group.subfield.2")).toBe(
            "ct.entry.en-us.group.subfield"
        );
    });
});

describe("getWholeFieldElement", () => {
    let instance: HTMLElement;
    let parent: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = "";
        parent = document.createElement("div");
        parent.setAttribute("data-cslp", "ct.entry.en-us.field");
        instance = document.createElement("div");
        instance.setAttribute("data-cslp", "ct.entry.en-us.field.0");
        parent.appendChild(instance);
        document.body.appendChild(parent);
    });

    it("returns the ancestor element matching parentCslp", () => {
        expect(getWholeFieldElement(instance, "ct.entry.en-us.field")).toBe(parent);
    });

    it("returns null when no ancestor matches", () => {
        expect(getWholeFieldElement(instance, "ct.entry.en-us.other")).toBeNull();
    });

    it("does not return a sibling — only traverses upward", () => {
        const sibling = document.createElement("div");
        sibling.setAttribute("data-cslp", "ct.entry.en-us.field");
        document.body.appendChild(sibling);

        // instance's ancestor is parent, not the sibling appended to body
        expect(getWholeFieldElement(instance, "ct.entry.en-us.field")).toBe(parent);
    });
});
