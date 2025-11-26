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

const EXAMPLE_STAGE_NAME = "Example Stage";

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

    describe("multi line field", () => {
        let multiLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string, args) => {
                    switch (eventName) {
                        case VisualBuilderPostMessageEvents.GET_FIELD_DATA:
                            return Promise.resolve({
                                fieldData: "Hello world",
                            });
                        case VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES:
                            return Promise.resolve({
                                "all_fields.bltapikey.en-us.single_line":
                                    "Single Line",
                            });
                        case VisualBuilderPostMessageEvents.GET_WORKFLOW_STAGE_DETAILS:
                            return Promise.resolve({
                                stage: { name: EXAMPLE_STAGE_NAME },
                                permissions: {
                                    entry: {
                                        update: true,
                                    },
                                },
                            });
                        default:
                            return Promise.resolve({});
                    }
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
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        // Common tests (field type, overlay, dropdown, focus message) are covered in all-click.test.tsx
        // Only testing unique behavior: contenteditable attribute for editable fields
        test("should contain a contenteditable attribute", () => {
            // Attribute is set synchronously
            expect(multiLineField).toHaveAttribute("contenteditable");
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
                    switch (eventName) {
                        case VisualBuilderPostMessageEvents.GET_FIELD_DATA: {
                            const values: Record<string, any> = {
                                multi_line_textbox_multiple_: [
                                    "Hello",
                                    "world",
                                ],
                                "multi_line_textbox_multiple_.0": "Hello",
                                "multi_line_textbox_multiple_.1": "world",
                            };
                            return Promise.resolve({
                                fieldData: values[args.entryPath],
                            });
                        }
                        case VisualBuilderPostMessageEvents.GET_WORKFLOW_STAGE_DETAILS: {
                            return Promise.resolve({
                                stage: { name: EXAMPLE_STAGE_NAME },
                                permissions: {
                                    entry: {
                                        update: true,
                                    },
                                },
                            });
                        }
                        default:
                            return Promise.resolve({});
                    }
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

            // Reset global state for test
            VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                null;
            VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
                null;
            VisualBuilder.VisualBuilderGlobalState.value.previousEmptyBlockParents =
                [];
            VisualBuilder.VisualBuilderGlobalState.value.audienceMode = false;
            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                container
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });
        // Common tests (field type, overlay, dropdown, focus message) are covered in all-click.test.tsx
        // Only testing unique behavior: contenteditable on children for editable multiple fields
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
    });
});
