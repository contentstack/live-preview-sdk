import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { sleep } from "../../../../__test__/utils";
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

    describe("select field", () => {
        let selectField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            selectField = document.createElement("p");
            selectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select"
            );

            selectField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(selectField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", async () => {
            selectField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(selectField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor", async () => {
            selectField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("select field (multiple)", () => {
        let container: HTMLDivElement;
        let firstSelectField: HTMLParagraphElement;
        let secondSelectField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select_multiple_"
            );
            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstSelectField = document.createElement("p");
            firstSelectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select_multiple_.0"
            );

            firstSelectField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondSelectField = document.createElement("p");
            secondSelectField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.select_multiple_.1"
            );

            secondSelectField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            container.appendChild(firstSelectField);
            container.appendChild(secondSelectField);
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
            firstSelectField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(firstSelectField).toMatchSnapshot();

            expect(firstSelectField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor on individual instances", async () => {
            firstSelectField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
