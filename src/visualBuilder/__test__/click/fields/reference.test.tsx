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
import {
    mockGetBoundingClientRect,
    sleep,
    triggerAndWaitForClickAction,
} from "../../../../__test__/utils";

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

    describe("reference field", () => {
        let referenceField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            referenceField = document.createElement("p");
            referenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference"
            );
            mockGetBoundingClientRect(referenceField);
            document.body.appendChild(referenceField);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                referenceField
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        // Common tests (field type, overlay, dropdown, focus message, no contenteditable) are covered in all-click.test.tsx
        // Only testing unique behavior: reference fields have a specific outline style
        test("should have outline", async () => {
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__overlay--outline']"
            );
            await waitFor(() => {
                expect(hoverOutline).toHaveAttribute("style");
            });

            expect(hoverOutline).toHaveAttribute(
                "style",
                "top: 10px; height: 5px; width: 10px; left: 10px; outline-color: rgb(113, 92, 221);"
            );
        });
    });

    describe("reference field (multiple)", () => {
        let container: HTMLDivElement;
        let firstReferenceField: HTMLDivElement;
        let secondReferenceField: HTMLDivElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference_multiple_"
            );

            firstReferenceField = document.createElement("div");
            firstReferenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference_multiple_.0"
            );

            secondReferenceField = document.createElement("div");
            secondReferenceField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.reference_multiple_.1"
            );

            mockGetBoundingClientRect(container);
            container.appendChild(firstReferenceField);
            container.appendChild(secondReferenceField);
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
        // Only testing unique behavior: reference fields have a specific outline style
        test("should have outline", async () => {
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__overlay--outline']"
            );
            await waitFor(() => {
                expect(hoverOutline).toHaveAttribute("style");
            });
            expect(hoverOutline).toHaveAttribute(
                "style",
                "top: 10px; height: 5px; width: 10px; left: 10px; outline-color: rgb(113, 92, 221);"
            );
        });
    });
});
