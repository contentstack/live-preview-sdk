/**
 * Consolidated hover tests for all field types
 *
 * This file replaces multiple redundant test files that were testing the same scenarios
 * for different field types. All field types follow the same hover behavior pattern:
 * 1. Single field: shows outline and custom cursor with correct icon
 * 2. Multiple field container: shows outline and cursor on container
 * 3. Multiple field instance: shows outline and cursor on individual instances
 *
 * Removed redundant files:
 * - boolean.test.ts (only had single field test)
 * - date.test.ts (only had single field test)
 * - number.test.ts (standard pattern)
 * - markdown.test.ts (standard pattern)
 * - html-rte.test.ts (standard pattern)
 * - json-rte.test.ts (standard pattern)
 * - link.test.ts (standard pattern)
 * - reference.test.ts (standard pattern)
 * - select.test.ts (standard pattern)
 *
 * Kept separate files for unique test cases:
 * - file.test.ts (has URL-specific test for file.url fields)
 * - group.test.ts (has nested field test)
 * - single-line.test.ts (has title field test with specific style assertions)
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

// Mock waitForHoverOutline to wait for outline with optimized timeout
// This speeds up tests while still ensuring the outline is actually present
vi.mock("../../../../__test__/utils", async () => {
    const actual = await vi.importActual<
        typeof import("../../../../__test__/utils")
    >("../../../../__test__/utils");
    const { waitFor } = await import("@testing-library/preact");

    return {
        ...actual,
        waitForHoverOutline: vi.fn().mockImplementation(async () => {
            // Wait for outline with shorter timeout and faster polling for tests
            await waitFor(
                () => {
                    const hoverOutline = document.querySelector(
                        "[data-testid='visual-builder__hover-outline'][style]"
                    );
                    if (!hoverOutline) {
                        throw new Error("Hover outline not found");
                    }
                },
                { timeout: 5000, interval: 10 }
            );
        }),
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

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Field type configurations for parameterized testing
// Note: Some field types (boolean, date, markdown) don't have multiple field support or have different CSLP patterns
// They are only tested as single fields
const SINGLE_FIELD_TYPES = [
    {
        name: "boolean",
        cslp: "all_fields.bltapikey.en-us.boolean",
        icon: "boolean",
    },
    { name: "date", cslp: "all_fields.bltapikey.en-us.date", icon: "isodate" },
    {
        name: "markdown",
        cslp: "all_fields.bltapikey.en-us.markdown",
        icon: "markdown_rte",
    },
] as const;

const MULTIPLE_FIELD_TYPES = [
    {
        name: "number",
        cslp: "all_fields.bltapikey.en-us.number",
        icon: "number",
        multipleCslp: "all_fields.bltapikey.en-us.number_multiple_",
    },
    {
        name: "html-rte",
        cslp: "all_fields.bltapikey.en-us.rich_text_editor",
        icon: "html_rte",
        multipleCslp: "all_fields.bltapikey.en-us.rich_text_editor_multiple_",
    },
    {
        name: "json-rte",
        cslp: "all_fields.bltapikey.en-us.json_rte",
        icon: "json_rte",
        multipleCslp:
            "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_",
    },
    {
        name: "link",
        cslp: "all_fields.bltapikey.en-us.link",
        icon: "link",
        multipleCslp: "all_fields.bltapikey.en-us.link_multiple_",
    },
    {
        name: "reference",
        cslp: "all_fields.bltapikey.en-us.reference",
        icon: "reference",
        multipleCslp: "all_fields.bltapikey.en-us.reference_multiple_",
    },
    {
        name: "select",
        cslp: "all_fields.bltapikey.en-us.select",
        icon: "select",
        multipleCslp: "all_fields.bltapikey.en-us.select_multiple_",
    },
    {
        name: "single-line",
        cslp: "all_fields.bltapikey.en-us.single_line",
        icon: "singleline",
        multipleCslp:
            "all_fields.bltapikey.en-us.single_line_textbox_multiple_",
    },
    {
        name: "multi-line",
        cslp: "all_fields.bltapikey.en-us.multi_line",
        icon: "multiline",
        multipleCslp: "all_fields.bltapikey.en-us.multi_line_textbox_multiple_",
    },
] as const;

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
        await new Promise((resolve) => setTimeout(resolve, 500));
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
    });

    // Parameterized tests for single-only field types (no multiple support)
    describe.each(SINGLE_FIELD_TYPES)("$name field", ({ cslp, icon }) => {
        let fieldElement: HTMLElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            fieldElement = document.createElement("p");
            fieldElement.setAttribute("data-cslp", cslp);
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

            // Wait for cursor icon to be set (not "loading") - reduced timeout and faster polling
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    expect(customCursor).toHaveAttribute("data-icon", icon);
                },
                { timeout: 5000, interval: 10 }
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", icon);
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    // Parameterized tests for field types with multiple support
    describe.each(MULTIPLE_FIELD_TYPES)("$name field", ({ cslp, icon }) => {
        let fieldElement: HTMLElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            // Use div for reference, p for others
            fieldElement =
                icon === "reference"
                    ? document.createElement("div")
                    : document.createElement("p");

            fieldElement.setAttribute("data-cslp", cslp);
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

            // Wait for cursor icon to be set (not "loading") - reduced timeout and faster polling
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    expect(customCursor).toHaveAttribute("data-icon", icon);
                },
                { timeout: 5000, interval: 10 }
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", icon);
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    // Parameterized tests for multiple field containers (only for types that support multiple)
    describe.each(MULTIPLE_FIELD_TYPES)(
        "$name field (multiple)",
        ({ multipleCslp, icon }) => {
            let container: HTMLDivElement;
            let firstField: HTMLElement;
            let secondField: HTMLElement;
            let visualBuilder: VisualBuilder;

            beforeEach(() => {
                container = document.createElement("div");
                container.setAttribute("data-cslp", multipleCslp);
                container.getBoundingClientRect = vi
                    .fn()
                    .mockReturnValue(mockDomRect.singleHorizontal());

                // Use div for reference, p for others
                const elementType = icon === "reference" ? "div" : "p";
                firstField = document.createElement(elementType);
                firstField.setAttribute("data-cslp", `${multipleCslp}.0`);
                firstField.getBoundingClientRect = vi
                    .fn()
                    .mockReturnValue(mockDomRect.singleLeft());

                secondField = document.createElement(elementType);
                secondField.setAttribute("data-cslp", `${multipleCslp}.1`);
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
                        expect(customCursor).toHaveAttribute("data-icon", icon);
                    },
                    { timeout: 5000, interval: 50 }
                );

                const customCursor = document.querySelector(
                    `[data-testid="visual-builder__cursor"]`
                );
                expect(customCursor).toHaveAttribute("data-icon", icon);
                expect(
                    customCursor?.classList.contains("visible")
                ).toBeTruthy();
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
                        expect(customCursor).toHaveAttribute("data-icon", icon);
                    },
                    { timeout: 5000, interval: 50 }
                );

                const customCursor = document.querySelector(
                    `[data-testid="visual-builder__cursor"]`
                );
                expect(customCursor).toHaveAttribute("data-icon", icon);
                expect(
                    customCursor?.classList.contains("visible")
                ).toBeTruthy();
            });
        }
    );
});
