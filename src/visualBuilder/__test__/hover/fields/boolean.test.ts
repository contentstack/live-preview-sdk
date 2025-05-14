import { screen } from "@testing-library/preact";
import { getFieldSchemaMap } from "../../../../__test__/data/fieldSchemaMap";
import { waitForBuilderSDKToBeInitialized, waitForHoverOutline } from "../../../../__test__/utils";
import Config from "../../../../configManager/configManager";
import { VisualBuilder } from "../../../index";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { mockDomRect } from "./mockDomRect";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";
import { act } from "@testing-library/preact";

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
    describe("boolean field", () => {
        let booleanField: HTMLParagraphElement;
        let visualBuilder: VisualBuilder;

        beforeEach(async () => {
            booleanField = document.createElement("p");
            booleanField.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.boolean"
            );

            booleanField.getBoundingClientRect = vi
                .fn()
                .mockReturnValue(mockDomRect.singleLeft());

            document.body.appendChild(booleanField);

            visualBuilder = new VisualBuilder();
            await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);
        });

        afterEach(() => {
            visualBuilder.destroy();
        });

        test("should have outline and custom cursor", async () => {
            await act(async () => {
                booleanField.dispatchEvent(mousemoveEvent);
            });
            await waitForHoverOutline();
            expect(booleanField).toHaveAttribute("data-cslp", "all_fields.bltapikey.en-us.boolean");
            expect(booleanField).not.toHaveAttribute("contenteditable");
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).toHaveAttribute("style");

            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            expect(customCursor).toHaveAttribute("data-icon", "boolean");
            expect(customCursor?.classList.contains("visible")).toBeTruthy();
        });
    });
});
