import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { sleep } from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { mockDomRect } from "./mockDomRect";
import { VisualBuilder } from "../../../index";
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

    describe("group field", () => {
        let groupField: HTMLDivElement;
        let nestedSingleLine: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            groupField = document.createElement("div");
            groupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group"
            );

            groupField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            nestedSingleLine = document.createElement("p");
            nestedSingleLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group.single_line"
            );

            nestedSingleLine.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            groupField.appendChild(nestedSingleLine);
            document.body.appendChild(groupField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline", async () => {
            groupField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(groupField).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });
        test("should have custom cursor", async () => {
            groupField.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have a outline on the nested single line", async () => {
            const singleLine = document.createElement("p");
            singleLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group.single_line"
            );

            singleLine.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            groupField.appendChild(singleLine);

            singleLine.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(singleLine).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });

        test("should have custom cursor on the nested single line", async () => {
            const singleLine = document.createElement("p");
            singleLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group.single_line"
            );

            singleLine.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            groupField.appendChild(singleLine);

            singleLine.dispatchEvent(mousemoveEvent);
            await sleep(0);
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("group field (multiple)", () => {
        let container: HTMLDivElement;
        let firstGroupField: HTMLDivElement;
        let firstNestedMultiLine: HTMLParagraphElement;
        let secondGroupField: HTMLDivElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_"
            );

            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstGroupField = document.createElement("div");
            firstGroupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.0"
            );

            firstGroupField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            firstNestedMultiLine = document.createElement("p");
            firstNestedMultiLine.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.0.multi_line"
            );

            firstNestedMultiLine.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondGroupField = document.createElement("div");
            secondGroupField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group_multiple_.1"
            );

            secondGroupField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstGroupField);
            container.appendChild(secondGroupField);

            firstGroupField.appendChild(firstNestedMultiLine);

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

            expect(customCursor).toMatchSnapshot();
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline on the nested field", async () => {
            firstNestedMultiLine.dispatchEvent(mousemoveEvent);
            await sleep(0);
            expect(firstNestedMultiLine).toMatchSnapshot();
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toMatchSnapshot();
        });
    });
});
