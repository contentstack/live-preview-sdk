import "@testing-library/jest-dom/extend-expect";
import { fireEvent, waitFor } from "@testing-library/preact";
import Config from "../../configManager/configManager";
import { VisualEditor } from "../index";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { getFieldSchemaMap } from "../../__test__/data/fieldSchemaMap";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";

import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

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
            on: jest.fn(),
        },
    };
});

describe("When an inline element is edited in visual editor mode", () => {
    let mouseClickEvent: Event;

    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
    });

    beforeEach(() => {
        Config.reset();
        Config.set("mode", 2);
        mouseClickEvent = new Event("click", {
            bubbles: true,
            cancelable: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
    });

    describe("single line field", () => {
        let singleLineField: HTMLParagraphElement;
        let visualEditor: VisualEditor;
        let overlayWrapper: HTMLDivElement;

        beforeEach(() => {
            singleLineField = document.createElement("p");
            singleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            document.body.appendChild(singleLineField);

            visualEditor = new VisualEditor();
            overlayWrapper = document.querySelector(
                ".visual-editor__overlay__wrapper"
            ) as HTMLDivElement;
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            singleLineField.dispatchEvent(mouseClickEvent);
            expect(singleLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            singleLineField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should be able to edit inline text present", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                singleLineField;

            await waitFor(() => {
                singleLineField.dispatchEvent(mouseClickEvent);
            });

            expect(singleLineField).toHaveAttribute("contenteditable");

            fireEvent.click(singleLineField);
            fireEvent.change(singleLineField, {
                target: { textContent: "test text" },
            });

            expect(singleLineField).toHaveTextContent("test text");
        });

        test("should send a update field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                singleLineField;

            await waitFor(() => {
                singleLineField.dispatchEvent(mouseClickEvent);
            });

            fireEvent.click(singleLineField);
            fireEvent.change(singleLineField, {
                target: { textContent: "test text" },
            });

            expect(singleLineField).toHaveTextContent("test text");

            await waitFor(() => {
                overlayWrapper.dispatchEvent(mouseClickEvent);
            });
            fireEvent.click(overlayWrapper);

            expect(liveEditorPostMessage?.send).toHaveBeenCalledWith(
                LiveEditorPostMessageEvents.UPDATE_FIELD,
                {
                    data: "",
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue: "all_fields.bltapikey.en-us.single_line",
                        fieldPath: "single_line",
                        fieldPathWithIndex: "single_line",
                        multipleFieldMetadata: {
                            parentDetails: null,
                            index: -1,
                        },
                        instance: {
                            fieldPathWithIndex: "single_line",
                        }
                    },
                }
            );
        });
    });

    describe("single line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstSingleLineField: HTMLParagraphElement;
        let secondSingleLineField: HTMLParagraphElement;
        let visualEditor: VisualEditor;
        let overlayWrapper: HTMLDivElement;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_"
            );

            firstSingleLineField = document.createElement("p");
            firstSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0"
            );

            secondSingleLineField = document.createElement("p");
            secondSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1"
            );

            container.appendChild(firstSingleLineField);
            container.appendChild(secondSingleLineField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
            overlayWrapper = document.querySelector(
                ".visual-editor__overlay__wrapper"
            ) as HTMLDivElement;
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should be able to edit individual inline text present", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                firstSingleLineField;

            await waitFor(() => {
                firstSingleLineField.dispatchEvent(mouseClickEvent);
            });

            expect(firstSingleLineField).toHaveAttribute("contenteditable");

            fireEvent.click(firstSingleLineField);
            fireEvent.change(firstSingleLineField, {
                target: { textContent: "test text" },
            });

            expect(firstSingleLineField).toHaveTextContent("test text");

            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                secondSingleLineField;

            await waitFor(() => {
                secondSingleLineField.dispatchEvent(mouseClickEvent);
            });

            expect(secondSingleLineField).toHaveAttribute("contenteditable");

            fireEvent.click(secondSingleLineField);
            fireEvent.change(secondSingleLineField, {
                target: { textContent: "test text" },
            });

            expect(secondSingleLineField).toHaveTextContent("test text");
        });

        test("should send a update field message to parent when editing an individual element", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                firstSingleLineField;

            await waitFor(() => {
                firstSingleLineField.dispatchEvent(mouseClickEvent);
            });

            fireEvent.click(firstSingleLineField);
            fireEvent.change(firstSingleLineField, {
                target: { textContent: "test text 1" },
            });

            expect(firstSingleLineField).toHaveTextContent("test text 1");

            await waitFor(() => {
                overlayWrapper.dispatchEvent(mouseClickEvent);
            });
            fireEvent.click(overlayWrapper);

            expect(liveEditorPostMessage?.send).toHaveBeenCalledWith(
                LiveEditorPostMessageEvents.UPDATE_FIELD,
                {
                    data: "",
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0",
                        fieldPath: "single_line_textbox_multiple_",
                        fieldPathWithIndex: "single_line_textbox_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "single_line_textbox_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.single_line_textbox_multiple_",
                            },
                            index: 0,
                        },
                        instance: {
                            fieldPathWithIndex: "single_line_textbox_multiple_.0",
                        }
                    },
                }
            );

            await waitFor(() => {
                overlayWrapper.dispatchEvent(mouseClickEvent);
            });
            fireEvent.click(overlayWrapper);

            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                secondSingleLineField;

            await waitFor(() => {
                secondSingleLineField.dispatchEvent(mouseClickEvent);
            });

            fireEvent.click(secondSingleLineField);
            fireEvent.change(secondSingleLineField, {
                target: { textContent: "test text 2" },
            });

            expect(secondSingleLineField).toHaveTextContent("test text 2");

            await waitFor(() => {
                overlayWrapper.dispatchEvent(mouseClickEvent);
            });
            fireEvent.click(overlayWrapper);

            expect(liveEditorPostMessage?.send).toHaveBeenCalledWith(
                LiveEditorPostMessageEvents.UPDATE_FIELD,
                {
                    data: "",
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1",
                        fieldPath: "single_line_textbox_multiple_",
                        fieldPathWithIndex: "single_line_textbox_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "single_line_textbox_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.single_line_textbox_multiple_",
                            },
                            index: 1,
                        },
                        instance: {
                            fieldPathWithIndex: "single_line_textbox_multiple_.1",
                        }
                    },
                }
            );
        });
    });

    describe("multi line field", () => {
        let multiLineField: HTMLParagraphElement;
        let visualEditor: VisualEditor;
        let overlayWrapper: HTMLDivElement;

        beforeEach(() => {
            multiLineField = document.createElement("p");
            multiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line"
            );
            document.body.appendChild(multiLineField);
            visualEditor = new VisualEditor();
            overlayWrapper = document.querySelector(
                ".visual-editor__overlay__wrapper"
            ) as HTMLDivElement;
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            expect(multiLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should be able to edit inline text present", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                multiLineField;

            await waitFor(() => {
                multiLineField.dispatchEvent(mouseClickEvent);
            });

            expect(multiLineField).toHaveAttribute("contenteditable");

            fireEvent.click(multiLineField);
            fireEvent.change(multiLineField, {
                target: { textContent: "test text" },
            });

            expect(multiLineField).toHaveTextContent("test text");
        });

        test("should send a update field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                multiLineField;

            await waitFor(() => {
                multiLineField.dispatchEvent(mouseClickEvent);
            });

            fireEvent.click(multiLineField);
            fireEvent.change(multiLineField, {
                target: { textContent: "test text" },
            });

            expect(multiLineField).toHaveTextContent("test text");

            await waitFor(() => {
                overlayWrapper.dispatchEvent(mouseClickEvent);
            });
            fireEvent.click(overlayWrapper);

            expect(liveEditorPostMessage?.send).toHaveBeenCalledWith(
                LiveEditorPostMessageEvents.UPDATE_FIELD,
                {
                    data: "",
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue: "all_fields.bltapikey.en-us.multi_line",
                        fieldPath: "multi_line",
                        fieldPathWithIndex: "multi_line",
                        multipleFieldMetadata: {
                            parentDetails: null,
                            index: -1,
                        },
                        instance: {
                            fieldPathWithIndex: "multi_line",
                        }
                    },
                }
            );
        });
    });

    describe("multi line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstMultiLineField: HTMLParagraphElement;
        let secondMultiLineField: HTMLParagraphElement;
        let visualEditor: VisualEditor;
        let overlayWrapper: HTMLDivElement;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_"
            );

            firstMultiLineField = document.createElement("p");
            firstMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0"
            );

            secondMultiLineField = document.createElement("p");
            secondMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1"
            );

            container.appendChild(firstMultiLineField);
            container.appendChild(secondMultiLineField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
            overlayWrapper = document.querySelector(
                ".visual-editor__overlay__wrapper"
            ) as HTMLDivElement;
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should be able to edit individual inline text present", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                firstMultiLineField;

            await waitFor(() => {
                firstMultiLineField.dispatchEvent(mouseClickEvent);
            });

            expect(firstMultiLineField).toHaveAttribute("contenteditable");

            fireEvent.click(firstMultiLineField);
            fireEvent.change(firstMultiLineField, {
                target: { textContent: "test text" },
            });

            expect(firstMultiLineField).toHaveTextContent("test text");

            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                secondMultiLineField;

            await waitFor(() => {
                secondMultiLineField.dispatchEvent(mouseClickEvent);
            });

            expect(secondMultiLineField).toHaveAttribute("contenteditable");

            fireEvent.click(secondMultiLineField);
            fireEvent.change(secondMultiLineField, {
                target: { textContent: "test text" },
            });

            expect(secondMultiLineField).toHaveTextContent("test text");
        });

        test("should send a update field message to parent when editing an individual element", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                firstMultiLineField;

            await waitFor(() => {
                firstMultiLineField.dispatchEvent(mouseClickEvent);
            });

            fireEvent.click(firstMultiLineField);
            fireEvent.change(firstMultiLineField, {
                target: { textContent: "test text 1" },
            });

            expect(firstMultiLineField).toHaveTextContent("test text 1");

            await waitFor(() => {
                overlayWrapper.dispatchEvent(mouseClickEvent);
            });

            fireEvent.click(overlayWrapper);

            expect(liveEditorPostMessage?.send).toHaveBeenCalledWith(
                LiveEditorPostMessageEvents.UPDATE_FIELD,
                {
                    data: "",
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0",
                        fieldPath: "single_line_textbox_multiple_",
                        fieldPathWithIndex: "single_line_textbox_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "single_line_textbox_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.single_line_textbox_multiple_",
                            },
                            index: 0,
                        },
                        instance: {
                            fieldPathWithIndex: "single_line_textbox_multiple_.0",
                        }
                    },
                }
            );

            await waitFor(() => {
                overlayWrapper.dispatchEvent(mouseClickEvent);
            });
            fireEvent.click(overlayWrapper);

            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                secondMultiLineField;

            await waitFor(() => {
                secondMultiLineField.dispatchEvent(mouseClickEvent);
            });
            fireEvent.click(secondMultiLineField);

            fireEvent.change(secondMultiLineField, {
                target: { textContent: "test text 2" },
            });

            expect(secondMultiLineField).toHaveTextContent("test text 2");

            await waitFor(() => {
                overlayWrapper.dispatchEvent(mouseClickEvent);
            });
            fireEvent.click(overlayWrapper);

            expect(liveEditorPostMessage?.send).toHaveBeenCalledWith(
                LiveEditorPostMessageEvents.UPDATE_FIELD,
                {
                    data: "",
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1",
                        fieldPath: "single_line_textbox_multiple_",
                        fieldPathWithIndex: "single_line_textbox_multiple_",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "single_line_textbox_multiple_",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.single_line_textbox_multiple_",
                            },
                            index: 1,
                        },
                        instance: {
                            fieldPathWithIndex: "single_line_textbox_multiple_.1",
                        }
                    },
                }
            );
        });
    });
});
