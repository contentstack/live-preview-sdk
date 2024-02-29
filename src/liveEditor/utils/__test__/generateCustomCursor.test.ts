import { generateCustomCursor } from "./../../generators/generateCustomCursor";
import { FieldDataType } from "../types/index.types";

describe("generateCustomCursor", () => {
    let cursorContainer: HTMLDivElement;

    beforeEach(() => {
        // Create a target element and focus overlay wrapper for each test
        cursorContainer = document.createElement("div");
    });

    afterEach(() => {
        // Remove the target element and focus overlay wrapper after each test
        cursorContainer.innerHTML = "";
    });

    test("should insert icon and cursor", () => {
        generateCustomCursor({
            fieldType: FieldDataType.SINGLELINE,
            customCursor: cursorContainer,
        });
        expect(cursorContainer.innerHTML).toContain(
            "visual-editor__cursor-wrapper"
        );
        expect(cursorContainer.innerHTML).toContain(
            "visual-editor__cursor-pointer"
        );
        expect(cursorContainer.innerHTML).toContain(
            "visual-editor__cursor-icon"
        );
    });

    test("should insert loading icon", () => {
        generateCustomCursor({
            fieldType: "loading",
            customCursor: cursorContainer,
        });
        expect(cursorContainer.innerHTML).toContain(
            "visual-editor__cursor-wrapper"
        );
        expect(cursorContainer.innerHTML).toContain(
            "visual-editor__cursor-icon"
        );
        expect(cursorContainer.getAttribute("data-icon")).toBe("loading");
    });

    test("should change icon when field type changes", () => {
        generateCustomCursor({
            fieldType: "loading",
            customCursor: cursorContainer,
        });
        expect(cursorContainer.getAttribute("data-icon")).toBe("loading");
        generateCustomCursor({
            fieldType: FieldDataType.SINGLELINE,
            customCursor: cursorContainer,
        });
        expect(cursorContainer.getAttribute("data-icon")).toBe("singleline");
    });

    test("should not change icon when field type is the same", () => {
        generateCustomCursor({
            fieldType: FieldDataType.SINGLELINE,
            customCursor: cursorContainer,
        });
        expect(cursorContainer.getAttribute("data-icon")).toBe("singleline");
        cursorContainer.innerHTML = "old icon";
        generateCustomCursor({
            fieldType: FieldDataType.SINGLELINE,
            customCursor: cursorContainer,
        });
        expect(cursorContainer.getAttribute("data-icon")).toBe("singleline");
        expect(cursorContainer.innerHTML).toBe("old icon");
    });
});
