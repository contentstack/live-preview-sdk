import { fireEvent, screen, waitFor } from "@testing-library/preact";
import "@testing-library/jest-dom";
import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import Config from "../../../../configManager/configManager";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../../../utils/constants";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { getDOMEditStack } from "../../../utils/getCsDataOfElement";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";
import { vi } from "vitest";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import { VisualBuilder } from "../../../index";
import { sleep } from "../../../../__test__/utils";

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
            container.dispatchEvent(mouseClickEvent);
            await waitFor(() => {
                expect(container).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("both container and its children should not contain a contenteditable attribute", async () => {
            fireEvent.click(container);
            await waitFor(() => {
                expect(container).not.toHaveAttribute("contenteditable");
            });

            fireEvent.click(container.children[0]);
            await waitFor(() => {
                expect(container.children[0]).not.toHaveAttribute(
                    "contenteditable"
                );
            });

            fireEvent.click(container.children[1]);
            await waitFor(() => {
                expect(container.children[1]).not.toHaveAttribute(
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
});