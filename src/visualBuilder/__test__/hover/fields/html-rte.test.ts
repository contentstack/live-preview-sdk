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

    describe("HTML RTE field", () => {
        let htmlRteField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            htmlRteField = document.createElement("p");
            htmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor"
            );

            htmlRteField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(htmlRteField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", async () => {
            htmlRteField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(htmlRteField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });
        test("should have custom cursor", async () => {
            htmlRteField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("HTML RTE field (multiple)", () => {
        let container: HTMLDivElement;
        let firstHtmlRteField: HTMLParagraphElement;
        let secondHtmlRteField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor_multiple_"
            );
            container.getBoundingClientRect = vi

                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstHtmlRteField = document.createElement("p");
            firstHtmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor_multiple_.0"
            );

            firstHtmlRteField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondHtmlRteField = document.createElement("p");
            secondHtmlRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.rich_text_editor_multiple_.1"
            );

            secondHtmlRteField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstHtmlRteField);
            container.appendChild(secondHtmlRteField);
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
            firstHtmlRteField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(firstHtmlRteField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor on individual instances", async () => {
            firstHtmlRteField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
