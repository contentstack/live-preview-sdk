/**
 * This file is just present to compare test running times
 * with tests in different files for each field.
 */

import React from "react";
import {
    fireEvent,
    getByTestId,
    prettyDOM,
    screen,
    waitFor,
} from "@testing-library/preact";
import "@testing-library/jest-dom";
import { getFieldSchemaMap } from "../../__test__/data/fieldSchemaMap";
import Config from "../../configManager/configManager";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../utils/constants";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { getDOMEditStack } from "../utils/getCsDataOfElement";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { Mock, vi } from "vitest";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { VisualBuilder } from "../index";
import { sleep } from "../../__test__/utils";

const VALUES = {
    singleLine: "Single line",
    number: "10.5",
};

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

global.MutationObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
}));

vi.mock("../components/FieldToolbar", () => {
    return {
        default: (props) => {
            return <div>Field Toolbar</div>;
        },
    };
});

vi.mock("../components/fieldLabelWrapper", () => {
    return {
        default: (props) => {
            return (
                <div data-testid="mock-field-label-wrapper">Field Label</div>
            );
        },
    };
});

vi.mock("../utils/visualBuilderPostMessage", async () => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("../../__test__/data/contentType")
    >("../../__test__/data/contentType");
    const contentTypes = getAllContentTypes();
    return {
        __esModule: true,
        default: {
            send: vi.fn().mockImplementation((eventName: string) => {
                if (eventName === "init")
                    return Promise.resolve({
                        contentTypes,
                    });
                return Promise.resolve();
            }),
            on: vi.fn(),
        },
    };
});

describe("When an element is clicked in visual builder mode", () => {
    let mouseClickEvent: Event;

    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
        vi.spyOn(
            document.documentElement,
            "clientWidth",
            "get"
        ).mockReturnValue(100);
        vi.spyOn(
            document.documentElement,
            "clientHeight",
            "get"
        ).mockReturnValue(100);
        vi.spyOn(document.body, "scrollHeight", "get").mockReturnValue(100);
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
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
    });

    describe("single line field", () => {
        let singleLineField: HTMLParagraphElement;

        beforeAll(() => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string) => {
                    if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        return Promise.resolve({
                            fieldData: VALUES.singleLine,
                        });
                    } else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                    ) {
                        return Promise.resolve({
                            "all_fields.bltapikey.en-us.single_line":
                                "Single Line",
                        });
                    }
                    return Promise.resolve({});
                }
            );
        });

        beforeEach(() => {
            singleLineField = document.createElement("p");
            singleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            singleLineField.textContent = VALUES.singleLine;
            singleLineField.getBoundingClientRect = vi.fn(() => ({
                left: 10,
                right: 20,
                top: 10,
                bottom: 20,
                width: 10,
                height: 5,
            })) as any;
            document.body.appendChild(singleLineField);

            VisualBuilder.VisualBuilderGlobalState.value = {
                previousSelectedEditableDOM: null,
                previousHoveredTargetDOM: null,
                previousEmptyBlockParents: [],
                audienceMode: false,
            };
        });

        test("should have outline", () => {
            const visualBuilder = new VisualBuilder();
            singleLineField.dispatchEvent(mouseClickEvent);
            expect(singleLineField.classList.contains("cslp-edit-mode"));
            visualBuilder.destroy();
        });

        test("should have an overlay", () => {
            const visualBuilder = new VisualBuilder();
            singleLineField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
            visualBuilder.destroy();
        });

        test.skip("should have a field path dropdown", async () => {
            const visualBuilder = new VisualBuilder();

            await sleep(0);
            fireEvent.click(singleLineField);
            await sleep(0);

            waitFor(async () => {
                const toolbar = await screen.findByText("Field Label");
                expect(toolbar).toBeInTheDocument();
            });

            // expect(toolbar).toBeInTheDocument();
            visualBuilder.destroy();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            const visualBuilder = new VisualBuilder();
            // visualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            //     singleLineField;

            await sleep(0);
            fireEvent.click(singleLineField);
            await sleep(0);

            await waitFor(() =>
                expect(singleLineField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                )
            );

            visualBuilder.destroy();
        });

        test("should contain a contenteditable attribute", async () => {
            const visualBuilder = new VisualBuilder();

            await sleep(0);
            fireEvent.click(singleLineField);
            await sleep(0);

            await waitFor(() => {
                expect(singleLineField).toHaveAttribute("contenteditable");
            });

            visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            const visualBuilder = new VisualBuilder();

            await sleep(0);
            fireEvent.click(singleLineField);
            await sleep(0);

            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(singleLineField),
                    }
                );
            });
            visualBuilder.destroy();
        });
    });

    describe("single line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstSingleLineField: HTMLParagraphElement;
        let secondSingleLineField: HTMLParagraphElement;

        beforeAll(() => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string, args) => {
                    if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        const values: Record<string, any> = {
                            single_line_textbox_multiple_: ["Hello", "world"],
                            "single_line_textbox_multiple_.0": "Hello",
                            "single_line_textbox_multiple_.1": "world",
                        };
                        return Promise.resolve({
                            fieldData: values[args.entryPath],
                        });
                    }
                    return Promise.resolve({});
                }
            );
        });

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_"
            );

            firstSingleLineField = document.createElement("p");
            firstSingleLineField.textContent = "Hello";

            firstSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0"
            );

            secondSingleLineField = document.createElement("p");
            secondSingleLineField.textContent = "world";
            secondSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1"
            );

            container.appendChild(firstSingleLineField);
            container.appendChild(secondSingleLineField);
            document.body.appendChild(container);

            VisualBuilder.VisualBuilderGlobalState.value = {
                previousSelectedEditableDOM: null,
                previousHoveredTargetDOM: null,
                previousEmptyBlockParents: [],
                audienceMode: false,
            };
        });

        test("should have outline", () => {
            const visualBuilder = new VisualBuilder();
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
            visualBuilder.destroy();
        });

        test("should have an overlay", () => {
            const visualBuilder = new VisualBuilder();
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
            visualBuilder.destroy();
        });

        test.skip("should have a field path dropdown", async () => {
            const visualBuilder = new VisualBuilder();

            await sleep(0);
            fireEvent.click(container);
            await sleep(0);

            await waitFor(async () => {
                const toolbar = await screen.findByTestId(
                    "mock-field-label-wrapper"
                );
                expect(toolbar).toBeInTheDocument();
            });
            visualBuilder.destroy();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            container.dispatchEvent(mouseClickEvent);
            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            const visualBuilder = new VisualBuilder();
            container.dispatchEvent(mouseClickEvent);

            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
            visualBuilder.destroy();
        });

        test("container should not contain a contenteditable attribute but the children can", async () => {
            const visualBuilder = new VisualBuilder();
            await sleep(0);
            fireEvent.click(container);
            await sleep(0);

            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            await sleep(0);

            await waitFor(() => {
                expect(container.children[0]).toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            await sleep(0);

            await waitFor(() => {
                expect(container.children[1]).toHaveAttribute(
                    "contenteditable"
                );
            });
            visualBuilder.destroy();
        });

        test.skip("should have 2 add instance buttons", async () => {
            const visualBuilder = new VisualBuilder();

            await sleep(0);
            // fireEvent.click(container.children[0]);
            container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);

            waitFor(async () => {
                const addInstanceButtons = await screen.findAllByTestId(
                    "visual-builder-add-instance-button"
                );
                expect(addInstanceButtons.length).toBe(2);
            });
            visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            const visualBuilder = new VisualBuilder();
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            expect(visualBuilderPostMessage?.send).toBeCalledWith(
                VisualBuilderPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
            visualBuilder.destroy();
        });
    });

    describe("multi line field", () => {
        let multiLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(() => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string, args) => {
                    if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        return Promise.resolve({
                            fieldData: "Hello world",
                        });
                    } else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                    ) {
                        return Promise.resolve({
                            "all_fields.bltapikey.en-us.single_line":
                                "Single Line",
                        });
                    }
                    return Promise.resolve({});
                }
            );
        });

        beforeEach(() => {
            multiLineField = document.createElement("p");
            multiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line"
            );
            multiLineField.textContent = "Hello world";
            document.body.appendChild(multiLineField);
            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            expect(multiLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", async () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                const toolbar = document.querySelector(
                    ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
                );
                expect(toolbar).toBeInTheDocument();
            });
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(multiLineField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should contain a contenteditable attribute", async () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(multiLineField).toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            multiLineField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(multiLineField),
                    }
                );
            });
        });
    });

    describe("multi line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstMultiLineField: HTMLParagraphElement;
        let secondMultiLineField: HTMLParagraphElement;

        beforeAll(() => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string, args) => {
                    if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        const values: Record<string, any> = {
                            multi_line_textbox_multiple_: ["Hello", "world"],
                            "multi_line_textbox_multiple_.0": "Hello",
                            "multi_line_textbox_multiple_.1": "world",
                        };
                        return Promise.resolve({
                            fieldData: values[args.entryPath],
                        });
                    }
                    return Promise.resolve({});
                }
            );
        });

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_"
            );

            firstMultiLineField = document.createElement("p");
            firstMultiLineField.textContent = "Hello";
            firstMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.0"
            );

            secondMultiLineField = document.createElement("p");
            secondMultiLineField.textContent = "world";
            secondMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.1"
            );

            container.appendChild(firstMultiLineField);
            container.appendChild(secondMultiLineField);
            document.body.appendChild(container);

            VisualBuilder.VisualBuilderGlobalState.value = {
                previousSelectedEditableDOM: null,
                previousHoveredTargetDOM: null,
                previousEmptyBlockParents: [],
                audienceMode: false,
            };
        });

        test("should have outline", () => {
            const visualBuilder = new VisualBuilder();
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
            visualBuilder.destroy();
        });

        test("should have an overlay", () => {
            const visualBuilder = new VisualBuilder();
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
            visualBuilder.destroy();
        });

        test.skip("should have a field path dropdown", () => {
            const visualBuilder = new VisualBuilder();
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
            visualBuilder.destroy();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test.skip("should have 2 add instance buttons", async () => {
            const visualBuilder = new VisualBuilder();
            await sleep(0);

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);

            waitFor(async () => {
                const addInstanceButtons = await screen.findAllByTestId(
                    "visual-builder-add-instance-button"
                );
                expect(addInstanceButtons.length).toBe(2);
            });
            visualBuilder.destroy();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            const visualBuilder = new VisualBuilder();
            container.dispatchEvent(mouseClickEvent);

            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });

            visualBuilder.destroy();
        });

        test("container should not contain a contenteditable attribute but the children can", async () => {
            const visualBuilder = new VisualBuilder();
            await sleep(0);

            // container.dispatchEvent(mouseClickEvent);
            fireEvent.click(container);
            await sleep(0);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[0]).toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            // container.children[1].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[1]).toHaveAttribute(
                    "contenteditable"
                );
            });

            visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            const visualBuilder = new VisualBuilder();
            container.dispatchEvent(mouseClickEvent);

            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });

            visualBuilder.destroy();
        });
    });

    describe("HTML RTE field", () => {
        let htmlRteField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            htmlRteField = document.createElement("p");
            htmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor"
            );
            document.body.appendChild(htmlRteField);
            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            expect(htmlRteField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(htmlRteField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(htmlRteField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            htmlRteField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(htmlRteField),
                    }
                );
            });
        });
    });

    describe("HTML RTE field (multiple)", () => {
        let container: HTMLDivElement;
        let firstHtmlRteField: HTMLParagraphElement;
        let secondHtmlRteField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

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

            visualBuilder = new VisualBuilder();
        });
        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", async () => {
            container.dispatchEvent(mouseClickEvent);

            await waitFor(() => {
                const toolbar = document.querySelector(
                    ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
                );
                expect(toolbar).toBeInTheDocument();
            });
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test.skip("should have 2 add instance buttons", async () => {
            // const visualBuilder = new VisualBuilder();
            // await sleep(0);

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);

            waitFor(async () => {
                const addInstanceButtons = await screen.findAllByTestId(
                    "visual-builder-add-instance-button"
                );
                expect(addInstanceButtons.length).toBe(2);
            });
            // visualBuilder.destroy();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            // const visualBuilder = new VisualBuilder();
            // await sleep(0);

            // container.dispatchEvent(mouseClickEvent);
            fireEvent.click(container);
            await sleep(0);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[0]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            // container.children[1].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[1]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            // visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });

    describe("JSON RTE field", () => {
        let jsonRteField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            jsonRteField = document.createElement("p");
            jsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor"
            );
            document.body.appendChild(jsonRteField);
            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            expect(jsonRteField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(jsonRteField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(jsonRteField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            jsonRteField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(jsonRteField),
                    }
                );
            });
        });
    });

    describe("JSON RTE field (multiple)", () => {
        let container: HTMLDivElement;
        let firstJsonRteField: HTMLParagraphElement;
        let secondJsonRteField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        // TODO decide if test is actually testing anything
        // it seems redundant
        test.skip("should have 2 add instance buttons", async () => {
            // const visualBuilder = new VisualBuilder();
            // await sleep(0);

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);

            waitFor(async () => {
                const addInstanceButtons = await screen.findAllByTestId(
                    "visual-builder-add-instance-button"
                );
                expect(addInstanceButtons.length).toBe(2);
            });
            // visualBuilder.destroy();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            // const visualBuilder = new VisualBuilder();
            // await sleep(0);

            // container.dispatchEvent(mouseClickEvent);
            fireEvent.click(container);
            await sleep(0);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[0]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            // container.children[1].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[1]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            // visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });

    describe("markdown field", () => {
        let markdownField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            markdownField = document.createElement("p");
            markdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown"
            );

            document.body.appendChild(markdownField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            markdownField.dispatchEvent(mouseClickEvent);
            expect(markdownField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            markdownField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            markdownField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            markdownField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(markdownField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            markdownField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(markdownField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            markdownField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(markdownField),
                    }
                );
            });
        });
    });

    describe("markdown field (multiple)", () => {
        let container: HTMLDivElement;
        let firstMarkdownField: HTMLParagraphElement;
        let secondMarkdownField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {});

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test.skip("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-builder__add-button"
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
                ".visual-builder__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            // const visualBuilder = new VisualBuilder();
            // await sleep(0);

            // container.dispatchEvent(mouseClickEvent);
            fireEvent.click(container);
            await sleep(0);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[0]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            // container.children[1].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[1]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            // visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });

    describe("select field", () => {
        let selectField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            selectField = document.createElement("p");
            selectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            document.body.appendChild(selectField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            selectField.dispatchEvent(mouseClickEvent);
            expect(selectField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            selectField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            selectField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            selectField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(selectField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            selectField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(selectField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            selectField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(selectField),
                    }
                );
            });
        });
    });

    describe("select field (multiple)", () => {
        let container: HTMLDivElement;
        let firstSelectField: HTMLParagraphElement;
        let secondSelectField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            // const visualBuilder = new VisualBuilder();
            // await sleep(0);

            // container.dispatchEvent(mouseClickEvent);
            fireEvent.click(container);
            await sleep(0);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[0]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            // container.children[1].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[1]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            // visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });

    describe("number field", () => {
        let numberField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(() => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string) => {
                    if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        return Promise.resolve({
                            fieldData: VALUES.number,
                        });
                    } else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                    ) {
                        return Promise.resolve({
                            "all_fields.bltapikey.en-us.number": "Number",
                        });
                    }
                    return Promise.resolve({});
                }
            );
        });

        beforeEach(() => {
            numberField = document.createElement("p");
            numberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number"
            );
            numberField.textContent = `${VALUES.number}`;

            document.body.appendChild(numberField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            numberField.dispatchEvent(mouseClickEvent);
            expect(numberField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            numberField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            numberField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            numberField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(numberField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should send a focus field message to parent", async () => {
            numberField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(numberField),
                    }
                );
            });
        });
    });

    describe("number field (multiple)", () => {
        let container: HTMLDivElement;
        let firstNumberField: HTMLParagraphElement;
        let secondNumberField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(() => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string, args) => {
                    if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        const values: Record<string, any> = {
                            number_multiple_: ["9", "12"],
                            "number_multiple_.0": "9",
                            "number_multiple_.1": "12",
                        };
                        return Promise.resolve({
                            fieldData: values[args.entryPath],
                        });
                    }
                    return Promise.resolve({});
                }
            );
        });

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_"
            );

            firstNumberField = document.createElement("p");
            firstNumberField.textContent = "9";
            firstNumberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_.0"
            );

            secondNumberField = document.createElement("p");
            secondNumberField.textContent = "12";
            secondNumberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_.1"
            );

            container.appendChild(firstNumberField);
            container.appendChild(secondNumberField);
            document.body.appendChild(container);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test.skip("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-builder__add-button"
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
                ".visual-builder__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("container should not contain a contenteditable attribute but the children can", async () => {
            fireEvent.click(container);
            await sleep(0);

            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            await sleep(0);

            await waitFor(() => {
                expect(container.children[0]).toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            await sleep(0);

            await waitFor(() => {
                expect(container.children[1]).toHaveAttribute(
                    "contenteditable"
                );
            });
        });

        test("should send a focus field message to parent", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });

    describe("boolean field", () => {
        let booleanField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            booleanField = document.createElement("p");
            booleanField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.boolean"
            );
            document.body.appendChild(booleanField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            booleanField.dispatchEvent(mouseClickEvent);
            expect(booleanField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            booleanField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            booleanField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            booleanField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(booleanField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            booleanField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(booleanField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            booleanField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(booleanField),
                    }
                );
            });
        });
    });

    describe("file field", () => {
        let fileField: HTMLParagraphElement;
        let imageField: HTMLImageElement;
        let visualBuilder: VisualBuilder;

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
            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            fileField.dispatchEvent(mouseClickEvent);
            expect(fileField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            fileField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            fileField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should not have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                fileField.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).not.toBeInTheDocument();
            expect(buttonGroup).not.toBeInTheDocument();
        });

        test.skip("should have a field path dropdown", () => {
            fileField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a replace asset button", async () => {
            await waitFor(() => {
                fileField.dispatchEvent(mouseClickEvent);
            });
            const replaceButton = document.querySelector(
                ".visual-builder__replace-button"
            );

            expect(replaceButton).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            fileField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(fileField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            fileField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(fileField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            fileField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(fileField),
                    }
                );
            });
        });
    });

    describe("file field (multiple)", () => {
        let container: HTMLDivElement;
        let firstFileField: HTMLParagraphElement;
        let secondFileField: HTMLParagraphElement;
        let firstImageField: HTMLImageElement;
        let secondImageField: HTMLImageElement;
        let visualBuilder: VisualBuilder;

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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("children should have a replace asset button", async () => {
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
                ".visual-builder__replace-button"
            );

            expect(replaceButton).toBeInTheDocument();

            await waitFor(() => {
                child2!.dispatchEvent(mouseClickEvent);
            });

            replaceButton = document.querySelector(
                ".visual-builder__replace-button"
            );

            expect(replaceButton).toBeInTheDocument();
        });

        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test.skip("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-builder__add-button"
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
                ".visual-builder__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            // const visualBuilder = new VisualBuilder();
            // await sleep(0);

            // container.dispatchEvent(mouseClickEvent);
            fireEvent.click(container);
            await sleep(0);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            // container.children[0].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[0]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            // container.children[1].dispatchEvent(mouseClickEvent);
            await sleep(0);
            await waitFor(() => {
                expect(container.children[1]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            // visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });

    describe("date field", () => {
        let dateField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            dateField = document.createElement("p");
            dateField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.date"
            );
            document.body.appendChild(dateField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            dateField.dispatchEvent(mouseClickEvent);
            expect(dateField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            dateField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            dateField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            dateField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(dateField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            dateField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(dateField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            dateField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(dateField),
                    }
                );
            });
        });
    });

    describe("link field", () => {
        let linkField: HTMLAnchorElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            linkField = document.createElement("a");
            linkField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.link.href"
            );

            document.body.appendChild(linkField);
            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            linkField.dispatchEvent(mouseClickEvent);
            expect(linkField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            linkField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            linkField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test.skip("should have a field path dropdown", () => {
            linkField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            linkField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(linkField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            linkField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(linkField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            linkField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(linkField),
                    }
                );
            });
        });
    });

    // BUG ?: test failing : should have 2 add instance buttons
    describe("link field (multiple)", () => {
        let container: HTMLDivElement;
        let firstLinkField: HTMLAnchorElement;
        let secondLinkField: HTMLAnchorElement;
        let visualBuilder: VisualBuilder;

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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test.skip("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-builder__add-button"
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
                ".visual-builder__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
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
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });

    describe("reference field", () => {
        let referenceField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            referenceField = document.createElement("p");
            referenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference"
            );
            document.body.appendChild(referenceField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            referenceField.dispatchEvent(mouseClickEvent);
            expect(referenceField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            referenceField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            referenceField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            referenceField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(referenceField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            referenceField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(referenceField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            referenceField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(referenceField),
                    }
                );
            });
        });
    });

    // BUG ?: test failing : should have a multi field toolbar with button group
    describe("reference field (multiple)", () => {
        let container: HTMLDivElement;
        let firstReferenceField: HTMLDivElement;
        let secondReferenceField: HTMLDivElement;
        let visualBuilder: VisualBuilder;

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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test.skip("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-builder__add-button"
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
                ".visual-builder__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
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
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });

    // BUG ?: test failing : should send a open quick form message to parent
    describe("group field", () => {
        let groupField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            groupField = document.createElement("p");
            groupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group"
            );
            document.body.appendChild(groupField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            vi.clearAllMocks();
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            groupField.dispatchEvent(mouseClickEvent);
            expect(groupField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            groupField.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            groupField.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            groupField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(groupField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            groupField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(groupField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            groupField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(groupField),
                    }
                );
            });
        });
    });

    describe("group (multiple)", () => {
        let container: HTMLDivElement;
        let firstGroupField: HTMLDivElement;
        let firstNestedMultiLine: HTMLParagraphElement;
        let secondGroupField: HTMLDivElement;
        let visualBuilder: VisualBuilder;

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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            container.dispatchEvent(mouseClickEvent);
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            container.dispatchEvent(mouseClickEvent);
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            container.dispatchEvent(mouseClickEvent);
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
            await waitFor(() => {
                container.dispatchEvent(mouseClickEvent);
            });

            const multiFieldToolbar = document.querySelector(
                ".visual-builder__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.querySelector(
                ".visual-builder__focused-toolbar__button-group"
            );

            expect(multiFieldToolbar).toBeInTheDocument();
            expect(buttonGroup).toBeInTheDocument();
        });

        test.skip("should have 2 add instance buttons", async () => {
            container.children[0].dispatchEvent(mouseClickEvent);

            // need to poll and check since the DOM updates are async
            const checkCondition = async () => {
                const addInstanceButtons = document.querySelectorAll(
                    ".visual-builder__add-button"
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
                ".visual-builder__add-button"
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toBeCalledWith(
                    VisualBuilderPostMessageEvents.FOCUS_FIELD,
                    {
                        DOMEditStack: getDOMEditStack(container),
                    }
                );
            });
        });
    });
});
