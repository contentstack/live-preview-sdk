import { describe, it, expect, vi } from "vitest";
import getChildrenDirection from "../getChildrenDirection";
import getChildElements from "../getChildElements";

vi.mock("../getChildElements");

describe("getChildrenDirection", () => {
    it("should return 'none' if editableElement is null", () => {
        const result = getChildrenDirection(null as any, "test");
        expect(result).toBe("none");
    });

    it("should return 'none' if parentElement is not found", () => {
        const editableElement = document.createElement("div");
        vi.spyOn(editableElement, "closest").mockReturnValue(null);

        const result = getChildrenDirection(editableElement, "test");
        expect(result).toBe("none");
    });

    it("should return 'none' if firstChildElement is not found", () => {
        const editableElement = document.createElement("div");
        const parentElement = document.createElement("div");
        vi.spyOn(editableElement, "closest").mockReturnValue(parentElement);

        (getChildElements as any).mockReturnValue([null, null, vi.fn()]);

        const result = getChildrenDirection(editableElement, "test");
        expect(result).toBe("none");
    });

    it("should return 'horizontal' if deltaX is greater than deltaY", () => {
        const editableElement = document.createElement("div");
        const parentElement = document.createElement("div");
        const firstChildElement = document.createElement("div");
        const secondChildElement = document.createElement("div");

        vi.spyOn(editableElement, "closest").mockReturnValue(parentElement);

        (getChildElements as any).mockReturnValue([
            firstChildElement,
            secondChildElement,
            vi.fn(),
        ]);

        vi.spyOn(firstChildElement, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });

        vi.spyOn(secondChildElement, "getBoundingClientRect").mockReturnValue({
            left: 10,
            top: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });

        const result = getChildrenDirection(editableElement, "test");
        expect(result).toBe("horizontal");
    });

    it("should return 'vertical' if deltaY is greater than deltaX", () => {
        const editableElement = document.createElement("div");
        const parentElement = document.createElement("div");
        const firstChildElement = document.createElement("div");
        const secondChildElement = document.createElement("div");

        vi.spyOn(editableElement, "closest").mockReturnValue(parentElement);

        (getChildElements as any).mockReturnValue([
            firstChildElement,
            secondChildElement,
            vi.fn(),
        ]);

        vi.spyOn(firstChildElement, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });

        vi.spyOn(secondChildElement, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 10,
            right: 0,
            bottom: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });

        const result = getChildrenDirection(editableElement, "test");
        expect(result).toBe("vertical");
    });
});