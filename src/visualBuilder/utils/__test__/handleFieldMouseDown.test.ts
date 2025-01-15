import { MockInstance } from "vitest";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../constants";
import { handleFieldInput, handleFieldKeyDown } from "../handleFieldMouseDown";
import * as insertSpaceAtCursor from "../insertSpaceAtCursor";
import * as generateOverlay from "../../generators/generateOverlay";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import { FieldDataType } from "../types/index.types";

vi.mock("lodash-es", async () => ({
    ...(await import("lodash-es")),
    throttle: vi.fn((fn) => fn),
}))
describe("handle numeric field key down", () => {
    let h1: HTMLHeadingElement;
    let spiedPreventDefault: MockInstance<(e: []) => void> | undefined;

    beforeEach(() => {
        h1 = document.createElement("h1");
        h1.innerHTML = "2.2";
        h1.setAttribute("contenteditable", "true");
        h1.setAttribute(VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY, "number");

        h1.addEventListener("keydown", (e) => {
            spiedPreventDefault = vi.spyOn(e, "preventDefault");
            handleFieldKeyDown(e);
        });

        vi.spyOn(window, "getSelection").mockReturnValue({
            // @ts-ignore
            getRangeAt: (n: number) => ({
                startOffset: 0,
                endOffset: 0,
            }),
        });

        document.body.appendChild(h1);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test("should allow utility buttons", () => {
        const keyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Enter",
            code: "Enter",
        });
        h1.dispatchEvent(keyDownEvent);

        expect(spiedPreventDefault).not.toHaveBeenCalled();
    });

    test("should allow special key with any key", () => {
        const keyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "z",
            code: "Keyz",
            ctrlKey: true,
        });
        h1.dispatchEvent(keyDownEvent);

        expect(spiedPreventDefault).not.toHaveBeenCalled();
    });

    test("should allow digits", () => {
        const keyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "1",
            code: "Digit1",
        });
        h1.dispatchEvent(keyDownEvent);

        expect(spiedPreventDefault).not.toHaveBeenCalled();
    });

    test(`should disallow characters other than "-", ".", "e", "E"`, () => {
        const keyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "z",
            code: "Keyz",
        });

        h1.dispatchEvent(keyDownEvent);
        expect(spiedPreventDefault).toHaveBeenCalledTimes(1);
    });

    test("should only digits if text content is not proper", () => {
        h1.innerHTML = "hello";
        const digitKeyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "1",
            code: "Digit1",
        });
        h1.dispatchEvent(digitKeyDownEvent);

        expect(spiedPreventDefault).not.toHaveBeenCalled();
    });

    test("should disallow allowed character twice", () => {
        h1.innerHTML = "-1.5e2";

        const keyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "e",
        });

        h1.dispatchEvent(keyDownEvent);
        expect(spiedPreventDefault).toHaveBeenCalledTimes(1);
    });
});

describe("handle keydown in button contenteditable", () => {
    let button: HTMLButtonElement | undefined;
    let spiedPreventDefault: MockInstance<(e: []) => void> | undefined;
    let spiedInsertSpaceAtCursor:
        | MockInstance<(typeof insertSpaceAtCursor)["insertSpaceAtCursor"]>
        | undefined;

    test("should insert space in button content-editable", () => {
        vi.spyOn(window, "getSelection").mockReturnValue({
            // @ts-ignore
            getRangeAt: (n: number) => ({
                startOffset: 0,
                endOffset: 0,
            }),
        });
        spiedInsertSpaceAtCursor = vi.spyOn(
            insertSpaceAtCursor,
            "insertSpaceAtCursor"
        );

        button = document.createElement("button");
        button.innerHTML = "Test";
        button.setAttribute("contenteditable", "true");
        button.setAttribute(
            VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY,
            "single_line"
        );

        button.addEventListener("keydown", (e) => {
            spiedPreventDefault = vi.spyOn(e, "preventDefault");
            handleFieldKeyDown(e);
        });

        const keyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Space",
            code: "Space",
        });
        button.dispatchEvent(keyDownEvent);

        expect(spiedPreventDefault).toHaveBeenCalledTimes(1);
        expect(spiedInsertSpaceAtCursor).toHaveBeenCalledWith(button);
    });
});

describe("handle single line field key down", () => {
    let h1: HTMLHeadingElement;
    let spiedPreventDefault: MockInstance<(e: []) => void> | undefined;

    beforeEach(() => {
        h1 = document.createElement("h1");
        h1.innerHTML = "2.2";
        h1.setAttribute("contenteditable", "true");
        h1.setAttribute(VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY, FieldDataType.SINGLELINE);

        h1.addEventListener("keydown", (e) => {
            spiedPreventDefault = vi.spyOn(e, "preventDefault");
            handleFieldKeyDown(e);
        });

        document.body.appendChild(h1);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test("should prevent default on enter key", () => {
        const keyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Enter",
            code: "Enter",
        });
        h1.dispatchEvent(keyDownEvent);

        expect(spiedPreventDefault).toHaveBeenCalledTimes(1);
    });
})

describe("`handleFieldInput`", () => {
    let h1: HTMLHeadingElement;
    let visualBuilderContainer: HTMLElement;
    beforeEach(() => {
        h1 = document.createElement("h1");
        h1.innerHTML = "2.2";
        h1.setAttribute("contenteditable", "true");
        h1.setAttribute(VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY, "number");

        h1.addEventListener("input", handleFieldInput);

        visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualBuilderContainer);
        document.body.appendChild(h1);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test("should call `sendFieldEvent` on input event", () => {
        const spiedSendFieldEvent = vi.spyOn(generateOverlay, "sendFieldEvent")
        const consoleError = vi.spyOn(console, "error");
        spiedSendFieldEvent.mockImplementation(() => { 
            throw new Error("sendFieldEvent not implemented")
        });
        const inputEvent = new InputEvent("input", {
            bubbles: true,
        });
        h1.dispatchEvent(inputEvent);

        expect(spiedSendFieldEvent).toHaveBeenCalledWith({ visualBuilderContainer, eventType: VisualBuilderPostMessageEvents.SYNC_FIELD });
        expect(consoleError).toHaveBeenCalled();
    });

})