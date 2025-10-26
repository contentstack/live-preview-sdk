import { MockInstance } from "vitest";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../constants";
import { handleFieldInput, handleFieldKeyDown } from "../handleFieldMouseDown";
import * as insertSpaceAtCursor from "../insertSpaceAtCursor";
import * as generateOverlay from "../../generators/generateOverlay";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import { FieldDataType } from "../types/index.types";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/preact";
import { VisualBuilder } from "../../index";

vi.mock("../../index", async () => ({
    VisualBuilder: {
        VisualBuilderGlobalState: {
            value: { focusFieldReceivedInput: false },
        },
    },
}));

vi.mock("lodash-es", async () => ({
    ...(await import("lodash-es")),
    throttle: vi.fn((fn) => fn),
}));

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

    test("should only accept characters like a number input", async () => {
        h1.innerHTML = "";
        await userEvent.click(h1);
        await userEvent.keyboard("ab56c78e-h10");

        await waitFor(() => {
            expect(h1).toHaveTextContent(`5678e-10`);
        });
    });
});

describe("handle keydown in button contenteditable", () => {
    let spiedSendFieldEvent: MockInstance<() => void> | undefined;

    beforeEach(() => {
        spiedSendFieldEvent = vi
            .spyOn(generateOverlay, "sendFieldEvent")
            .mockImplementation(() => {});
        const visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualBuilderContainer);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should insert space in button content-editable", () => {
        let spiedPreventDefault: MockInstance<(e: []) => void> | undefined;
        vi.spyOn(window, "getSelection").mockReturnValue({
            // @ts-expect-error mocking only required properties
            getRangeAt: (n: number) => ({
                startOffset: 0,
                endOffset: 0,
            }),
        });
        const spiedInsertSpaceAtCursor = vi.spyOn(
            insertSpaceAtCursor,
            "insertSpaceAtCursor"
        );

        const button = document.createElement("button");
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
        expect(spiedSendFieldEvent).toHaveBeenCalled();
    });

    test("should insert space in span content-editable inside button", () => {
        let spiedPreventDefault: MockInstance<(e: []) => void> | undefined;
        vi.spyOn(window, "getSelection").mockReturnValue({
            // @ts-expect-error mocking only required properties
            getRangeAt: (n: number) => ({
                startOffset: 0,
                endOffset: 0,
            }),
        });
        const spiedInsertSpaceAtCursor = vi.spyOn(
            insertSpaceAtCursor,
            "insertSpaceAtCursor"
        );

        const button = document.createElement("button");
        const span = document.createElement("span");
        button.appendChild(span);
        span.setAttribute("contenteditable", "true");
        span.setAttribute(
            VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY,
            "single_line"
        );

        span.addEventListener("keydown", (e) => {
            spiedPreventDefault = vi.spyOn(e, "preventDefault");
            handleFieldKeyDown(e);
        });

        const keyDownEvent = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Space",
            code: "Space",
        });
        span.dispatchEvent(keyDownEvent);

        expect(spiedPreventDefault).toHaveBeenCalledTimes(1);
        expect(spiedInsertSpaceAtCursor).toHaveBeenCalledWith(span);
        expect(spiedSendFieldEvent).toHaveBeenCalled();
    });
});

describe("handle single line field key down", () => {
    let h1: HTMLHeadingElement;
    let spiedPreventDefault: MockInstance<(e: []) => void> | undefined;

    beforeEach(() => {
        h1 = document.createElement("h1");
        h1.innerHTML = "2.2";
        h1.setAttribute("contenteditable", "true");
        h1.setAttribute(
            VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY,
            FieldDataType.SINGLELINE
        );

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
});

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
        const spiedSendFieldEvent = vi.spyOn(generateOverlay, "sendFieldEvent");
        const consoleError = vi.spyOn(console, "error");
        spiedSendFieldEvent.mockImplementation(() => {
            throw new Error("sendFieldEvent not implemented");
        });
        const inputEvent = new InputEvent("input", {
            bubbles: true,
        });
        h1.dispatchEvent(inputEvent);

        expect(spiedSendFieldEvent).toHaveBeenCalledWith({
            visualBuilderContainer,
            eventType: VisualBuilderPostMessageEvents.SYNC_FIELD,
        });
        expect(consoleError).toHaveBeenCalled();
    });

    test("should set focusFieldReceivedInput to true", () => {
        const inputEvent = new InputEvent("input", {
            bubbles: true,
        });
        h1.dispatchEvent(inputEvent);
        expect(
            VisualBuilder.VisualBuilderGlobalState.value.focusFieldReceivedInput
        ).toBe(true);
    });

    test("should manage data-cs-last-edited attribute when field receives input", () => {
        const previousField = document.createElement("div");
        previousField.setAttribute("data-cs-last-edited", "true");
        document.body.appendChild(previousField);

        const inputEvent = new InputEvent("input", {
            bubbles: true,
        });
        h1.dispatchEvent(inputEvent);

        expect(previousField.getAttribute("data-cs-last-edited")).toBeNull();
        expect(h1.getAttribute("data-cs-last-edited")).toBe("true");

        document.body.removeChild(previousField);
    });

    test("should not change data-cs-last-edited attribute when same field receives input", () => {
        h1.setAttribute("data-cs-last-edited", "true");

        const inputEvent = new InputEvent("input", {
            bubbles: true,
        });
        h1.dispatchEvent(inputEvent);

        expect(h1.getAttribute("data-cs-last-edited")).toBe("true");
    });

    test("should set data-cs-last-edited attribute on new field when no previous field exists", () => {
        const inputEvent = new InputEvent("input", {
            bubbles: true,
        });
        h1.dispatchEvent(inputEvent);

        expect(h1.getAttribute("data-cs-last-edited")).toBe("true");
    });

    test("should transfer data-cs-last-edited attribute between multiple fields", () => {
        const field1 = document.createElement("div");
        const field2 = document.createElement("div");
        field1.setAttribute(VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY, "number");
        field2.setAttribute(VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY, "number");
        field1.setAttribute("data-cs-last-edited", "true");

        field1.addEventListener("input", handleFieldInput);
        field2.addEventListener("input", handleFieldInput);

        document.body.appendChild(field1);
        document.body.appendChild(field2);

        const inputEvent1 = new InputEvent("input", { bubbles: true });
        field1.dispatchEvent(inputEvent1);

        expect(field1.getAttribute("data-cs-last-edited")).toBe("true");
        expect(field2.getAttribute("data-cs-last-edited")).toBeNull();

        const inputEvent2 = new InputEvent("input", { bubbles: true });
        field2.dispatchEvent(inputEvent2);

        expect(field1.getAttribute("data-cs-last-edited")).toBeNull();
        expect(field2.getAttribute("data-cs-last-edited")).toBe("true");

        document.body.removeChild(field1);
        document.body.removeChild(field2);
    });
});
