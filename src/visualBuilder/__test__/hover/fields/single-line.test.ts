import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { waitForHoverOutline } from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { VisualBuilder } from "../../../index";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { mockDomRect } from "./mockDomRect";
import { act, screen } from "@testing-library/preact";

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

vi.mock("../../../../utils/index.ts", async () => {
    const actual = await vi.importActual("../../../../utils");
    return {
        __esModule: true,
        ...actual,
        isOpenInBuilder: vi.fn().mockReturnValue(true),
    };
});

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
            await act(() => {
                titleField.dispatchEvent(mousemoveEvent);
            });
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

    describe("single line field", () => {
        let singleLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            singleLineField = document.createElement("p");
            singleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line"
            );
            singleLineField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());
            document.body.appendChild(singleLineField);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            await act(() => {
                singleLineField.dispatchEvent(mousemoveEvent);
            });
            await waitForHoverOutline();
            expect(singleLineField).not.toHaveAttribute("style");

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toHaveAttribute("data-icon", "singleline");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });

    describe("single line field (multiple)", () => {
        let container: HTMLDivElement;
        let firstSingleLineField: HTMLParagraphElement;
        let secondSingleLineField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(() => {
            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_"
            );
            container.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleHorizontal());

            firstSingleLineField = document.createElement("p");
            firstSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.0"
            );
            firstSingleLineField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            secondSingleLineField = document.createElement("p");
            secondSingleLineField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.single_line_textbox_multiple_.1"
            );
            secondSingleLineField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleRight());

            container.appendChild(firstSingleLineField);
            container.appendChild(secondSingleLineField);
            document.body.appendChild(container);

            visualBuilder = new VisualBuilder();
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            await act(() => {
                container.dispatchEvent(mousemoveEvent);
            });
            container.dispatchEvent(mousemoveEvent);
            await waitForHoverOutline();
            expect(container).not.toHaveAttribute("style");

            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveStyle(
                "top: 34px; left: 34px; width: 828px; height: 54.3984375px;"
            );

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );

            expect(customCursor).toHaveAttribute("data-icon", "singleline");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });

        test("should have outline and custom cursor on individual instances", async () => {
            await act(() => {
                firstSingleLineField.dispatchEvent(mousemoveEvent);
            });
            await waitForHoverOutline();
            expect(firstSingleLineField).not.toHaveAttribute("style");
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
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
});
