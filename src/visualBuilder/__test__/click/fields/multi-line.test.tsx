import { fireEvent, screen, waitFor } from "@testing-library/preact";
import "@testing-library/jest-dom";
import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import Config from "../../../../configManager/configManager";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../../../utils/constants";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { getDOMEditStack } from "../../../utils/getCsDataOfElement";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";
import { Mock, vi } from "vitest";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import { VisualBuilder } from "../../../index";
import { triggerAndWaitForClickAction } from "../../../../__test__/utils";

vi.mock("../../../components/FieldToolbar", () => {
    return {
        default: () => {
            return <div>Field Toolbar</div>;
        },
    };
});

vi.mock("../../../components/fieldLabelWrapper", () => {
    return {
        default: () => {
            return (
                <div data-testid="mock-field-label-wrapper">Field Label</div>
            );
        },
    };
});

vi.mock("../../../utils/visualBuilderPostMessage", async () => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("../../../../__test__/data/contentType")
    >("../../../../__test__/data/contentType");
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

    beforeAll(async () => {
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

        Config.reset();
        Config.set("mode", 2);
    });

    afterAll(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";

        Config.reset();
    });

    describe("multi line field", () => {
        let multiLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

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

            multiLineField = document.createElement("p");
            multiLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.multi_line"
            );
            multiLineField.textContent = "Hello world";
            document.body.appendChild(multiLineField);
            visualBuilder = new VisualBuilder();

            await triggerAndWaitForClickAction(visualBuilderPostMessage, multiLineField)
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            expect(multiLineField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", async () => {
            await waitFor(() => {
                const toolbar = document.querySelector(
                    ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
                );
                expect(toolbar).toBeInTheDocument();
            });
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            await waitFor(() => {
                expect(multiLineField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should contain a contenteditable attribute", async () => {
            await waitFor(() => {
                expect(multiLineField).toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
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
        let visualBuilder: VisualBuilder;
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
            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(visualBuilderPostMessage, container);
        });

        afterAll(() => {
            visualBuilder.destroy();
        })
        test("should have outline", () => {
            expect(container.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test.skip("should have a field path dropdown", () => {
            const toolbar = document.querySelector(
                ".visual-builder__focused-toolbar__field-label-wrapper__current-field"
            );
            expect(toolbar).toBeInTheDocument();
        });

        // TODO should be a test of FieldToolbar
        test.skip("should have a multi field toolbar with button group", async () => {
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
            fireEvent.click(container.children[0]);
            await waitFor(() => {
                expect(container.children[0]).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });

            await waitFor(() => {
                const addInstanceButtons = screen.getAllByTestId(
                    "visual-builder-add-instance-button"
                );
                expect(addInstanceButtons.length).toBe(2);
            });
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });

        });

        test("container should not contain a contenteditable attribute but the children can", async () => {
            fireEvent.click(container);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            await waitFor(() => {
                expect(container.children[0]).toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            await waitFor(() => {
                expect(container.children[1]).toHaveAttribute(
                    "contenteditable"
                );
            });
        });

        test("should send a focus field message to parent", async () => {
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
