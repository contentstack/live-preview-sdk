import { fireEvent, waitFor, screen } from "@testing-library/preact";
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

const VALUES = {
    singleLine: "Single line",
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

    describe("select field", () => {
        let selectField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            selectField = document.createElement("p");
            selectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select"
            );
            document.body.appendChild(selectField);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                selectField
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        test("should have outline", () => {
            expect(selectField.classList.contains("cslp-edit-mode"));
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
                expect(selectField).toHaveAttribute(
                    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
                );
            });
        });

        test("should not contain a contenteditable attribute", async () => {
            await waitFor(() => {
                expect(selectField).not.toHaveAttribute("contenteditable");
            });
        });

        test("should send a focus field message to parent", async () => {
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

        beforeAll(async () => {
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
