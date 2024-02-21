import {
    getExpectedFieldData,
    getStyleOfAnElement,
    generatePseudoEditableElement,
} from "../pseudoEditableField";
import { LiveEditorPostMessageEvents } from "../types/postMessage.types";

jest.mock("../liveEditorPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: jest.fn().mockImplementation((eventName: string) => {
                if (eventName === LiveEditorPostMessageEvents.GET_FIELD_DATA)
                    return Promise.resolve({
                        fieldData: "I am the correct long expected data",
                    });
                return Promise.resolve();
            }),
        },
    };
});

describe("getExpectedFieldData", () => {
    test("should return the expected field data", async () => {
        const expectedFieldData = await getExpectedFieldData({} as any);
        expect(expectedFieldData).toBe("I am the correct long expected data");
    });
});

describe("getStyleOfAnElement", () => {
    test("it should return the style of an element", () => {
        const elem = document.createElement("div");

        elem.style.width = "100px";

        const style = getStyleOfAnElement(elem);
        expect(style).toEqual({ display: 'block', visibility: 'visible', width: '100px' });
    });

    test("it should not return filtered styles", () => {
        const elem = document.createElement("div");

        elem.style.width = "100px";
        elem.style.position = "absolute";
        elem.style.left = "10px";
        elem.style.top = "10px";
        elem.style.right = "10px";
        elem.style.bottom = "10px";
        elem.style.textOverflow = "ellipsis";
        elem.style.marginBlockEnd = "10px";
        elem.style.marginBlockStart = "10px";
        elem.style.marginInlineEnd = "10px";
        elem.style.marginInlineStart = "10px";
        elem.style.marginLeft = "10px";
        elem.style.marginRight = "10px";
        elem.style.marginTop = "10px";
        elem.style.marginBottom = "10px";

        const style = getStyleOfAnElement(elem);
        expect(style).toEqual({ display: 'block', visibility: 'visible', width: '100px' });
    });
});


describe("generatePseudoEditableElement", () => {
    test("it should generate a pseudo editable element", () => {
        const editableElement = document.createElement("div");

        const mockedBoundingClientRect = {
            bottom: 88.3984375,
            height: 54.3984375,
            left: 34,
            right: 862,
            top: 34,
            width: 828,
            x: 34,
            y: 34,
        };

        editableElement.getBoundingClientRect = jest
            .fn()
            .mockReturnValue(mockedBoundingClientRect);

        editableElement.style.width = "100px";

        const expectedTextContent = "I am the correct long expected data";

        const pseudoEditableElement = generatePseudoEditableElement(
            { editableElement },
            { textContent: expectedTextContent }
        );

        expect(pseudoEditableElement).toBeTruthy();
        expect(pseudoEditableElement.textContent).toBe(expectedTextContent);
        expect(editableElement.style.cssText).toBe("width: 100px;");
    });
});
