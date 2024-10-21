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

        expect(visualBuilderDOM).toMatchSnapshot();
        x.destroy();
    });

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
    });

    describe("on click, the sdk", () => {
        afterEach(() => {
            document.getElementsByTagName("html")[0].innerHTML = "";
        });

        test("should do nothing if data-cslp not available", async () => {
            const h1 = document.createElement("h1");

            document.body.appendChild(h1);
            const x = new VisualBuilder();
            await triggerAndWaitForClickAction(visualBuilderPostMessage, h1, {skipWaitForFieldType: true});

            expect(document.body).toMatchSnapshot();
            x.destroy();
        });

        describe("inline elements must be contenteditable", () => {
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

            beforeEach(() => {
                document.getElementsByTagName("html")[0].innerHTML = "";
            })
            test("single line should be contenteditable", async () => {
                const h1 = document.createElement("h1");
                h1.textContent = INLINE_EDITABLE_FIELD_VALUE;
                h1.getBoundingClientRect = vi.fn(() => ({
                    left: 10,
                    right: 20,
                    top: 10,
                    bottom: 20,
                    width: 10,
                    height: 5,
                })) as any;
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.single_line"
                );

                document.body.appendChild(h1);
                const x = new VisualBuilder();

                await triggerAndWaitForClickAction(visualBuilderPostMessage, h1);

                await waitFor(() => {
                    expect(h1.getAttribute("contenteditable")).toBe("true");
                });
                expect(h1).toMatchSnapshot();
                x.destroy();
            });

            test("multi line should be contenteditable", async () => {
                const h1 = document.createElement("h1");
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.multi_line"
                );
                h1.getBoundingClientRect = vi.fn(() => ({
                    left: 10,
                    right: 20,
                    top: 10,
                    bottom: 20,
                    width: 10,
                    height: 5,
                })) as any;
                h1.textContent = INLINE_EDITABLE_FIELD_VALUE;
                document.body.appendChild(h1);
                const x = new VisualBuilder();
                await triggerAndWaitForClickAction(visualBuilderPostMessage, h1);

                await waitFor(() => {
                    expect(h1.getAttribute("contenteditable")).toBe("true");
                });
                expect(h1).toMatchSnapshot();
                x.destroy();
            });

            //TODO: Fix this test on CI
            test.skip("file should render a replacer and remove when it is not", async () => {
                const h1 = document.createElement("h1");
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.file"
                );
                document.body.appendChild(h1);
                const x = new VisualBuilder();
                await triggerAndWaitForClickAction(visualBuilderPostMessage, h1);

                let replaceBtn = document.getElementsByClassName(
                    "visual-builder__replace-button"
                )[0];

                expect(h1).toMatchSnapshot();
                expect(replaceBtn).toMatchSnapshot();

                const h2 = document.createElement("h2");
                h2.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.title"
                );
                document.body.appendChild(h2);

                await triggerAndWaitForClickAction(visualBuilderPostMessage, h2);
                replaceBtn = document.getElementsByClassName(
                    "visual-builder__replace-button"
                )[0];

                expect(replaceBtn).toBeUndefined();
                x.destroy();
            }, { timeout: 10 * 1000 });
        });
    });
});

describe.skip("visual builder DOM", () => {
    let h1: HTMLHeadElement;

    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
        Config.set("mode", 2);
        (visualBuilderPostMessage?.send as Mock).mockImplementation(
            (eventName: string, args) => {
                if (
                    eventName === VisualBuilderPostMessageEvents.GET_FIELD_DATA
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
                        "all_fields.blt58a50b4cebae75c5.en-us.file": "File",
                    };
                    return Promise.resolve({
                        [args.cslp]: names[args.cslp],
                    });
                }
                return Promise.resolve({});
            }
        );
    });

    beforeEach(() => {
        document.getElementsByTagName('html')[0].innerHTML = ''; 
        (visualBuilderPostMessage?.send as Mock).mockClear();
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
        h1 = document.createElement("h1");

        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.single_line"
        );

        h1.innerText = INLINE_EDITABLE_FIELD_VALUE;

        mockGetBoundingClientRect(h1);

        document.body.appendChild(h1);
    });

    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        FieldSchemaMap.clear();
    });

    test("should have an overlay over the element", async () => {
        const visualBuilder = new VisualBuilder();
        await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);

        let visualBuilderOverlayWrapper = document.querySelector(
            `[data-testid="visual-builder__overlay__wrapper"]`
        );

        expect(visualBuilderOverlayWrapper).toMatchSnapshot();

        await triggerAndWaitForClickAction(visualBuilderPostMessage, h1);

        await waitFor(() => {
            expect(h1.getAttribute("contenteditable")).toBe("true");
        });
        visualBuilderOverlayWrapper = document.querySelector(
            `[data-testid="visual-builder__overlay__wrapper"]`
        );
        await waitFor(() => {
            expect(visualBuilderOverlayWrapper?.classList.contains("visible")).toBe(
                true
            );
        });
        expect(visualBuilderOverlayWrapper).toMatchSnapshot();

        const visualBuilderWrapperTopOverlay = getElementBytestId('visual-builder__overlay--top') as HTMLDivElement;
        const visualBuilderWrapperLeftOverlay = getElementBytestId(
            "visual-builder__overlay--left"
        ) as HTMLDivElement;
        const visualBuilderWrapperRightOverlay = getElementBytestId(
            "visual-builder__overlay--right"
        ) as HTMLDivElement;
        const visualBuilderWrapperBottomOverlay = getElementBytestId(
            "visual-builder__overlay--bottom"
        ) as HTMLDivElement;

        expect(visualBuilderWrapperTopOverlay.style.top).toBe("0px");
        expect(visualBuilderWrapperTopOverlay.style.left).toBe("0px");
        expect(visualBuilderWrapperTopOverlay.style.width).toBe("100%");
        expect(visualBuilderWrapperTopOverlay.style.height).toBe("calc(10px)");

        expect(visualBuilderWrapperBottomOverlay.style.top).toBe("20px");
        expect(visualBuilderWrapperBottomOverlay.style.left).toBe("0px");
        expect(visualBuilderWrapperBottomOverlay.style.width).toBe("100%");
        expect(visualBuilderWrapperBottomOverlay.style.height).toBe("80px");

        expect(visualBuilderWrapperLeftOverlay.style.top).toBe("10px");
        expect(visualBuilderWrapperLeftOverlay.style.left).toBe("0px");
        expect(visualBuilderWrapperLeftOverlay.style.width).toBe("10px");

        expect(visualBuilderWrapperRightOverlay.style.top).toBe("10px");
        expect(visualBuilderWrapperRightOverlay.style.left).toBe("20px");
        expect(visualBuilderWrapperRightOverlay.style.width).toBe("80px");
        visualBuilder.destroy();
    });

    test("should remove the DOM when method is triggered", async () => {
        const visualBuilder = new VisualBuilder();

        await triggerAndWaitForClickAction(visualBuilderPostMessage, h1);

        let visualBuilderContainer = document.querySelector(
            `[data-testid="visual-builder__container"]`
        );

        expect(visualBuilderContainer).toBeDefined();

        visualBuilder.destroy();

        visualBuilderContainer = document.querySelector(
            `[data-testid="visual-builder__container"]`
        );

        expect(visualBuilderContainer).toBeNull();
    });

    test("should hide the DOM, when it is clicked", async () => {
        const visualBuilder = new VisualBuilder();

        await triggerAndWaitForClickAction(visualBuilderPostMessage, h1);
        const visualBuilderOverlayWrapper = await document.querySelector(
            "[data-testid='visual-builder__overlay__wrapper']"
        );
        await waitFor(() => {
            expect(visualBuilderOverlayWrapper?.classList.contains("visible")).toBe(
                true
            );
        });

        const visualBuilderOverlayTop = document.querySelector(`
        [data-testid="visual-builder__overlay--top"]`) as HTMLDivElement;

        await triggerAndWaitForClickAction(visualBuilderPostMessage, visualBuilderOverlayTop, {skipWaitForFieldType: true});
        await waitFor(() => {
            expect(h1.getAttribute("contenteditable")).toBeNull();
        });
        expect(visualBuilderOverlayWrapper?.classList.contains("visible")).toBe(
            false
        );
        visualBuilder.destroy();
    });
});
