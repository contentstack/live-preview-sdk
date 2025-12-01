import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import {
    waitForHoverOutline,
    waitForCursorIcon,
} from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { mockDomRect } from "./mockDomRect";
import { VisualBuilder } from "../../../index";
import { screen } from "@testing-library/preact";

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

// Mock fetchEntryPermissionsAndStageDetails to resolve immediately - speeds up hover tests
vi.mock("../../../utils/fetchEntryPermissionsAndStageDetails", () => {
    return {
        fetchEntryPermissionsAndStageDetails: vi.fn(() =>
            Promise.resolve({
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
            })
        ),
    };
});

describe("When an element is hovered in visual builder mode", () => {
    let mousemoveEvent: Event;

    beforeAll(() => {
        const startTime = performance.now();
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
        const endTime = performance.now();
        console.log(
            `[TIMING] beforeAll - setFieldSchema: ${(endTime - startTime).toFixed(2)}ms`
        );
    });

    beforeEach(() => {
        const startTime = performance.now();
        Config.reset();
        Config.set("mode", 2);
        mousemoveEvent = new Event("mousemove", {
            bubbles: true,
            cancelable: true,
        });
        const endTime = performance.now();
        console.log(
            `[TIMING] beforeEach (outer) - Config setup: ${(endTime - startTime).toFixed(2)}ms`
        );
    });

    afterEach(() => {
        const startTime = performance.now();
        vi.clearAllMocks();
        document.getElementsByTagName("html")[0].innerHTML = "";
        const endTime = performance.now();
        console.log(
            `[TIMING] afterEach (outer) - cleanup: ${(endTime - startTime).toFixed(2)}ms`
        );
    });

    afterAll(() => {
        const startTime = performance.now();
        Config.reset();
        const endTime = performance.now();
        console.log(
            `[TIMING] afterAll - Config reset: ${(endTime - startTime).toFixed(2)}ms`
        );
    });

    describe("group field", () => {
        let groupField: HTMLDivElement;
        let nestedSingleLine: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            const startTime = performance.now();
            groupField = document.createElement("div");
            groupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group"
            );

            groupField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            nestedSingleLine = document.createElement("p");
            nestedSingleLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group.single_line"
            );

            nestedSingleLine.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            groupField.appendChild(nestedSingleLine);
            document.body.appendChild(groupField);
            const domSetupTime = performance.now();
            console.log(
                `[TIMING] beforeEach (group field) - DOM setup: ${(domSetupTime - startTime).toFixed(2)}ms`
            );

            const vbStartTime = performance.now();
            visualBuilder = new VisualBuilder();
            const vbEndTime = performance.now();
            console.log(
                `[TIMING] beforeEach (group field) - VisualBuilder init: ${(vbEndTime - vbStartTime).toFixed(2)}ms`
            );
            console.log(
                `[TIMING] beforeEach (group field) - TOTAL: ${(vbEndTime - startTime).toFixed(2)}ms`
            );
        });

        afterEach(() => {
            const startTime = performance.now();
            visualBuilder.destroy();
            const endTime = performance.now();
            console.log(
                `[TIMING] afterEach (group field) - VisualBuilder.destroy: ${(endTime - startTime).toFixed(2)}ms`
            );
        });

        test("should have outline and custom cursor", async () => {
            groupField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            await waitForCursorIcon("group");

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "group");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have a outline and custom cursor on the nested single line", async () => {
            const testStartTime = performance.now();
            const singleLine = document.createElement("p");
            singleLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group.single_line"
            );

            singleLine.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            groupField.appendChild(singleLine);

            const dispatchStartTime = performance.now();
            singleLine.dispatchEvent(mousemoveEvent);
            const dispatchEndTime = performance.now();
            console.log(
                `[TIMING] test - dispatchEvent: ${(dispatchEndTime - dispatchStartTime).toFixed(2)}ms`
            );

            const hoverOutlineStartTime = performance.now();
            await waitForHoverOutline();
            const hoverOutlineEndTime = performance.now();
            console.log(
                `[TIMING] test - waitForHoverOutline: ${(hoverOutlineEndTime - hoverOutlineStartTime).toFixed(2)}ms`
            );

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            const cursorIconStartTime = performance.now();
            await waitForCursorIcon("singleline");
            const cursorIconEndTime = performance.now();
            console.log(
                `[TIMING] test - waitForCursorIcon: ${(cursorIconEndTime - cursorIconStartTime).toFixed(2)}ms`
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "singleline");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();

            const testEndTime = performance.now();
            console.log(
                `[TIMING] test - TOTAL: ${(testEndTime - testStartTime).toFixed(2)}ms`
            );
        });
    });

    describe("group field (multiple)", () => {
        let container: HTMLDivElement;
        let firstGroupField: HTMLDivElement;
        let firstNestedMultiLine: HTMLParagraphElement;
        let secondGroupField: HTMLDivElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            const startTime = performance.now();
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_"
            );

            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstGroupField = document.createElement("div");
            firstGroupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.0"
            );

            firstGroupField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            firstNestedMultiLine = document.createElement("p");
            firstNestedMultiLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.0.multi_line"
            );

            firstNestedMultiLine.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondGroupField = document.createElement("div");
            secondGroupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.1"
            );

            secondGroupField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstGroupField);
            container.appendChild(secondGroupField);

            firstGroupField.appendChild(firstNestedMultiLine);

            document.body.appendChild(container);
            const domSetupTime = performance.now();
            console.log(
                `[TIMING] beforeEach (group field multiple) - DOM setup: ${(domSetupTime - startTime).toFixed(2)}ms`
            );

            const vbStartTime = performance.now();
            visualBuilder = new VisualBuilder();
            const vbEndTime = performance.now();
            console.log(
                `[TIMING] beforeEach (group field multiple) - VisualBuilder init: ${(vbEndTime - vbStartTime).toFixed(2)}ms`
            );
            console.log(
                `[TIMING] beforeEach (group field multiple) - TOTAL: ${(vbEndTime - startTime).toFixed(2)}ms`
            );
        });

        afterEach(() => {
            const startTime = performance.now();
            visualBuilder.destroy();
            const endTime = performance.now();
            console.log(
                `[TIMING] afterEach (group field multiple) - VisualBuilder.destroy: ${(endTime - startTime).toFixed(2)}ms`
            );
        });

        test("should have outline and custom cursor on container", async () => {
            container.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            await waitForCursorIcon("group");

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "group");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline and custom cursor on nested multi line", async () => {
            const testStartTime = performance.now();
            const dispatchStartTime = performance.now();
            firstNestedMultiLine.dispatchEvent(mousemoveEvent);
            const dispatchEndTime = performance.now();
            console.log(
                `[TIMING] test - dispatchEvent: ${(dispatchEndTime - dispatchStartTime).toFixed(2)}ms`
            );

            const hoverOutlineStartTime = performance.now();
            await waitForHoverOutline();
            const hoverOutlineEndTime = performance.now();
            console.log(
                `[TIMING] test - waitForHoverOutline: ${(hoverOutlineEndTime - hoverOutlineStartTime).toFixed(2)}ms`
            );

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            const cursorIconStartTime = performance.now();
            await waitForCursorIcon("multiline");
            const cursorIconEndTime = performance.now();
            console.log(
                `[TIMING] test - waitForCursorIcon: ${(cursorIconEndTime - cursorIconStartTime).toFixed(2)}ms`
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "multiline");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();

            const testEndTime = performance.now();
            console.log(
                `[TIMING] test - TOTAL: ${(testEndTime - testStartTime).toFixed(2)}ms`
            );
        });
    });
});
