/**
 * Consolidated hover tests for essential field behavior patterns
 *
 * Since E2E tests cover field-specific behavior (different icons), this file tests only the core patterns:
 * 1. Single field: shows outline and custom cursor with icon
 * 2. Multiple field container: shows outline and cursor on container
 * 3. Multiple field instance: shows outline and cursor on individual instances
 *
 * All field types follow the same hover behavior - only the icon differs (tested in E2E).
 *
 * Removed redundant field-specific tests (E2E covers these):
 * - boolean.test.ts, date.test.ts, number.test.ts, markdown.test.ts
 * - html-rte.test.ts, json-rte.test.ts, link.test.ts, reference.test.ts, select.test.ts
 *
 * Kept separate files for unique test cases:
 * - file.test.ts (URL-specific test for file.url fields)
 * - group.test.ts (nested field test)
 * - single-line.test.ts (title field test with specific style assertions)
 */

import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { waitForHoverOutline } from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { VisualBuilder } from "../../../index";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { mockDomRect } from "./mockDomRect";
import { waitFor } from "@testing-library/preact";

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
                // Resolve all other calls immediately to avoid async delays
                return Promise.resolve({});
            }),
        },
    };
});

// Mock fetchEntryPermissionsAndStageDetails to resolve immediately - this is called during hover
// Mock fetchEntryPermissionsAndStageDetails to resolve immediately - speeds up hover tests
vi.mock("../../../utils/fetchEntryPermissionsAndStageDetails", () => ({
    fetchEntryPermissionsAndStageDetails: vi.fn().mockResolvedValue({
        acl: {
            create: true,
            read: true,
            update: true,
            delete: true,
            publish: true,
        },
        workflowStage: {
            stage: undefined,
            permissions: {
                entry: {
                    update: true,
                },
            },
        },
        resolvedVariantPermissions: {
            update: true,
        },
    }),
}));

vi.mock("../../../../utils/index.ts", async () => {
    const actual = await vi.importActual("../../../../utils");
    return {
        __esModule: true,
        ...actual,
        isOpenInBuilder: vi.fn().mockReturnValue(true),
    };
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Test only representative field types - E2E tests cover all field types and their icons
// Single field (no multiple support) - boolean represents this pattern
const SINGLE_FIELD = {
    name: "boolean",
    cslp: "all_fields.bltapikey.en-us.boolean",
    icon: "boolean",
} as const;

// Multiple field - select represents this pattern
const MULTIPLE_FIELD = {
    name: "select",
    cslp: "all_fields.bltapikey.en-us.select",
    icon: "select",
    multipleCslp: "all_fields.bltapikey.en-us.select_multiple_",
} as const;

describe("When an element is hovered in visual builder mode", () => {
    let mousemoveEvent: Event;
    const fieldSchemaMap = getFieldSchemaMap().all_fields;

    beforeAll(() => {
        // Pre-set all field schemas in cache to avoid async fetches during hover
        // This significantly speeds up tests, especially for html-rte, json-rte, link fields
        FieldSchemaMap.setFieldSchema("all_fields", fieldSchemaMap);

        // Field schemas are already set above - no need for additional caching
        // The FieldSchemaMap.setFieldSchema call above sets all fields at once
    });

    beforeEach(() => {
        Config.reset();
        Config.set("mode", 2);
        mousemoveEvent = new Event("mousemove", {
            bubbles: true,
            cancelable: true,
        });
    });

    afterEach(async () => {
        // Wait longer for any pending async operations (like fetchEntryPermissionsAndStageDetails) to complete
        // await new Promise((resolve) => setTimeout(resolve, 500));
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
    });

    // Test single field pattern (no multiple support)
    // This represents all single-only fields: boolean, date, markdown, etc.
    describe(`${SINGLE_FIELD.name} field (represents single field pattern)`, () => {
        let fieldElement: HTMLElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            fieldElement = document.createElement("p");
            fieldElement.setAttribute("data-cslp", SINGLE_FIELD.cslp);
            fieldElement.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(fieldElement);
            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            fieldElement.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    expect(customCursor).toHaveAttribute(
                        "data-icon",
                        SINGLE_FIELD.icon
                    );
                },
                { timeout: 5000, interval: 10 }
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute(
                "data-icon",
                SINGLE_FIELD.icon
            );
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    // Test multiple field pattern
    // This represents all multiple field types: select, html-rte, json-rte, link, reference, etc.
    describe(`${MULTIPLE_FIELD.name} field (represents multiple field pattern)`, () => {
        let fieldElement: HTMLElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            fieldElement = document.createElement("p");
            fieldElement.setAttribute("data-cslp", MULTIPLE_FIELD.cslp);
            fieldElement.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(fieldElement);
            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            fieldElement.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    expect(customCursor).toHaveAttribute(
                        "data-icon",
                        MULTIPLE_FIELD.icon
                    );
                },
                { timeout: 5000, interval: 10 }
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute(
                "data-icon",
                MULTIPLE_FIELD.icon
            );
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    // Test multiple field container pattern
    describe(`${MULTIPLE_FIELD.name} field (multiple) - represents multiple container pattern`, () => {
        let container: HTMLDivElement;
        let firstField: HTMLElement;
        let secondField: HTMLElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute("data-cslp", MULTIPLE_FIELD.multipleCslp);
            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstField = document.createElement("p");
            firstField.setAttribute(
                "data-cslp",
                `${MULTIPLE_FIELD.multipleCslp}.0`
            );
            firstField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondField = document.createElement("p");
            secondField.setAttribute(
                "data-cslp",
                `${MULTIPLE_FIELD.multipleCslp}.1`
            );
            secondField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstField);
            container.appendChild(secondField);
            document.body.appendChild(container);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor on container", async () => {
            container.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    expect(customCursor).toHaveAttribute(
                        "data-icon",
                        MULTIPLE_FIELD.icon
                    );
                },
                { timeout: 5000, interval: 10 }
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute(
                "data-icon",
                MULTIPLE_FIELD.icon
            );
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline and custom cursor on individual instances", async () => {
            firstField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    expect(customCursor).toHaveAttribute(
                        "data-icon",
                        MULTIPLE_FIELD.icon
                    );
                },
                { timeout: 5000, interval: 10 }
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute(
                "data-icon",
                MULTIPLE_FIELD.icon
            );
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
