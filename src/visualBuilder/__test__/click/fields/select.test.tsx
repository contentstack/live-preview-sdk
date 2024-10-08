import { fireEvent, waitFor } from "@testing-library/preact";
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

    describe("select field", () => {
        let selectField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            selectField = document.createElement("p");
            selectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select"
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
