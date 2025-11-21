import { screen, waitFor } from "@testing-library/preact";
import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { waitForHoverOutline } from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { VisualBuilder } from "../../../index";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { mockDomRect } from "./mockDomRect";

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
                { timeout: 2000, interval: 10 } // Optimized: reduced from 5s/50ms to 2s/10ms
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
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        }));

        global.MutationObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            disconnect: vi.fn(),
        }));
    });

    beforeEach(() => {
        Config.reset();
        Config.set("mode", 2);
        mousemoveEvent = new Event("mousemove", {
            bubbles: true,
            cancelable: true,
        });
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterEach(async () => {
        // Wait longer for any pending async operations (like fetchEntryPermissionsAndStageDetails) to complete
        await new Promise((resolve) => setTimeout(resolve, 500));
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
    });

    describe("file field", () => {
        let fileField: HTMLParagraphElement;
        let imageField: HTMLImageElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
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
            imageField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            // Wait for cursor icon to be set (not "loading") - optimized timeout
            const { waitFor } = await import("@testing-library/preact");
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    expect(customCursor).toHaveAttribute("data-icon", "file");
                },
                { timeout: 2000, interval: 10 } // Optimized: reduced timeout and faster polling
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "file");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
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

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
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
                    if (!customCursor) throw new Error("Cursor not found");
                    expect(customCursor.getAttribute("data-icon")).toBe("file");
                },
                { timeout: 2000, interval: 10 } // Optimized timeout
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor?.getAttribute("data-icon")).toBe("file");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline and custom cursor on individual instances", async () => {
            firstFileField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
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
            await waitFor(
                () => {
                    const customCursor = document.querySelector(
                        `[data-testid="visual-builder__cursor"]`
                    );
                    if (!customCursor) throw new Error("Cursor not found");
                    expect(customCursor.classList.contains("visible")).toBeTruthy();
                },
                { timeout: 2000, interval: 10 } // Optimized timeout
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
