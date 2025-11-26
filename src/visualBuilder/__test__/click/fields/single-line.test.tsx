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

    describe("single line field", () => {
        let singleLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;
        beforeAll(async () => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string) => {
                    switch (eventName) {
                        case VisualBuilderPostMessageEvents.GET_FIELD_DATA:
                            return Promise.resolve({
                                fieldData: VALUES.singleLine,
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
            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                singleLineField
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        // Common tests (field type, overlay, dropdown, focus message) are covered in all-click.test.tsx
        // Only testing unique behavior: contenteditable attribute for editable fields
        test("should contain a contenteditable attribute", () => {
            // Attribute is set synchronously during click handler
            expect(singleLineField).toHaveAttribute("contenteditable");
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
                    switch (eventName) {
                        case VisualBuilderPostMessageEvents.GET_FIELD_DATA: {
                            const values: Record<string, any> = {
                                single_line_textbox_multiple_: [
                                    "Hello",
                                    "world",
                                ],
                                "single_line_textbox_multiple_.0": "Hello",
                                "single_line_textbox_multiple_.1": "world",
                            };
                            return Promise.resolve({
                                fieldData: values[args.entryPath],
                            });
                        }
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
            // Container contenteditable check is synchronous
            expect(container).not.toHaveAttribute("contenteditable");

            // Child contenteditable is set asynchronously after click
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
