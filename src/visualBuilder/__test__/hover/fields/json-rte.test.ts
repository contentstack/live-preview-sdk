import { screen } from "@testing-library/preact";
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

    describe("JSON RTE field", () => {
        let jsonRteField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            jsonRteField = document.createElement("p");
            jsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rte"
            );

            jsonRteField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(jsonRteField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            jsonRteField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute('style');

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toHaveAttribute('data-icon', 'json_rte');
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("JSON RTE field (multiple)", () => {
        let container: HTMLDivElement;
        let firstJsonRteField: HTMLParagraphElement;
        let secondJsonRteField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_"
            );

            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstJsonRteField = document.createElement("p");
            firstJsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_.0"
            );

            firstJsonRteField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondJsonRteField = document.createElement("p");
            secondJsonRteField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.json_rich_text_editor_multiple_.1"
            );

            secondJsonRteField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstJsonRteField);
            container.appendChild(secondJsonRteField);
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

            expect(customCursor).toHaveAttribute('data-icon', 'json_rte');
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline and custom cursor on individual instances", async () => {
            firstJsonRteField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute('style');

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toHaveAttribute('data-icon', 'json_rte');
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
