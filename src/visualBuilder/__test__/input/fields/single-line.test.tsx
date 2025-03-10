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

describe("editing a single line field", () => {
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

    describe("single line field", () => {
        let singleLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;
        let overlayWrapper: HTMLDivElement;

        beforeAll(async () => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string) => {
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

            singleLineField = document.createElement("p");
            singleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            singleLineField.textContent = "Hello world";
            document.body.appendChild(singleLineField);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                singleLineField
            );
            overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            ) as HTMLDivElement;
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            expect(singleLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should be able to edit inline text present", async () => {
            expect(singleLineField).toHaveAttribute("contenteditable");

            fireEvent.click(singleLineField);
            fireEvent.change(singleLineField, {
                target: { textContent: "test text" },
            });

            expect(singleLineField).toHaveTextContent("test text");
        });

        test("should send a update field message to parent", async () => {
            await waitFor(() => {
                expect(singleLineField).toHaveAttribute("contenteditable");
            });

            fireEvent.change(singleLineField, {
                target: { textContent: "test text" },
            });

            expect(singleLineField).toHaveTextContent("test text");

            fireEvent.click(overlayWrapper);
            await waitFor(() => {
                expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                    VisualBuilderPostMessageEvents.UPDATE_FIELD,
                    {
                        data: "test text",
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
                            },
                            variant: undefined,
                        },
                    }
                );
            });
        });
    });

    describe("single line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstSingleLineField: HTMLParagraphElement;
        let secondSingleLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
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
            firstSingleLineField.textContent = "Hello";

            secondSingleLineField = document.createElement("p");
            secondSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1"
            );
            secondSingleLineField.textContent = "world";

            container.appendChild(firstSingleLineField);
            container.appendChild(secondSingleLineField);
            document.body.appendChild(container);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                container
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });
    });
    describe("single line field (multiple): individual inline", () => {
        let container: HTMLDivElement;
        let firstSingleLineField: HTMLParagraphElement;
        let secondSingleLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;
        let overlayWrapper: HTMLDivElement;

        beforeEach(async () => {
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
            firstSingleLineField.textContent = "Hello";

            secondSingleLineField = document.createElement("p");
            secondSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1"
            );
            secondSingleLineField.textContent = "world";

            container.appendChild(firstSingleLineField);
            container.appendChild(secondSingleLineField);
            document.body.appendChild(container);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                firstSingleLineField
            );
            overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            ) as HTMLDivElement;
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should be able to edit individual inline text present", async () => {
            await waitFor(() => {
                expect(firstSingleLineField).toHaveAttribute("contenteditable");
            });

            fireEvent.click(firstSingleLineField);
            fireEvent.change(firstSingleLineField, {
                target: { textContent: "test text" },
            });

            expect(firstSingleLineField).toHaveTextContent("test text");

            secondSingleLineField.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(secondSingleLineField).toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(secondSingleLineField);
            fireEvent.change(secondSingleLineField, {
                target: { textContent: "test text" },
            });

            expect(secondSingleLineField).toHaveTextContent("test text");
        });

        test("should send a update field message to parent when editing an individual element", async () => {
            await waitFor(() => {
                expect(firstSingleLineField).toHaveAttribute("contenteditable");
            });
            fireEvent.change(firstSingleLineField, {
                target: { textContent: "test text 1" },
            });
            expect(firstSingleLineField).toHaveTextContent("test text 1");

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
                                fieldPathWithIndex:
                                    "single_line_textbox_multiple_.0",
                            },
                        },
                    }
                );
            });
        });
    });
});
