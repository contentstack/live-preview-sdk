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

const convertToPx = (value: number) => {
    return `${value}px`
}
const matchDimensions = (element: HTMLElement, hoverOutline: HTMLElement) => {
    const elementDimensions = element.getBoundingClientRect()
    // @ts-expect-error - TS doesn't know that style is a CSSStyleDeclaration
    const hoverOutlineDimensions = hoverOutline?.style?._values as CSSStyleDeclaration;
    expect(convertToPx(elementDimensions.x)).toBe(hoverOutlineDimensions.left);
    expect(convertToPx(elementDimensions.y)).toBe(hoverOutlineDimensions.top);
    expect(convertToPx(elementDimensions.width)).toBe(hoverOutlineDimensions.width);
    expect(convertToPx(elementDimensions.height)).toBe(hoverOutlineDimensions.height);
}
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

    afterEach(() => {
        vi.clearAllMocks();
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
            expect(hoverOutline).toHaveAttribute('style');

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute('data-icon', 'file');
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have a outline and custom cursor on the url as well", async () => {
            imageField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute('style');

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toHaveAttribute('data-icon', 'file');
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
            expect(hoverOutline).toHaveAttribute('style');

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor?.getAttribute('data-icon')).toBe('file');
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline and custom cursor on individual instances", async () => {
            firstFileField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            ) as HTMLElement;
            expect(hoverOutline).toHaveAttribute('style');

            matchDimensions(firstFileField, hoverOutline);

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor?.getAttribute('data-icon')).toBe('file');
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
            
        });

        test("should have outline and custom cursor on the url", async () => {
            firstImageField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            ) as HTMLElement;
            expect(hoverOutline).toHaveAttribute('style');
            matchDimensions(firstImageField, hoverOutline);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
