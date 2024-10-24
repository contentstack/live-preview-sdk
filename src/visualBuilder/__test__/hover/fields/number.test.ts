import { screen } from "@testing-library/preact";
import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { sleep, waitForHoverOutline } from "../../../../__test__/utils";
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

    describe("number field", () => {
        let numberField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            numberField = document.createElement("p");
            numberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number"
            );

            numberField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(numberField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            numberField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            expect(numberField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("number field (multiple)", () => {
        let container: HTMLDivElement;
        let firstNumberField: HTMLParagraphElement;
        let secondNumberField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_"
            );
            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstNumberField = document.createElement("p");
            firstNumberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_.0"
            );
            firstNumberField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondNumberField = document.createElement("p");
            secondNumberField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.number_multiple_.1"
            );
            secondNumberField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstNumberField);
            container.appendChild(secondNumberField);
            document.body.appendChild(container);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            container.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            expect(container).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline and custom cursor on individual instances", async () => {
            firstNumberField.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            expect(firstNumberField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
