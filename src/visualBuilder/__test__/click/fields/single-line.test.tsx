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
import { sleep } from "../../../../__test__/utils";

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

            await waitFor(async () => {
                const fieldLabel = screen.getByTestId(
                    "mock-field-label-wrapper"
                );
                expect(fieldLabel).toBeInTheDocument();
            });

            visualBuilder.destroy();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            const visualBuilder = new VisualBuilder();

            fireEvent.click(singleLineField);

            await waitFor(() =>
                expect(singleLineField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                )
            );

            visualBuilder.destroy();
        });

        test("should contain a contenteditable attribute", async () => {
            const visualBuilder = new VisualBuilder();

            fireEvent.click(singleLineField);

            await waitFor(() => {
                expect(singleLineField).toHaveAttribute("contenteditable");
            });

            visualBuilder.destroy();
        });

        test("should send a focus field message to parent", async () => {
            const visualBuilder = new VisualBuilder();

            fireEvent.click(singleLineField);

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

            visualBuilder.destroy();
        });

        test.skip("should have 2 add instance buttons", async () => {
            const visualBuilder = new VisualBuilder();

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
});
