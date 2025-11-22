import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { waitForHoverOutline } from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { VisualBuilder } from "../../../index";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { mockDomRect } from "./mockDomRect";
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
                { timeout: 5000, interval: 50 } // Faster polling, shorter timeout for tests
            );
        }),
    };
});

// Vitest 4: Use class-based mocks for constructors
global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(_callback: ResizeObserverCallback) {}
} as any;

vi.mock("../../../../utils/index.ts", async () => {
    const actual = await vi.importActual("../../../../utils");
    return {
        __esModule: true,
        ...actual,
        isOpenInBuilder: vi.fn().mockReturnValue(true),
    };
});

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

describe("When an element is hovered in visual builder mode", () => {
    let mousemoveEvent: Event;

    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
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
        // Don't clear mocks here - it causes unhandled rejections in async code
        // vi.clearAllMocks();
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
    });

    describe("title field", () => {
        let titleField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            titleField = document.createElement("p");
            titleField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.title"
            );
            titleField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());
            document.body.appendChild(titleField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            titleField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            expect(titleField).not.toHaveAttribute("style");
            const hoverOutline = screen.getByTestId(
                "visual-builder__hover-outline"
            );
            expect(hoverOutline).toHaveStyle(
                "top: 51px; left: 51px; width: 27.7734375px; height: 20.3984375px;"
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "singleline");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    // NOTE: Standard single-line field tests (single and multiple) are now in consolidated-hover.test.ts
    // This file only contains the unique "title field" test which checks specific style values
});
