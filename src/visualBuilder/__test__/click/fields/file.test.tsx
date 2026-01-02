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

        Config.reset();
        Config.set("mode", 2);
        mouseClickEvent = new Event("click", {
            bubbles: true,
            cancelable: true,
        });
    });

    afterAll(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";

        Config.reset();
    });

    describe("file field", () => {
        let fileField: HTMLParagraphElement;
        let imageField: HTMLImageElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string, args?: any) => {
                    switch (eventName) {
                        case VisualBuilderPostMessageEvents.GET_FIELD_DATA:
                            // Return appropriate field data based on entryPath
                            if (args?.entryPath?.includes("file.url")) {
                                return Promise.resolve({
                                    fieldData: "https://example.com/image.jpg",
                                });
                            }
                            return Promise.resolve({
                                fieldData: {
                                    uid: "file-uid",
                                    url: "https://example.com/image.jpg",
                                },
                            });
                        case VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES:
                            return Promise.resolve({
                                "all_fields.bltapikey.en-us.file": "File",
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
                        case VisualBuilderPostMessageEvents.GET_RESOLVED_VARIANT_PERMISSIONS:
                            return Promise.resolve({
                                update: true,
                            });
                        default:
                            return Promise.resolve({});
                    }
                }
            );

            fileField = document.createElement("p");
            fileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file"
            );

            imageField = document.createElement("img");
            imageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file.url"
            );

            document.body.appendChild(fileField);
            document.body.appendChild(imageField);
            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                fileField
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        // Common tests (field type, overlay, dropdown, focus message, no contenteditable) are covered in all-click.test.tsx
        // Only testing unique behavior: file.url sub-fields can be clicked
        test("should handle clicking on file.url sub-field", async () => {
            // Click on the image field (file.url sub-field)
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                imageField
            );

            // Verify the sub-field also gets the field type attribute
            expect(imageField).toHaveAttribute(
                VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });
    });

    describe("file field (multiple)", () => {
        let container: HTMLDivElement;
        let firstFileField: HTMLParagraphElement;
        let secondFileField: HTMLParagraphElement;
        let firstImageField: HTMLImageElement;
        let secondImageField: HTMLImageElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            (visualBuilderPostMessage?.send as Mock).mockImplementation(
                (eventName: string, args?: any) => {
                    switch (eventName) {
                        case VisualBuilderPostMessageEvents.GET_FIELD_DATA: {
                            const values: Record<string, any> = {
                                file_multiple_: [
                                    {
                                        uid: "file-uid-1",
                                        url: "https://example.com/image1.jpg",
                                    },
                                    {
                                        uid: "file-uid-2",
                                        url: "https://example.com/image2.jpg",
                                    },
                                ],
                                "file_multiple_.0": {
                                    uid: "file-uid-1",
                                    url: "https://example.com/image1.jpg",
                                },
                                "file_multiple_.1": {
                                    uid: "file-uid-2",
                                    url: "https://example.com/image2.jpg",
                                },
                                "file_multiple_.0.url":
                                    "https://example.com/image1.jpg",
                                "file_multiple_.1.url":
                                    "https://example.com/image2.jpg",
                            };
                            return Promise.resolve({
                                fieldData: values[args?.entryPath] || {},
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
                        case VisualBuilderPostMessageEvents.GET_RESOLVED_VARIANT_PERMISSIONS:
                            return Promise.resolve({
                                update: true,
                            });
                        default:
                            return Promise.resolve({});
                    }
                }
            );

            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_"
            );

            firstFileField = document.createElement("p");
            firstFileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.0"
            );

            secondFileField = document.createElement("p");
            secondFileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.1"
            );

            firstImageField = document.createElement("img");
            firstImageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.0.url"
            );

            secondImageField = document.createElement("img");
            secondImageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.1.url"
            );

            container.appendChild(firstFileField);
            container.appendChild(secondFileField);
            container.appendChild(firstImageField);
            container.appendChild(secondImageField);
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

        // Common tests (field type, overlay, dropdown, focus message, no contenteditable) are covered in all-click.test.tsx
        // Only testing unique behavior: file.url sub-fields in multiple file fields
        test("should handle clicking on file.url sub-fields in multiple file fields", async () => {
            // Click on first image field (file.url sub-field)
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                firstImageField
            );
            expect(firstImageField).toHaveAttribute(
                VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
            );

            // Click on second image field
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                secondImageField
            );
            expect(secondImageField).toHaveAttribute(
                VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });
    });
});
