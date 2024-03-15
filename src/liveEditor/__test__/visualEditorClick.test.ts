import "@testing-library/jest-dom/extend-expect";
import { fireEvent, waitFor } from "@testing-library/preact";
import Config from "../../configManager/configManager";
import { VisualEditor } from "../index";
import { cleanIndividualFieldResidual } from "../utils/handleIndividualFields";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { getFieldSchemaMap } from "../../__test__/data/fieldSchemaMap";
import {
    LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY,
    numericInputRegex,
} from "../utils/constants";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import {
    getCsDataOfElement,
    getDOMEditStack,
} from "../utils/getCsDataOfElement";

import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";
import { sleep } from "../../__test__/utils";

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

describe("When an element is clicked in visual editor mode", () => {
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

        beforeEach(() => {
            singleLineField = document.createElement("p");
            singleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            document.body.appendChild(singleLineField);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            singleLineField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                singleLineField;

            await waitFor(() => {
                singleLineField.dispatchEvent(mouseClickEvent);
            });

            expect(singleLineField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                singleLineField;

            await waitFor(() => {
                singleLineField.dispatchEvent(mouseClickEvent);
            });

            expect(singleLineField).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                singleLineField;

            await waitFor(() => {
                singleLineField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(singleLineField),
                }
            );
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            // have to do this because of multiple FieldSchema.getSchema calls
            await waitFor(async () => {
                await waitFor(() => {
                    firstSingleLineField.dispatchEvent(mouseClickEvent);
                });
            });

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("container should not contain a contenteditable attribute but the children can", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).toHaveAttribute("contenteditable");
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
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
            document.body.appendChild(multiLineField);
            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                multiLineField;

            await waitFor(() => {
                multiLineField.dispatchEvent(mouseClickEvent);
            });

            expect(multiLineField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                multiLineField;

            await waitFor(() => {
                multiLineField.dispatchEvent(mouseClickEvent);
            });

            expect(multiLineField).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                multiLineField;

            await waitFor(() => {
                multiLineField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(multiLineField),
                }
            );
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

            firstMultiLineField = document.createElement("p");
            firstMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.0"
            );

            secondMultiLineField = document.createElement("p");
            secondMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.1"
            );

            container.appendChild(firstMultiLineField);
            container.appendChild(secondMultiLineField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("container should not contain a contenteditable attribute but the children can", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
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
            document.body.appendChild(htmlRteField);
            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            expect(htmlRteField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                htmlRteField;

            await waitFor(() => {
                htmlRteField.dispatchEvent(mouseClickEvent);
            });

            expect(htmlRteField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                htmlRteField;

            await waitFor(() => {
                htmlRteField.dispatchEvent(mouseClickEvent);
            });

            expect(htmlRteField).not.toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                htmlRteField;

            await waitFor(() => {
                htmlRteField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(htmlRteField),
                }
            );
        });

        test("should send a open quick form message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                htmlRteField;

            await waitFor(() => {
                htmlRteField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.OPEN_QUICK_FORM,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue:
                            "all_fields.bltapikey.en-us.rich_text_editor",
                        fieldPath: "rich_text_editor",
                        fieldPathWithIndex: "rich_text_editor",
                        multipleFieldMetadata: {
                            parentDetails: null,
                            index: -1,
                        },
                    },
                    cslpData: "all_fields.bltapikey.en-us.rich_text_editor",
                }
            );
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

            firstHtmlRteField = document.createElement("p");
            firstHtmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor_multiple_.0"
            );

            secondHtmlRteField = document.createElement("p");
            secondHtmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor_multiple_.1"
            );

            container.appendChild(firstHtmlRteField);
            container.appendChild(secondHtmlRteField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).not.toHaveAttribute(
                "contenteditable"
            );

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).not.toHaveAttribute(
                "contenteditable"
            );
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
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
                "all_fields.bltapikey.en-us.rich_text_editor"
            );
            document.body.appendChild(jsonRteField);
            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            expect(jsonRteField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                jsonRteField;

            await waitFor(() => {
                jsonRteField.dispatchEvent(mouseClickEvent);
            });

            expect(jsonRteField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                jsonRteField;

            await waitFor(() => {
                jsonRteField.dispatchEvent(mouseClickEvent);
            });

            expect(jsonRteField).not.toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                jsonRteField;

            await waitFor(() => {
                jsonRteField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(jsonRteField),
                }
            );
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

            firstJsonRteField = document.createElement("p");
            firstJsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_.0"
            );

            secondJsonRteField = document.createElement("p");
            secondJsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_.1"
            );

            container.appendChild(firstJsonRteField);
            container.appendChild(secondJsonRteField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).not.toHaveAttribute(
                "contenteditable"
            );

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).not.toHaveAttribute(
                "contenteditable"
            );
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
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

            document.body.appendChild(markdownField);

            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            markdownField.dispatchEvent(mouseClickEvent);
            expect(markdownField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            markdownField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            markdownField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                markdownField;

            await waitFor(() => {
                markdownField.dispatchEvent(mouseClickEvent);
            });

            expect(markdownField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                markdownField;

            await waitFor(() => {
                markdownField.dispatchEvent(mouseClickEvent);
            });

            expect(markdownField).not.toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                markdownField;

            await waitFor(() => {
                markdownField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(markdownField),
                }
            );
        });

        test("should send a open quick form message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                markdownField;

            await waitFor(() => {
                markdownField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.OPEN_QUICK_FORM,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue: "all_fields.bltapikey.en-us.markdown",
                        fieldPath: "markdown",
                        fieldPathWithIndex: "markdown",
                        multipleFieldMetadata: {
                            parentDetails: null,
                            index: -1,
                        },
                    },
                    cslpData: "all_fields.bltapikey.en-us.markdown",
                }
            );
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

            firstMarkdownField = document.createElement("p");
            firstMarkdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown_multiple_.0"
            );

            secondMarkdownField = document.createElement("p");
            secondMarkdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown_multiple_.1"
            );

            container.appendChild(firstMarkdownField);
            container.appendChild(secondMarkdownField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).not.toHaveAttribute(
                "contenteditable"
            );

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).not.toHaveAttribute(
                "contenteditable"
            );
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
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
                "all_fields.bltapikey.en-us.single_line"
            );
            document.body.appendChild(selectField);

            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            selectField.dispatchEvent(mouseClickEvent);
            expect(selectField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            selectField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            selectField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                selectField;

            await waitFor(() => {
                selectField.dispatchEvent(mouseClickEvent);
            });

            expect(selectField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                selectField;

            await waitFor(() => {
                selectField.dispatchEvent(mouseClickEvent);
            });

            expect(selectField).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                selectField;

            await waitFor(() => {
                selectField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(selectField),
                }
            );
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

            firstSelectField = document.createElement("p");
            firstSelectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select_multiple_.0"
            );

            secondSelectField = document.createElement("p");
            secondSelectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select_multiple_.1"
            );

            container.appendChild(firstSelectField);
            container.appendChild(secondSelectField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).not.toHaveAttribute(
                "contenteditable"
            );

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).not.toHaveAttribute(
                "contenteditable"
            );
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
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

            document.body.appendChild(numberField);

            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            numberField.dispatchEvent(mouseClickEvent);
            expect(numberField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            numberField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            numberField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                numberField;

            await waitFor(() => {
                numberField.dispatchEvent(mouseClickEvent);
            });

            expect(numberField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                numberField;

            await waitFor(() => {
                numberField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(numberField),
                }
            );
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

            firstNumberField = document.createElement("p");
            firstNumberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_.0"
            );

            secondNumberField = document.createElement("p");
            secondNumberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_.1"
            );

            container.appendChild(firstNumberField);
            container.appendChild(secondNumberField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("container should not contain a contenteditable attribute but the children can", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
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
                "all_fields.bltapikey.en-us.single_line"
            );
            document.body.appendChild(booleanField);

            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            booleanField.dispatchEvent(mouseClickEvent);
            expect(booleanField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            booleanField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            booleanField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                booleanField;

            await waitFor(() => {
                booleanField.dispatchEvent(mouseClickEvent);
            });

            expect(booleanField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                booleanField;

            await waitFor(() => {
                booleanField.dispatchEvent(mouseClickEvent);
            });

            expect(booleanField).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                booleanField;

            await waitFor(() => {
                booleanField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(booleanField),
                }
            );
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

            imageField = document.createElement("img");
            imageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file.url"
            );

            document.body.appendChild(fileField);
            document.body.appendChild(imageField);
            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            fileField.dispatchEvent(mouseClickEvent);
            expect(fileField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            fileField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            fileField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should not have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                fileField.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).not.toBeInTheDocument();
            expect(buttonGroup).not.toBeInTheDocument();
        });

        test("should have a field path dropdown", () => {
            fileField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a replace asset button", async () => {
            await waitFor(() => {
                fileField.dispatchEvent(mouseClickEvent);
            });
            const replaceButton = document.querySelector(
                ".visual-editor__replace-button"
            );

            expect(replaceButton).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                fileField;

            await waitFor(() => {
                fileField.dispatchEvent(mouseClickEvent);
            });

            expect(fileField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                fileField;

            await waitFor(() => {
                fileField.dispatchEvent(mouseClickEvent);
            });

            expect(fileField).not.toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                fileField;

            await waitFor(() => {
                fileField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(fileField),
                }
            );
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

            firstFileField = document.createElement("p");
            firstFileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.0"
            );

            secondFileField = document.createElement("p");
            secondFileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.1"
            );

            firstImageField = document.createElement("img");
            firstImageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.0.url"
            );

            secondImageField = document.createElement("img");
            secondImageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.1.url"
            );

            container.appendChild(firstFileField);
            container.appendChild(secondFileField);
            container.appendChild(firstImageField);
            container.appendChild(secondImageField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("children should have a replace asset button", async () => {
            const child1 = document.querySelector(
                "[data-cslp='all_fields.bltapikey.en-us.file_multiple_.0.url']"
            );
            const child2 = document.querySelector(
                "[data-cslp='all_fields.bltapikey.en-us.file_multiple_.1.url']"
            );

            await waitFor(() => {
                child1!.dispatchEvent(mouseClickEvent);
            });

            let replaceButton = document.querySelector(
                ".visual-editor__replace-button"
            );

            expect(replaceButton).toBeInTheDocument();

            await waitFor(() => {
                child2!.dispatchEvent(mouseClickEvent);
            });

            replaceButton = document.querySelector(
                ".visual-editor__replace-button"
            );

            expect(replaceButton).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).not.toHaveAttribute(
                "contenteditable"
            );

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).not.toHaveAttribute(
                "contenteditable"
            );
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
        });
    });

    describe("date field", () => {
        let dateField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            dateField = document.createElement("p");
            dateField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            document.body.appendChild(dateField);

            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            dateField.dispatchEvent(mouseClickEvent);
            expect(dateField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            dateField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            dateField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                dateField;

            await waitFor(() => {
                dateField.dispatchEvent(mouseClickEvent);
            });

            expect(dateField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                dateField;

            await waitFor(() => {
                dateField.dispatchEvent(mouseClickEvent);
            });

            expect(dateField).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                dateField;

            await waitFor(() => {
                dateField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(dateField),
                }
            );
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

            document.body.appendChild(linkField);
            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            linkField.dispatchEvent(mouseClickEvent);
            expect(linkField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            linkField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            linkField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should not have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                linkField.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).not.toBeInTheDocument();
            expect(buttonGroup).not.toBeInTheDocument();
        });

        test("should have a field path dropdown", () => {
            linkField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                linkField;

            await waitFor(() => {
                linkField.dispatchEvent(mouseClickEvent);
            });

            expect(linkField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                linkField;

            await waitFor(() => {
                linkField.dispatchEvent(mouseClickEvent);
            });

            expect(linkField).not.toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                linkField;

            await waitFor(() => {
                linkField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(linkField),
                }
            );
        });

        test("should send a open quick form message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                linkField;

            await waitFor(() => {
                linkField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.OPEN_QUICK_FORM,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue: "all_fields.bltapikey.en-us.link.href",
                        fieldPath: "link.href",
                        fieldPathWithIndex: "link.href",
                        multipleFieldMetadata: {
                            parentDetails: null,
                            index: -1,
                        },
                    },
                    cslpData: "all_fields.bltapikey.en-us.link.href",
                }
            );
        });
    });

    // BUG ?: test failing : should have 2 add instance buttons
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

            firstLinkField = document.createElement("a");
            firstLinkField.setAttribute(
                "data-cslp",
                "all_fields.blt366df6233d9915f5.en-us.link_multiple_.0.href"
            );

            secondLinkField = document.createElement("a");
            secondLinkField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.link_multiple_.1.href"
            );

            container.appendChild(firstLinkField);
            container.appendChild(secondLinkField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).not.toHaveAttribute(
                "contenteditable"
            );

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).not.toHaveAttribute(
                "contenteditable"
            );
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
        });
    });

    describe("reference field", () => {
        let referenceField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            referenceField = document.createElement("p");
            referenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            document.body.appendChild(referenceField);

            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            visualEditor.destroy();
        });

        test("should have outline", () => {
            referenceField.dispatchEvent(mouseClickEvent);
            expect(referenceField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            referenceField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            referenceField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                referenceField;

            await waitFor(() => {
                referenceField.dispatchEvent(mouseClickEvent);
            });

            expect(referenceField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                referenceField;

            await waitFor(() => {
                referenceField.dispatchEvent(mouseClickEvent);
            });

            expect(referenceField).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                referenceField;

            await waitFor(() => {
                referenceField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(referenceField),
                }
            );
        });
    });

    // BUG ?: test failing : should have a multi field toolbar with button group
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

            firstReferenceField = document.createElement("div");
            firstReferenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference_multiple_.0"
            );

            secondReferenceField = document.createElement("div");
            secondReferenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference_multiple_.1"
            );

            container.appendChild(firstReferenceField);
            container.appendChild(secondReferenceField);
            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");

            await waitFor(() => {
                container.children[0].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[0]).not.toHaveAttribute(
                "contenteditable"
            );

            await waitFor(() => {
                container.children[1].dispatchEvent(mouseClickEvent);
            });

            expect(container.children[1]).not.toHaveAttribute(
                "contenteditable"
            );
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
        });
    });

    // BUG ?: test failing : should send a open quick form message to parent
    describe("group field", () => {
        let groupField: HTMLParagraphElement;
        let visualEditor: VisualEditor;

        beforeEach(() => {
            groupField = document.createElement("p");
            groupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            document.body.appendChild(groupField);

            visualEditor = new VisualEditor();
        });

        afterEach(() => {
            jest.clearAllMocks();
            visualEditor.destroy();
        });

        test("should have outline", () => {
            groupField.dispatchEvent(mouseClickEvent);
            expect(groupField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            groupField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-editor__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            groupField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                groupField;

            await waitFor(() => {
                groupField.dispatchEvent(mouseClickEvent);
            });

            expect(groupField).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                groupField;

            await waitFor(() => {
                groupField.dispatchEvent(mouseClickEvent);
            });

            expect(groupField).toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                groupField;

            await waitFor(() => {
                groupField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(groupField),
                }
            );
        });

        test("should send a open quick form message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                groupField;

            await waitFor(() => {
                groupField.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.OPEN_QUICK_FORM,
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
                    cslpData: "all_fields.bltapikey.en-us.group_multiple_.0",
                }
            );
        });
    });

    describe("group (multiple)", () => {
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

            firstGroupField = document.createElement("div");
            firstGroupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.0"
            );

            firstNestedMultiLine = document.createElement("p");
            firstNestedMultiLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.0.multi_line"
            );

            secondGroupField = document.createElement("div");
            secondGroupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.1"
            );

            container.appendChild(firstGroupField);
            container.appendChild(secondGroupField);

            firstGroupField.appendChild(firstNestedMultiLine);

            document.body.appendChild(container);

            visualEditor = new VisualEditor();
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

        test("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-editor__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-editor__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-editor__add-button"
                );
                return addInstanceButtons.length === 2;
            };

            const pollingInterval = 100;
            const timeout = 200;

            let elapsedTime = 0;
            while (elapsedTime < timeout) {
                if (await checkCondition()) {
                    break;
                }
                await new Promise((resolve) =>
                    setTimeout(resolve, pollingInterval)
                );
                elapsedTime += pollingInterval;
            }

            if (elapsedTime >= timeout) {
                throw new Error(
                    "Timeout: Condition not met within the specified timeout."
                );
            }

            const addInstanceButtons = document.querySelectorAll(
                ".visual-editor__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).toHaveAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should not contain a contenteditable attribute", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(container).not.toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", async () => {
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
                container;

            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
        });
    });
});
