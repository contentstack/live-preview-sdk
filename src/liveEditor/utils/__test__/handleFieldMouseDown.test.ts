import { LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY } from "../constants";
import { handleFieldKeyDown } from "../handleFieldMouseDown";

describe("handle numeric field key down", () => {
    let h1: HTMLHeadingElement;
    let spiedPreventDefault: jest.SpyInstance<void, []> | undefined;

    beforeEach(() => {
        h1 = document.createElement("h1");
        h1.innerHTML = "2.2";
        h1.setAttribute("contenteditable", "true");
        h1.setAttribute(LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY, "number");

        h1.addEventListener("keydown", (e) => {
            spiedPreventDefault = jest.spyOn(e, "preventDefault");
            handleFieldKeyDown(e);
        });

        jest.spyOn(window, "getSelection").mockReturnValue({
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
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
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
