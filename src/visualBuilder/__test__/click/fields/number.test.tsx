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

const VALUES = {
    number: "10.5",
};

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

    describe("number field", () => {
        let numberField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
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
                    } else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_WORKFLOW_STAGE_DETAILS
                    ) {
                        return Promise.resolve({
                            stage: { name: "Example Stage" },
                            permissions: {
                                entry: {
                                    update: true,
                                },
                            },
                        });
                    }
                    return Promise.resolve({});
                }
            );

            numberField = document.createElement("p");
            numberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number"
            );
            numberField.textContent = `${VALUES.number}`;

            document.body.appendChild(numberField);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                numberField
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            expect(numberField.classList.contains("cslp-edit-mode"));
        });

        test("should have an overlay", () => {
            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", async () => {
            await waitFor(async () => {
                const toolbar = await screen.findByTestId(
                    "mock-field-label-wrapper"
                );
                expect(toolbar).toBeInTheDocument();
            });
        });

        test("should contain a data-cslp-field-type attribute", async () => {
            await waitFor(() => {
                expect(numberField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should send a focus field message to parent", async () => {
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

        beforeAll(async () => {
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
                    } else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_WORKFLOW_STAGE_DETAILS
                    ) {
                        return Promise.resolve({
                            stage: { name: "Example Stage" },
                            permissions: {
                                entry: {
                                    update: true,
                                },
                            },
                        });
                    }
                    return Promise.resolve({});
                }
            );

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

        test("should have a field path dropdown", async () => {
            await waitFor(async () => {
                const toolbar = await screen.findByTestId(
                    "mock-field-label-wrapper"
                );
                expect(toolbar).toBeInTheDocument();
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
