import { IConfig } from "../../types/types";
import { getDefaultConfig } from "../../utils/defaults";
import { VisualEditor } from "../index";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

jest.mock("../utils/liveEditorPostMessage", () => {
    const { getAllContentTypes } = jest.requireActual(
        "../../__test__/data/contentType"
    );
    const contentTypes = getAllContentTypes();
    return {
        __esModule: true,
        default: {
            send: jest.fn().mockImplementation((eventName: string) => {
                if (eventName === "init")
                    return Promise.resolve({
                        contentTypes,
                    });
                return Promise.resolve();
            }),
        },
    };
});

const mockDomRect = {
    singleHorizontal: () => ({
        bottom: 88.3984375,
        height: 54.3984375,
        left: 34,
        right: 862,
        top: 34,
        width: 828,
        x: 34,
        y: 34,
    }),
    singleLeft: () => ({
        x: 51,
        y: 51,
        width: 27.7734375,
        height: 20.3984375,
        top: 51,
        bottom: 71.3984375,
        left: 51,
        right: 78.7734375,
    }),
    singleRight: () => ({
        x: 110.7734375,
        y: 51,
        width: 53.59375,
        height: 20.3984375,
        top: 51,
        bottom: 71.3984375,
        left: 110.7734375,
        right: 164.3671875,
    }),
    singleVertical: () => ({
        bottom: 195.1953125,
        height: 90.796875,
        left: 34,
        right: 862,
        top: 104.3984375,
        width: 828,
        x: 34,
        y: 104.3984375,
    }),
    singleTop: () => ({
        x: 51,
        y: 121.3984375,
        width: 794,
        height: 20.3984375,
        top: 121.3984375,
        bottom: 141.796875,
        left: 51,
        right: 845,
    }),
    singleBottom: () => ({
        x: 51,
        y: 157.796875,
        width: 794,
        height: 20.3984375,
        top: 157.796875,
        bottom: 178.1953125,
        left: 51,
        right: 845,
    }),
    multipleLeft: () => ({
        x: 51,
        y: 228.1953125,
        width: 87.59375,
        height: 90.796875,
        top: 228.1953125,
        bottom: 318.9921875,
        left: 51,
        right: 138.59375,
    }),
    multipleRight: () => ({
        x: 170.59375,
        y: 228.1953125,
        width: 87.59375,
        height: 90.796875,
        top: 228.1953125,
        bottom: 318.9921875,
        left: 170.59375,
        right: 258.1875,
    }),
    multipleTop: () => ({
        x: 51,
        y: 368.9921875,
        width: 794,
        height: 90.796875,
        top: 368.9921875,
        bottom: 459.7890625,
        left: 51,
        right: 845,
    }),
    multipleBottom: () => ({
        x: 51,
        y: 475.7890625,
        width: 794,
        height: 90.796875,
        top: 475.7890625,
        bottom: 566.5859375,
        left: 51,
        right: 845,
    }),
    multipleChildTop: () => ({
        x: 68,
        y: 385.9921875,
        width: 760,
        height: 20.3984375,
        top: 385.9921875,
        bottom: 406.390625,
        left: 68,
        right: 828,
    }),
    multipleChildBottom: () => ({
        x: 68,
        y: 422.390625,
        width: 760,
        height: 20.3984375,
        top: 422.390625,
        bottom: 442.7890625,
        left: 68,
        right: 828,
    }),
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

describe("When an element is hovered in visual editor mode", () => {
    let config: IConfig;
    let mousemoveEvent: Event;

    beforeEach(() => {
        config = getDefaultConfig();
        mousemoveEvent = new Event("mousemove", {
            bubbles: true,
            cancelable: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.getElementsByTagName("html")[0].innerHTML = "";
    });
    describe("title field", () => {
        let titleField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            titleField = document.createElement("p");
            titleField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.title"
            );
            titleField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());
            document.body.appendChild(titleField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            titleField.dispatchEvent(mousemoveEvent);
            expect(titleField).toMatchSnapshot();
            expect(titleField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            titleField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("single line field", () => {
        let singleLineField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            singleLineField = document.createElement("p");
            singleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            singleLineField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());
            document.body.appendChild(singleLineField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            singleLineField.dispatchEvent(mousemoveEvent);
            expect(singleLineField).toMatchSnapshot();
            expect(singleLineField.classList.contains("cslp-edit-mode"));
        });
        test("should have custom cursor", () => {
            singleLineField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("single line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstSingleLineField: HTMLParagraphElement;
        let secondSingleLineField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_"
            );
            container.getBoundingClientRect = jest

                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstSingleLineField = document.createElement("p");
            firstSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0"
            );
            firstSingleLineField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondSingleLineField = document.createElement("p");
            secondSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1"
            );
            secondSingleLineField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstSingleLineField);
            container.appendChild(secondSingleLineField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstSingleLineField.dispatchEvent(mousemoveEvent);
            expect(firstSingleLineField).toMatchSnapshot();
            expect(firstSingleLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstSingleLineField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstSingleLineField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstSingleLineField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        content_type_uid: "all_fields",
                        cslpValue:
                            "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0",
                        entry_uid: "bltapikey",
                        fieldPath: "single_line_textbox_multiple_",
                        fieldPathWithIndex: "single_line_textbox_multiple_",
                        locale: "en-us",
                        multipleFieldMetadata: {
                            index: 0,
                            parentDetails: {
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.single_line_textbox_multiple_",
                                parentPath: "single_line_textbox_multiple_",
                            },
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        content_type_uid: "all_fields",
                        cslpValue:
                            "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0",
                        entry_uid: "bltapikey",
                        fieldPath: "single_line_textbox_multiple_",
                        fieldPathWithIndex: "single_line_textbox_multiple_",
                        locale: "en-us",
                        multipleFieldMetadata: {
                            index: 0,
                            parentDetails: {
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.single_line_textbox_multiple_",
                                parentPath: "single_line_textbox_multiple_",
                            },
                        },
                    },
                    index: 1,
                }
            );

            expect(liveEditorPostMessage?.send).toHaveBeenCalledTimes(3);
        });
    });

    describe("multi line field", () => {
        let multiLineField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            multiLineField = document.createElement("p");
            multiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line"
            );

            multiLineField.getBoundingClientRect = jest

                .fn()
                .mockReturnValue(mockDomRect.singleLeft());
            document.body.appendChild(multiLineField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            multiLineField.dispatchEvent(mousemoveEvent);
            expect(multiLineField).toMatchSnapshot();
            expect(multiLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            multiLineField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("multi line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstMultiLineField: HTMLParagraphElement;
        let secondMultiLineField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_"
            );
            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstMultiLineField = document.createElement("p");
            firstMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.0"
            );

            firstMultiLineField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondMultiLineField = document.createElement("p");
            secondMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.1"
            );

            secondMultiLineField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstMultiLineField);
            container.appendChild(secondMultiLineField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstMultiLineField.dispatchEvent(mousemoveEvent);
            expect(firstMultiLineField).toMatchSnapshot();
            expect(firstMultiLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstMultiLineField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstMultiLineField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstMultiLineField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.0",
                        fieldPath: "multi_line_textbox_multiple_",
                        fieldPathWithIndex: "multi_line_textbox_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "multi_line_textbox_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.multi_line_textbox_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.0",
                        fieldPath: "multi_line_textbox_multiple_",
                        fieldPathWithIndex: "multi_line_textbox_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "multi_line_textbox_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.multi_line_textbox_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );

            expect(liveEditorPostMessage?.send).toHaveBeenCalledTimes(3);
        });
    });

    describe("HTML RTE field", () => {
        let htmlRteField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            htmlRteField = document.createElement("p");
            htmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor"
            );

            htmlRteField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(htmlRteField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            htmlRteField.dispatchEvent(mousemoveEvent);
            expect(htmlRteField).toMatchSnapshot();
            expect(htmlRteField.classList.contains("cslp-edit-mode"));
        });
        test("should have custom cursor", () => {
            htmlRteField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("HTML RTE field (multiple)", () => {
        let container: HTMLDivElement;
        let firstHtmlRteField: HTMLParagraphElement;
        let secondHtmlRteField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor_multiple_"
            );
            container.getBoundingClientRect = jest

                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstHtmlRteField = document.createElement("p");
            firstHtmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor_multiple_.0"
            );

            firstHtmlRteField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondHtmlRteField = document.createElement("p");
            secondHtmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor_multiple_.1"
            );

            secondHtmlRteField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstHtmlRteField);
            container.appendChild(secondHtmlRteField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstHtmlRteField.dispatchEvent(mousemoveEvent);
            expect(firstHtmlRteField).toMatchSnapshot();
            expect(firstHtmlRteField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstHtmlRteField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstHtmlRteField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstHtmlRteField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.rich_text_editor_multiple_.0",
                        fieldPath: "rich_text_editor_multiple_",
                        fieldPathWithIndex: "rich_text_editor_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "rich_text_editor_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.rich_text_editor_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.rich_text_editor_multiple_.0",
                        fieldPath: "rich_text_editor_multiple_",
                        fieldPathWithIndex: "rich_text_editor_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "rich_text_editor_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.rich_text_editor_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );
        });
    });

    describe("JSON RTE field", () => {
        let jsonRteField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            jsonRteField = document.createElement("p");
            jsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rte"
            );

            jsonRteField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(jsonRteField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            jsonRteField.dispatchEvent(mousemoveEvent);
            expect(jsonRteField).toMatchSnapshot();
            expect(jsonRteField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            jsonRteField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("JSON RTE field (multiple)", () => {
        let container: HTMLDivElement;
        let firstJsonRteField: HTMLParagraphElement;
        let secondJsonRteField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_"
            );

            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstJsonRteField = document.createElement("p");
            firstJsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_.0"
            );

            firstJsonRteField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondJsonRteField = document.createElement("p");
            secondJsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_.1"
            );

            secondJsonRteField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstJsonRteField);
            container.appendChild(secondJsonRteField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstJsonRteField.dispatchEvent(mousemoveEvent);
            expect(firstJsonRteField).toMatchSnapshot();
            expect(firstJsonRteField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstJsonRteField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstJsonRteField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstJsonRteField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_.0",
                        fieldPath: "json_rich_text_editor_multiple_",
                        fieldPathWithIndex: "json_rich_text_editor_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "json_rich_text_editor_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_.0",
                        fieldPath: "json_rich_text_editor_multiple_",
                        fieldPathWithIndex: "json_rich_text_editor_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "json_rich_text_editor_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );

            expect(liveEditorPostMessage?.send).toHaveBeenCalledTimes(3);
        });
    });

    describe("markdown field", () => {
        let markdownField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            markdownField = document.createElement("p");
            markdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown"
            );

            markdownField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(markdownField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            markdownField.dispatchEvent(mousemoveEvent);
            expect(markdownField).toMatchSnapshot();
            expect(markdownField.classList.contains("cslp-edit-mode"));
        });
        test("should have custom cursor", () => {
            markdownField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("markdown field (multiple)", () => {
        let container: HTMLDivElement;
        let firstMarkdownField: HTMLParagraphElement;
        let secondMarkdownField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown_multiple_"
            );

            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstMarkdownField = document.createElement("p");
            firstMarkdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown_multiple_.0"
            );

            firstMarkdownField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondMarkdownField = document.createElement("p");
            secondMarkdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown_multiple_.1"
            );

            secondMarkdownField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstMarkdownField);
            container.appendChild(secondMarkdownField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstMarkdownField.dispatchEvent(mousemoveEvent);
            expect(firstMarkdownField).toMatchSnapshot();
            expect(firstMarkdownField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstMarkdownField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstMarkdownField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstMarkdownField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.markdown_multiple_.0",
                        fieldPath: "markdown_multiple_",
                        fieldPathWithIndex: "markdown_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "markdown_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.markdown_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.markdown_multiple_.0",
                        fieldPath: "markdown_multiple_",
                        fieldPathWithIndex: "markdown_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "markdown_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.markdown_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );
        });
    });

    describe("select field", () => {
        let selectField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            selectField = document.createElement("p");
            selectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select"
            );

            selectField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(selectField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            selectField.dispatchEvent(mousemoveEvent);
            expect(selectField).toMatchSnapshot();
            expect(selectField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            selectField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("select field (multiple)", () => {
        let container: HTMLDivElement;
        let firstSelectField: HTMLParagraphElement;
        let secondSelectField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select_multiple_"
            );
            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstSelectField = document.createElement("p");
            firstSelectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select_multiple_.0"
            );

            firstSelectField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondSelectField = document.createElement("p");
            secondSelectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select_multiple_.1"
            );

            secondSelectField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            container.appendChild(firstSelectField);
            container.appendChild(secondSelectField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstSelectField.dispatchEvent(mousemoveEvent);
            expect(firstSelectField).toMatchSnapshot();
            expect(firstSelectField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstSelectField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstSelectField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("64.88671875px");
            expect(instanceButton[0].style.top).toBe("51px");

            expect(instanceButton[1].style.left).toBe("64.88671875px");
            expect(instanceButton[1].style.top).toBe("71.3984375px");
        });

        test("should send event to parent to add new instance", () => {
            firstSelectField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.select_multiple_.0",
                        fieldPath: "select_multiple_",
                        fieldPathWithIndex: "select_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "select_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.select_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.select_multiple_.0",
                        fieldPath: "select_multiple_",
                        fieldPathWithIndex: "select_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "select_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.select_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );
        });
    });

    describe("number field", () => {
        let numberField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            numberField = document.createElement("p");
            numberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number"
            );

            numberField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(numberField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            numberField.dispatchEvent(mousemoveEvent);
            expect(numberField).toMatchSnapshot();
            expect(numberField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            numberField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("number field (multiple)", () => {
        let container: HTMLDivElement;
        let firstNumberField: HTMLParagraphElement;
        let secondNumberField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_"
            );
            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstNumberField = document.createElement("p");
            firstNumberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_.0"
            );
            firstNumberField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondNumberField = document.createElement("p");
            secondNumberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_.1"
            );
            secondNumberField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstNumberField);
            container.appendChild(secondNumberField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstNumberField.dispatchEvent(mousemoveEvent);
            expect(firstNumberField).toMatchSnapshot();
            expect(firstNumberField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstNumberField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstNumberField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstNumberField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.number_multiple_.0",
                        fieldPath: "number_multiple_",
                        fieldPathWithIndex: "number_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "number_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.number_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.number_multiple_.0",
                        fieldPath: "number_multiple_",
                        fieldPathWithIndex: "number_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "number_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.number_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );
        });
    });

    describe("boolean field", () => {
        let booleanField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            booleanField = document.createElement("p");
            booleanField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.boolean"
            );

            booleanField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(booleanField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            booleanField.dispatchEvent(mousemoveEvent);
            expect(booleanField).toMatchSnapshot();
            expect(booleanField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            booleanField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("file field", () => {
        let fileField: HTMLParagraphElement;
        let imageField: HTMLImageElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            fileField = document.createElement("p");
            fileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file"
            );

            fileField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            imageField = document.createElement("img");
            imageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file.url"
            );

            document.body.appendChild(fileField);
            document.body.appendChild(imageField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            fileField.dispatchEvent(mousemoveEvent);
            expect(fileField).toMatchSnapshot();
            expect(fileField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            fileField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have a outline on the url as well", () => {
            imageField.dispatchEvent(mousemoveEvent);
            expect(imageField).toMatchSnapshot();
            expect(imageField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on the url as well", () => {
            imageField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("file field (multiple)", () => {
        let container: HTMLDivElement;
        let firstFileField: HTMLParagraphElement;
        let secondFileField: HTMLParagraphElement;
        let firstImageField: HTMLImageElement;
        let secondImageField: HTMLImageElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_"
            );

            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstFileField = document.createElement("p");
            firstFileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.0"
            );

            firstFileField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondFileField = document.createElement("p");
            secondFileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.1"
            );

            secondFileField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            firstImageField = document.createElement("img");
            firstImageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.0.url"
            );
            firstImageField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondImageField = document.createElement("img");
            secondImageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.1.url"
            );
            secondFileField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstFileField);
            container.appendChild(secondFileField);
            container.appendChild(firstImageField);
            container.appendChild(secondImageField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstFileField.dispatchEvent(mousemoveEvent);
            expect(firstFileField).toMatchSnapshot();
            expect(firstFileField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstFileField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstFileField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstFileField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.file_multiple_.0",
                        fieldPath: "file_multiple_",
                        fieldPathWithIndex: "file_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "file_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.file_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.file_multiple_.0",
                        fieldPath: "file_multiple_",
                        fieldPathWithIndex: "file_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "file_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.file_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );

            expect(liveEditorPostMessage?.send).toHaveBeenCalledTimes(3);
        });

        test("should have outline on the url", () => {
            firstImageField.dispatchEvent(mousemoveEvent);
            expect(firstImageField).toMatchSnapshot();
            expect(firstImageField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on the url", () => {
            firstImageField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances on the url", () => {
            firstImageField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance on the url", () => {});
    });

    describe("date field", () => {
        let dataField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            dataField = document.createElement("p");
            dataField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.date"
            );

            dataField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(dataField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            dataField.dispatchEvent(mousemoveEvent);
            expect(dataField).toMatchSnapshot();
            expect(dataField.classList.contains("cslp-edit-mode"));
        });
        test("should have custom cursor", () => {
            dataField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("link field", () => {
        let linkField: HTMLAnchorElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            linkField = document.createElement("a");
            linkField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.link.href"
            );

            linkField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(linkField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            linkField.dispatchEvent(mousemoveEvent);
            expect(linkField).toMatchSnapshot();
            expect(linkField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            linkField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("link field (multiple)", () => {
        let container: HTMLDivElement;
        let firstLinkField: HTMLAnchorElement;
        let secondLinkField: HTMLAnchorElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.link_multiple_"
            );
            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstLinkField = document.createElement("a");
            firstLinkField.setAttribute(
                "data-cslp",
                "all_fields.blt366df6233d9915f5.en-us.link_multiple_.0.href"
            );
            firstLinkField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondLinkField = document.createElement("a");
            secondLinkField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.link_multiple_.1.href"
            );
            secondLinkField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstLinkField);
            container.appendChild(secondLinkField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstLinkField.dispatchEvent(mousemoveEvent);
            expect(firstLinkField).toMatchSnapshot();

            expect(firstLinkField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstLinkField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test.skip("should have instance button on individual instances", () => {
            firstLinkField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );
            expect(customCursor?.classList.contains("visible")).toBeTruthy();

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test.skip("should send event to parent to add new instance", () => {
            firstLinkField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.link_multiple_.0",
                        fieldPath: "link_multiple_",
                        fieldPathWithIndex: "link_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "link_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.link_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();
            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.link_multiple_.0",
                        fieldPath: "link_multiple_",
                        fieldPathWithIndex: "link_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "link_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.link_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );
        });
    });

    describe("reference field", () => {
        let referenceField: HTMLDivElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            referenceField = document.createElement("div");
            referenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference"
            );

            referenceField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(referenceField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            referenceField.dispatchEvent(mousemoveEvent);
            expect(referenceField).toMatchSnapshot();
            expect(referenceField.classList.contains("cslp-edit-mode"));
        });
        test("should have custom cursor", () => {
            referenceField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("reference field (multiple)", () => {
        let container: HTMLDivElement;
        let firstReferenceField: HTMLDivElement;
        let secondReferenceField: HTMLDivElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference_multiple_"
            );
            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstReferenceField = document.createElement("div");
            firstReferenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference_multiple_.0"
            );

            firstReferenceField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondReferenceField = document.createElement("div");
            secondReferenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference_multiple_.1"
            );

            secondReferenceField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstReferenceField);
            container.appendChild(secondReferenceField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", () => {
            firstReferenceField.dispatchEvent(mousemoveEvent);
            expect(firstReferenceField).toMatchSnapshot();
            expect(firstReferenceField.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on individual instances", () => {
            firstReferenceField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstReferenceField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstReferenceField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.reference_multiple_.0",
                        fieldPath: "reference_multiple_",
                        fieldPathWithIndex: "reference_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "reference_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.reference_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.reference_multiple_.0",
                        fieldPath: "reference_multiple_",
                        fieldPathWithIndex: "reference_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "reference_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.reference_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );
        });
    });

    describe("group field", () => {
        let groupField: HTMLDivElement;
        let nestedSingleLine: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            groupField = document.createElement("div");
            groupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group"
            );

            groupField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            nestedSingleLine = document.createElement("p");
            nestedSingleLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group.single_line"
            );

            nestedSingleLine.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            groupField.appendChild(nestedSingleLine);
            document.body.appendChild(groupField);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            groupField.dispatchEvent(mousemoveEvent);
            expect(groupField).toMatchSnapshot();
            expect(groupField.classList.contains("cslp-edit-mode"));
        });
        test("should have custom cursor", () => {
            groupField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have a outline on the nested single line", () => {
            const singleLine = document.createElement("p");
            singleLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group.single_line"
            );

            singleLine.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            groupField.appendChild(singleLine);

            singleLine.dispatchEvent(mousemoveEvent);
            expect(singleLine).toMatchSnapshot();
            expect(singleLine.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on the nested single line", () => {
            const singleLine = document.createElement("p");
            singleLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group.single_line"
            );

            singleLine.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            groupField.appendChild(singleLine);

            singleLine.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("group field (multiple)", () => {
        let container: HTMLDivElement;
        let firstGroupField: HTMLDivElement;
        let firstNestedMultiLine: HTMLParagraphElement;
        let secondGroupField: HTMLDivElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_"
            );

            container.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstGroupField = document.createElement("div");
            firstGroupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.0"
            );

            firstGroupField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            firstNestedMultiLine = document.createElement("p");
            firstNestedMultiLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.0.multi_line"
            );

            firstNestedMultiLine.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondGroupField = document.createElement("div");
            secondGroupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.1"
            );

            secondGroupField.getBoundingClientRect = jest
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstGroupField);
            container.appendChild(secondGroupField);

            firstGroupField.appendChild(firstNestedMultiLine);

            document.body.appendChild(container);

            visualEditor = new VisualEditor(config);
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mousemoveEvent);
            expect(container).toMatchSnapshot();
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor", () => {
            container.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have instance button on individual instances", () => {
            firstGroupField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton).toMatchSnapshot();
            expect(instanceButton.length).toBe(2);

            expect(instanceButton[0].style.left).toBe("51px");
            expect(instanceButton[0].style.top).toBe("61.19921875px");

            expect(instanceButton[1].style.left).toBe("78.7734375px");
            expect(instanceButton[1].style.top).toBe("61.19921875px");
        });

        test("should send event to parent to add new instance", () => {
            firstGroupField.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(2);

            instanceButton[0].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.group_multiple_.0",
                        fieldPath: "group_multiple_",
                        fieldPathWithIndex: "group_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "group_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.group_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 0,
                }
            );

            instanceButton[1].click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.group_multiple_.0",
                        fieldPath: "group_multiple_",
                        fieldPathWithIndex: "group_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "group_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.group_multiple_",
                            },
                            index: 0,
                        },
                    },
                    index: 1,
                }
            );
        });

        test("should have outline on the nested single line", () => {
            firstNestedMultiLine.dispatchEvent(mousemoveEvent);
            expect(firstNestedMultiLine).toMatchSnapshot();
            expect(firstNestedMultiLine.classList.contains("cslp-edit-mode"));
        });

        test("should have custom cursor on the nested single line", () => {
            firstNestedMultiLine.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should not have any instance button on the nested single line", () => {
            firstNestedMultiLine.dispatchEvent(mousemoveEvent);
            const instanceButton = document.querySelectorAll<HTMLButtonElement>(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(instanceButton.length).toBe(0);
        });
    });
});
