import { fireEvent, waitFor } from "@testing-library/preact";
import { Mock } from "vitest";
import { VisualBuilder } from "../../..";
import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { triggerAndWaitForClickAction } from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";

vi.mock("../utils/visualBuilderPostMessage", async () => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("../../../../__test__/data/contentType")
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

vi.mock("../components/FieldToolbar", () => {
    return {
        default: () => {
            return <div>Field Toolbar</div>;
        },
    };
});

vi.mock("../components/fieldLabelWrapper", () => {
    return {
        default: () => {
            return <div>Field Label</div>;
        },
    };
});

describe("editing a multiline field", () => {
    let mouseClickEvent: Event;

    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );

        Config.reset();
        Config.set("mode", 2);
        mouseClickEvent = new Event("click", {
            bubbles: true,
            cancelable: true,
        });
    });

    afterAll(() => {
        vi.clearAllMocks();
        document.getElementsByTagName("html")[0].innerHTML = "";

        Config.reset();
    });

    afterEach(() => {
        (visualBuilderPostMessage?.send as Mock)?.mockClear();
    });

    describe("multi line field", () => {
        let multiLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;
        let overlayWrapper: HTMLDivElement;

        beforeAll(async () => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string, args) => {
                    if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        return Promise.resolve({
                            fieldData: "Hello world",
                        });
                    }
                    return Promise.resolve({});
                }
            );

            multiLineField = document.createElement("p");
            multiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line"
            );
            multiLineField.textContent = "Hello world";
            document.body.appendChild(multiLineField);
            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                multiLineField
            );
            overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            ) as HTMLDivElement;
        });

        afterAll(() => {
            visualBuilder.destroy();
            (visualBuilderPostMessage?.send as Mock).mockClear();
        });

        test("should have outline", () => {
            expect(multiLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should be able to edit inline text present", async () => {
            fireEvent.change(multiLineField, {
                target: { textContent: "test text" },
            });

            expect(multiLineField).toHaveTextContent("test text");
        });

        test("should send a update field message to parent", async () => {
            fireEvent.change(multiLineField, {
                target: { textContent: "test text" },
            });
            expect(multiLineField).toHaveTextContent("test text");

            overlayWrapper.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                    VisualBuilderPostMessageEvents.UPDATE_FIELD,
                    {
                        data: "test text",
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
                            },
                        },
                    }
                );
            });
        });
    });

    describe("multi line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstMultiLineField: HTMLParagraphElement;
        let secondMultiLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;
        let overlayWrapper: HTMLDivElement;

        beforeAll(async () => {
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
            firstMultiLineField.textContent = "Hello";

            secondMultiLineField = document.createElement("p");
            secondMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.1"
            );
            secondMultiLineField.textContent = "world";

            container.appendChild(firstMultiLineField);
            container.appendChild(secondMultiLineField);
            document.body.appendChild(container);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                container
            );
            overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            ) as HTMLDivElement;
        });

        afterAll(() => {
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
    });
    describe("multi line field (multiple): individual inline", () => {
        let container: HTMLDivElement;
        let firstMultiLineField: HTMLParagraphElement;
        let secondMultiLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(async () => {
            document.body.innerHTML = "";
            (visualBuilderPostMessage?.send as Mock).mockClear();
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
            firstMultiLineField.textContent = "Hello";

            secondMultiLineField = document.createElement("p");
            secondMultiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.1"
            );
            secondMultiLineField.textContent = "world";

            container.appendChild(firstMultiLineField);
            container.appendChild(secondMultiLineField);
            document.body.appendChild(container);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                firstMultiLineField
            );
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should be able to edit individual inline text present", async () => {
            fireEvent.change(firstMultiLineField, {
                target: { textContent: "test text" },
            });
            expect(firstMultiLineField).toHaveTextContent("test text");

            secondMultiLineField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(secondMultiLineField).toHaveAttribute("contenteditable");
            });

            fireEvent.click(secondMultiLineField);
            fireEvent.change(secondMultiLineField, {
                target: { textContent: "test text" },
            });

            expect(secondMultiLineField).toHaveTextContent("test text");
        });

        test("should send a update field message to parent when editing an individual element", async () => {
            fireEvent.change(firstMultiLineField, {
                target: { textContent: "test text 1" },
            });

            expect(firstMultiLineField).toHaveTextContent("test text 1");
            const overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            ) as HTMLDivElement;
            fireEvent.click(overlayWrapper);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                    VisualBuilderPostMessageEvents.UPDATE_FIELD,
                    {
                        data: "test text 1",
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
                            instance: {
                                fieldPathWithIndex:
                                    "multi_line_textbox_multiple_.0",
                            },
                        },
                    }
                );
            });
        });
    });
});
