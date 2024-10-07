import { screen } from "@testing-library/preact";
import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { sleep } from "../../../../__test__/utils";
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
        },
    };
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
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

        test("should have outline", async () => {
            fileField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(fileField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor", async () => {
            fileField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have a outline on the url as well", async () => {
            imageField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(imageField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor on the url as well", async () => {
            imageField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
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

        test("should have outline", async () => {
            container.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(container).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor", async () => {
            container.dispatchEvent(mousemoveEvent);

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            await sleep(0);
            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", async () => {
            firstFileField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(firstFileField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor on individual instances", async () => {
            firstFileField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on the url", async () => {
            firstImageField.dispatchEvent(mousemoveEvent);
            expect(firstImageField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor on the url", async () => {
            firstImageField.dispatchEvent(mousemoveEvent);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
