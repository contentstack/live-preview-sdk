import { screen, waitFor } from "@testing-library/preact";
import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import {
    waitForHoverOutline,
    waitForCursorToBeVisible,
    waitForCursorIcon,
} from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { VisualBuilder } from "../../../index";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { mockDomRect } from "./mockDomRect";
import("@testing-library/preact");

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
const convertToPx = (value: number) => {
    return `${value}px`;
};
const matchDimensions = (element: HTMLElement, hoverOutline: HTMLElement) => {
    const elementDimensions = element.getBoundingClientRect();
    const hoverOutlineStyle = hoverOutline?.style as CSSStyleDeclaration;
    expect(convertToPx(elementDimensions.x)).toBe(hoverOutlineStyle.left);
    expect(convertToPx(elementDimensions.y)).toBe(hoverOutlineStyle.top);
    expect(convertToPx(elementDimensions.width)).toBe(hoverOutlineStyle.width);
    expect(convertToPx(elementDimensions.height)).toBe(
        hoverOutlineStyle.height
    );
};
describe("When an element is hovered in visual builder mode", () => {
    let mousemoveEvent: Event;

    beforeAll(() => {
        const startTime = performance.now();
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );

        global.MutationObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            disconnect: vi.fn(),
        }));
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
        document.getElementsByTagName("html")[0].innerHTML = "";
        const endTime = performance.now();
        console.log(
            `[TIMING] beforeEach (outer) - Config setup: ${(endTime - startTime).toFixed(2)}ms`
        );
    });

    afterEach(async () => {
        const startTime = performance.now();
        // Wait longer for any pending async operations (like fetchEntryPermissionsAndStageDetails) to complete
        // await new Promise((resolve) => setTimeout(resolve, 500));
        document.getElementsByTagName("html")[0].innerHTML = "";
        const endTime = performance.now();
        console.log(
            `[TIMING] afterEach (outer) - cleanup: ${(endTime - startTime).toFixed(2)}ms`
        );
    });

    afterAll(() => {
        Config.reset();
    });

    describe("file field", () => {
        let fileField: HTMLParagraphElement;
        let imageField: HTMLImageElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            const startTime = performance.now();
            fileField = document.createElement("p");
            fileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file"
            );

            fileField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            imageField = document.createElement("img");
            imageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file.url"
            );

            document.body.appendChild(fileField);
            document.body.appendChild(imageField);
            const domSetupTime = performance.now();
            console.log(
                `[TIMING] beforeEach (file field) - DOM setup: ${(domSetupTime - startTime).toFixed(2)}ms`
            );

            const vbStartTime = performance.now();
            visualBuilder = new VisualBuilder();
            const vbEndTime = performance.now();
            console.log(
                `[TIMING] beforeEach (file field) - VisualBuilder init: ${(vbEndTime - vbStartTime).toFixed(2)}ms`
            );
            console.log(
                `[TIMING] beforeEach (file field) - TOTAL: ${(vbEndTime - startTime).toFixed(2)}ms`
            );
        });

        afterEach(() => {
            const startTime = performance.now();
            visualBuilder.destroy();
            const endTime = performance.now();
            console.log(
                `[TIMING] afterEach (file field) - VisualBuilder.destroy: ${(endTime - startTime).toFixed(2)}ms`
            );
        });

        test("should have outline and custom cursor", async () => {
            fileField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "file");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have a outline and custom cursor on the url as well", async () => {
            const testStartTime = performance.now();
            const dispatchStartTime = performance.now();
            imageField.dispatchEvent(mousemoveEvent);
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

            // Wait for cursor icon to be set (not "loading") - optimized timeout
            const waitForStartTime = performance.now();
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    expect(customCursor).toHaveAttribute("data-icon", "file");
                },
                { timeout: 2000, interval: 10 } // Optimized: reduced timeout and faster polling
            );
            const waitForEndTime = performance.now();
            console.log(
                `[TIMING] test - waitFor cursor: ${(waitForEndTime - waitForStartTime).toFixed(2)}ms`
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "file");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
            const testEndTime = performance.now();
            console.log(
                `[TIMING] test - TOTAL: ${(testEndTime - testStartTime).toFixed(2)}ms`
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

        beforeEach(() => {
            const startTime = performance.now();
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_"
            );

            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstFileField = document.createElement("p");
            firstFileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.0"
            );

            firstFileField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondFileField = document.createElement("p");
            secondFileField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.1"
            );

            secondFileField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            firstImageField = document.createElement("img");
            firstImageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.0.url"
            );
            firstImageField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondImageField = document.createElement("img");
            secondImageField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.file_multiple_.1.url"
            );
            secondFileField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstFileField);
            container.appendChild(secondFileField);
            container.appendChild(firstImageField);
            container.appendChild(secondImageField);
            document.body.appendChild(container);
            const domSetupTime = performance.now();
            console.log(
                `[TIMING] beforeEach (file field multiple) - DOM setup: ${(domSetupTime - startTime).toFixed(2)}ms`
            );

            const vbStartTime = performance.now();
            visualBuilder = new VisualBuilder();
            const vbEndTime = performance.now();
            console.log(
                `[TIMING] beforeEach (file field multiple) - VisualBuilder init: ${(vbEndTime - vbStartTime).toFixed(2)}ms`
            );
            console.log(
                `[TIMING] beforeEach (file field multiple) - TOTAL: ${(vbEndTime - startTime).toFixed(2)}ms`
            );
        });

        afterEach(() => {
            const startTime = performance.now();
            visualBuilder.destroy();
            const endTime = performance.now();
            console.log(
                `[TIMING] afterEach (file field multiple) - VisualBuilder.destroy: ${(endTime - startTime).toFixed(2)}ms`
            );
        });

        test("should have outline and custom cursor", async () => {
            container.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading")
            await waitForCursorIcon("file");

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor?.getAttribute("data-icon")).toBe("file");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline and custom cursor on individual instances", async () => {
            const testStartTime = performance.now();
            const dispatchStartTime = performance.now();
            firstFileField.dispatchEvent(mousemoveEvent);
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
            ) as HTMLElement;
            expect(hoverOutline).toHaveAttribute("style");

            matchDimensions(firstFileField, hoverOutline);

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor?.getAttribute("data-icon")).toBe("file");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
            const testEndTime = performance.now();
            console.log(
                `[TIMING] test - TOTAL: ${(testEndTime - testStartTime).toFixed(2)}ms`
            );
        });

        test("should have outline and custom cursor on the url", async () => {
            firstImageField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            ) as HTMLElement;
            expect(hoverOutline).toHaveAttribute("style");
            matchDimensions(firstImageField, hoverOutline);

            // Wait for cursor icon to be set (not "loading")
            await waitForCursorToBeVisible();

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
