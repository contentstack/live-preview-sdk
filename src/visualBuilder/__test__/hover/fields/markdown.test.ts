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

    describe("markdown field", () => {
        let markdownField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            markdownField = document.createElement("p");
            markdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown"
            );

            markdownField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(markdownField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", async () => {
            markdownField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(markdownField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });
        test("should have custom cursor", async () => {
            markdownField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("markdown field (multiple)", () => {
        let container: HTMLDivElement;
        let firstMarkdownField: HTMLParagraphElement;
        let secondMarkdownField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown_multiple_"
            );

            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstMarkdownField = document.createElement("p");
            firstMarkdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown_multiple_.0"
            );

            firstMarkdownField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondMarkdownField = document.createElement("p");
            secondMarkdownField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.markdown_multiple_.1"
            );

            secondMarkdownField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstMarkdownField);
            container.appendChild(secondMarkdownField);
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
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on individual instances", async () => {
            firstMarkdownField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(firstMarkdownField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor on individual instances", async () => {
            firstMarkdownField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
