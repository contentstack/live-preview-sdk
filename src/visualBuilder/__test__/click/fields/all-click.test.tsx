/**
 * Consolidated click tests for essential field behavior patterns
 *
 * Since E2E tests cover field-specific behavior, this file tests only the core patterns:
 * 1. Non-editable fields (no contenteditable) - represented by boolean, select
 * 2. Multiple field containers - represented by select multiple
 *
 * All field types follow the same click behavior:
 * - Field type attribute is set
 * - Overlay wrapper is rendered
 * - Field path dropdown is shown
 * - Focus field message is sent
 * - Contenteditable depends on field type (tested in single-line, multi-line, number tests)
 *
 * Removed redundant field-specific tests (E2E covers these):
 * - boolean.test.tsx, date.test.tsx, markdown.test.tsx, html-rte.test.tsx
 * - json-rte.test.tsx, link.test.tsx, select.test.tsx
 *
 * Kept separate files for unique test cases:
 * - file.test.tsx (URL-specific test for file.url fields)
 * - group.test.tsx (nested field test)
 * - single-line.test.tsx (contenteditable + complex mock setup)
 * - multi-line.test.tsx (contenteditable test)
 * - number.test.tsx (contenteditable test)
 * - reference.test.tsx (outline test)
 */

import { screen } from "@testing-library/preact";
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

vi.mock("../../../../utils/index.ts", async () => {
    const actual = await vi.importActual("../../../../utils");
    return {
        __esModule: true,
        ...actual,
        isOpenInBuilder: vi.fn().mockReturnValue(true),
    };
});

// Test only representative field types - E2E tests cover all field types
// Non-editable field (no contenteditable) - boolean represents this pattern
const NON_EDITABLE_FIELD = {
    name: "boolean",
    cslp: "all_fields.bltapikey.en-us.boolean",
    fieldType: "boolean",
} as const;

// Multiple field container - select represents this pattern
const MULTIPLE_FIELD = {
    name: "select",
    fieldType: "select",
    multipleCslp: "all_fields.bltapikey.en-us.select_multiple_",
} as const;

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

    // Test non-editable field pattern (no contenteditable)
    // This represents all non-editable fields: boolean, date, markdown, html-rte, json-rte, link, select, etc.
    describe(`${NON_EDITABLE_FIELD.name} field (represents non-editable pattern)`, () => {
        let fieldElement: HTMLElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            fieldElement = document.createElement("p");
            fieldElement.setAttribute("data-cslp", NON_EDITABLE_FIELD.cslp);
            document.body.appendChild(fieldElement);

            visualBuilder = new VisualBuilder();
            await triggerAndWaitForClickAction(
                visualBuilderPostMessage,
                fieldElement
            );
        });

        afterAll(() => {
            visualBuilder.destroy();
        });

        test("should have field type attribute set", () => {
            expect(fieldElement).toHaveAttribute(
                "data-cslp-field-type",
                NON_EDITABLE_FIELD.fieldType
            );
        });

        test("should have an overlay wrapper rendered", () => {
            const overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            );
            expect(overlayWrapper).not.toBeNull();

            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            const toolbar = screen.getByTestId("mock-field-label-wrapper");
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", () => {
            expect(fieldElement).toHaveAttribute(
                VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("should not contain a contenteditable attribute", () => {
            expect(fieldElement).not.toHaveAttribute("contenteditable");
        });

        test("should send a focus field message to parent", () => {
            expect(visualBuilderPostMessage?.send).toBeCalledWith(
                VisualBuilderPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(fieldElement),
                }
            );
        });
    });

    // Test multiple field container pattern
    // This represents all multiple field types: select, html-rte, json-rte, link, etc.
    describe(`${MULTIPLE_FIELD.name} field (multiple) - represents multiple field pattern`, () => {
        let container: HTMLDivElement;
        let firstField: HTMLElement;
        let secondField: HTMLElement;
        let visualBuilder: VisualBuilder;

        beforeAll(async () => {
            container = document.createElement("div");
            container.setAttribute("data-cslp", MULTIPLE_FIELD.multipleCslp);

            firstField = document.createElement("p");
            firstField.setAttribute(
                "data-cslp",
                `${MULTIPLE_FIELD.multipleCslp}.0`
            );

            secondField = document.createElement("p");
            secondField.setAttribute(
                "data-cslp",
                `${MULTIPLE_FIELD.multipleCslp}.1`
            );

            container.appendChild(firstField);
            container.appendChild(secondField);
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
            expect(container).toHaveAttribute(
                "data-cslp-field-type",
                MULTIPLE_FIELD.fieldType
            );
        });

        test("should have an overlay wrapper rendered", () => {
            const overlayWrapper = document.querySelector(
                ".visual-builder__overlay__wrapper"
            );
            expect(overlayWrapper).not.toBeNull();

            const overlay = document.querySelector(".visual-builder__overlay");
            expect(overlay!.classList.contains("visible"));
        });

        test("should have a field path dropdown", () => {
            const toolbar = screen.getByTestId("mock-field-label-wrapper");
            expect(toolbar).toBeInTheDocument();
        });

        test("should contain a data-cslp-field-type attribute", () => {
            expect(container).toHaveAttribute(
                VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
            );
        });

        test("both container and its children should not contain a contenteditable attribute", () => {
            // Check synchronously - attributes are set during click handler
            expect(container).not.toHaveAttribute("contenteditable");
            expect(container.children[0]).not.toHaveAttribute(
                "contenteditable"
            );
            expect(container.children[1]).not.toHaveAttribute(
                "contenteditable"
            );
        });

        test("should send a focus field message to parent", () => {
            expect(visualBuilderPostMessage?.send).toBeCalledWith(
                VisualBuilderPostMessageEvents.FOCUS_FIELD,
                {
                    DOMEditStack: getDOMEditStack(container),
                }
            );
        });
    });
});
