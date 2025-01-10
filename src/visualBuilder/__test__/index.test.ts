import crypto from "crypto";
import { getFieldSchemaMap } from "../../__test__/data/fieldSchemaMap";
import { getElementBytestId, mockGetBoundingClientRect, sleep, triggerAndWaitForClickAction, waitForBuilderSDKToBeInitialized, waitForToolbaxToBeVisible } from "../../__test__/utils";
import Config from "../../configManager/configManager";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { waitFor, screen, cleanup } from "@testing-library/preact";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { VisualBuilder } from "../index";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { Mock } from "vitest";

const INLINE_EDITABLE_FIELD_VALUE = "Hello World";

vi.mock("../utils/visualBuilderPostMessage", async () => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("../../__test__/data/contentType")
    >("../../__test__/data/contentType");
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

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});
// Increase the timeout for the test
describe("Visual builder", () => {
    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
        Config.set("mode", 2);
        vi.spyOn(
            document.documentElement,
            "clientWidth",
            "get"
        ).mockReturnValue(100);
        vi.spyOn(
            document.documentElement,
            "clientHeight",
            "get"
        ).mockReturnValue(100);
        vi.spyOn(document.body, "scrollHeight", "get").mockReturnValue(100);
    });

    beforeEach(() => {
        (visualBuilderPostMessage?.send as Mock).mockClear();
        document.getElementsByTagName("html")[0].innerHTML = "";
        cleanup();
    });

    afterAll(() => {
        FieldSchemaMap.clear();
    });

    test("should append a visual builder container to the DOM", async () => {
        let visualBuilderDOM = document.querySelector(
            ".visual-builder__container"
        );

        expect(visualBuilderDOM).toBeNull();

        const x = new VisualBuilder();
        await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);

        visualBuilderDOM = document.querySelector(
            `[data-testid="visual-builder__container"]`
        );

        expect(document.querySelector('[data-testid="visual-builder__cursor"]')).toBeInTheDocument();
        expect(document.querySelector('[data-testid="visual-builder__focused-toolbar"]')).toBeInTheDocument();
        expect(document.querySelector('[data-testid="visual-builder__hover-outline"]')).toBeInTheDocument();
        expect(document.querySelector('[data-testid="visual-builder__overlay__wrapper"]')).toBeInTheDocument();
        x.destroy();
    }, { timeout: 20 * 1000 });

    test("should add overlay to DOM when clicked", async () => {
        const h1Tag = document.createElement("h1");
        h1Tag.textContent = INLINE_EDITABLE_FIELD_VALUE;
        h1Tag.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.modular_blocks.0.block.single_line"
        );
        document.body.appendChild(h1Tag);
        mockGetBoundingClientRect(h1Tag);
        const x = new VisualBuilder();
        await triggerAndWaitForClickAction(visualBuilderPostMessage, h1Tag);
        await waitFor(() => {
            const overlayOutline = document.querySelector('[data-testid="visual-builder__overlay--outline"]');
            expect(overlayOutline).toHaveStyle({
                top: "10px",
                left: "10px",
                width: "10px",
                height: "5px",
                "outline-color": "rgb(113, 92, 221)"
            });
        })
        x.destroy();
    }, { timeout: 20 * 1000 });

    describe("on click, the sdk", () => {
        afterEach(() => {
            document.getElementsByTagName("html")[0].innerHTML = "";
        });

        test("should do nothing if data-cslp not available", async () => {
            const h1 = document.createElement("h1");

            document.body.appendChild(h1);
            const x = new VisualBuilder();
            await triggerAndWaitForClickAction(visualBuilderPostMessage, h1, {skipWaitForFieldType: true});

            expect(h1).not.toHaveAttribute("contenteditable");
            expect(h1).not.toHaveAttribute("data-cslp-field-type");
            x.destroy();
        });

        describe("inline elements must be contenteditable", () => {
            let visualBuilder: VisualBuilder;
            let h1: HTMLHeadingElement
            beforeAll(() => {
                (visualBuilderPostMessage?.send as Mock).mockImplementation(
                    (eventName: string, args) => {
                        if (
                            eventName ===
                            VisualBuilderPostMessageEvents.GET_FIELD_DATA
                        ) {
                            const values: Record<string, any> = {
                                single_line: INLINE_EDITABLE_FIELD_VALUE,
                                multi_line: INLINE_EDITABLE_FIELD_VALUE,
                                file: {
                                    uid: "fileUid",
                                },
                            };
                            return Promise.resolve({
                                fieldData: values[args.entryPath],
                            });
                        } else if (
                            eventName ===
                            VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                        ) {
                            const names: Record<string, string> = {
                                "all_fields.blt58a50b4cebae75c5.en-us.single_line":
                                    "Single Line",
                                "all_fields.blt58a50b4cebae75c5.en-us.multi_line":
                                    "Multi Line",
                                "all_fields.blt58a50b4cebae75c5.en-us.file":
                                    "File",
                            };
                            return Promise.resolve({
                                [args.cslp]: names[args.cslp],
                            });
                        }
                        return Promise.resolve({});
                    }
                );
            });

            beforeEach(async () => {
                document.getElementsByTagName("html")[0].innerHTML = "";
                h1 = document.createElement("h1");
                h1.textContent = INLINE_EDITABLE_FIELD_VALUE;
                mockGetBoundingClientRect(h1);
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.single_line"
                );

                document.body.appendChild(h1);
                visualBuilder = new VisualBuilder();
            })
            afterEach(() => {
                visualBuilder.destroy();
            })
            test("single line should be contenteditable", async () => {
                await triggerAndWaitForClickAction(visualBuilderPostMessage, h1);

                await waitFor(() => {
                    expect(h1).toHaveAttribute("contenteditable");
                    expect(h1).toHaveAttribute("data-cslp-field-type", "singleline");
                })
            }, { timeout: 20 * 1000 });

            test("multi line should be contenteditable", async () => {
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.multi_line"
                );
                await triggerAndWaitForClickAction(visualBuilderPostMessage, h1);

                await waitFor(() => {
                    expect(h1).toHaveAttribute("contenteditable");
                    expect(h1).toHaveAttribute("data-cslp-field-type", "multiline");
                })
            }, { timeout: 20 * 1000 });

        });
    });
}, { timeout: 20 * 1000 });
