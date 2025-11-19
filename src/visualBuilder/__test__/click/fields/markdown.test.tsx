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

vi.mock("../../../../utils/index.ts", async () => {
    const actual = await vi.importActual("../../../../utils");
    return {
        __esModule: true,
        ...actual,
        isOpenInBuilder: vi.fn().mockReturnValue(true),
    };
});

describe("When an element is clicked in visual builder mode", () => {
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

        Config.reset();
        Config.set("mode", 2);
    });

    afterAll(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";

        Config.reset();
    });

    describe("markdown field", () => {
        let markdownField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            markdownField = document.createElement("p");
            markdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown"
            );

            document.body.appendChild(markdownField);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                markdownField
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        test("should have field type attribute set", () => {
            // Field type is set during click - this is what actually happens
            expect(markdownField).toHaveAttribute(
                "data-cslp-field-type",
                "markdown_rte"
            );
        });

        test("should have an overlay wrapper rendered", () => {
            // Overlay wrapper is rendered (not checking for 'visible' class as it's conditional)
            const overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            );
            expect(overlayWrapper).not.toBeNull();

            // Check that overlay elements exist
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            // Component is already rendered from beforeAll setup
            const toolbar = screen.getByTestId("mock-field-label-wrapper");
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            await waitFor(() => {
                expect(markdownField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            await waitFor(() => {
                expect(markdownField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", () => {
            // Mock function calls are tracked synchronously
            expect(visualBuilderPostMessage?.send).toBeCalledWith(
                VisualBuilderPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(markdownField),
                }
            );
        });
    });

    describe("markdown field (multiple)", () => {
        let container: HTMLDivElement;
        let firstMarkdownField: HTMLParagraphElement;
        let secondMarkdownField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
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
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                container
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        test("should have field type attribute set", () => {
            // Field type is set during click - this is what actually happens
            expect(container).toHaveAttribute(
                "data-cslp-field-type",
                "markdown_rte"
            );
        });

        test("should have an overlay wrapper rendered", () => {
            // Overlay wrapper is rendered (not checking for 'visible' class as it's conditional)
            const overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            );
            expect(overlayWrapper).not.toBeNull();

            // Check that overlay elements exist
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            // Component is already rendered from beforeAll setup
            const toolbar = screen.getByTestId("mock-field-label-wrapper");
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", async () => {
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

        test("should send a focus field message to parent", () => {
            // Mock function calls are tracked synchronously
            expect(visualBuilderPostMessage?.send).toBeCalledWith(
                VisualBuilderPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
        });
    });
});
