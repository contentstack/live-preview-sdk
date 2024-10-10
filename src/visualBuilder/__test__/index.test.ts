import crypto from "crypto";
import { getFieldSchemaMap } from "../../__test__/data/fieldSchemaMap";
import { sleep } from "../../__test__/utils";
import Config from "../../configManager/configManager";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { waitFor, screen } from "@testing-library/preact";
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

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

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

    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        FieldSchemaMap.clear();
    });

    test("should append a visual builder container to the DOM", () => {
        let visualBuilderDOM = document.querySelector(
            ".visual-builder__container"
        );

        expect(visualBuilderDOM).toBeNull();

        new VisualBuilder();

        visualBuilderDOM = document.querySelector(
            `[data-testid="visual-builder__container"]`
        );

        expect(visualBuilderDOM).toMatchSnapshot();
    });

    describe("inline editing", () => {
        let h1Tag: HTMLHeadingElement;
        beforeEach(() => {
            h1Tag = document.createElement("h1");
            h1Tag.textContent = INLINE_EDITABLE_FIELD_VALUE;
            h1Tag.setAttribute(
                "data-cslp",
                "all_fields.blt58a50b4cebae75c5.en-us.modular_blocks.0.block.single_line"
            );
            document.body.appendChild(h1Tag);
        });

        test("should add overlay to DOM when clicked", async () => {
            new VisualBuilder();

            await sleep(0);
            h1Tag.click();
            await sleep(0);

            expect(document.body).toMatchSnapshot();
        });
    });

    describe("on click, the sdk", () => {
        afterEach(() => {
            document.getElementsByTagName("html")[0].innerHTML = "";
        });

        test("should do nothing if data-cslp not available", async () => {
            const h1 = document.createElement("h1");

            document.body.appendChild(h1);
            new VisualBuilder();

            h1.click();
            await sleep(0);

            expect(document.body).toMatchSnapshot();
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
                new VisualBuilder();

                await sleep(0);
                h1.click();
                await sleep(0);

                await waitFor(() => {
                    expect(h1.getAttribute("contenteditable")).toBe("true");
                });
                expect(h1).toMatchSnapshot();
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
                new VisualBuilder();

                await sleep(0);
                h1.click();
                await sleep(0);

                // h1.addEventListener("keydown", (e: KeyboardEvent) => {
                //     e.code.includes("")
                // })

                await waitFor(() => {
                    expect(h1.getAttribute("contenteditable")).toBe("true");
                });
                expect(h1).toMatchSnapshot();
            });

            test("file should render a replacer and remove when it is not", async () => {
                const h1 = document.createElement("h1");
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.file"
                );
                document.body.appendChild(h1);
                new VisualBuilder();
                h1.click();
                await sleep(0);

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

                h2.click();
                await sleep(0);

                replaceBtn = document.getElementsByClassName(
                    "visual-builder__replace-button"
                )[0];

                expect(replaceBtn).toBeUndefined();
            });
        });
    });
});

describe("visual builder DOM", () => {
    let h1: HTMLHeadElement;

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
        h1 = document.createElement("h1");

        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.single_line"
        );

        h1.innerText = INLINE_EDITABLE_FIELD_VALUE;

        h1.getBoundingClientRect = vi.fn(() => ({
            left: 10,
            right: 20,
            top: 10,
            bottom: 20,
            width: 10,
            height: 5,
        })) as any;

        document.body.appendChild(h1);
    });

    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        FieldSchemaMap.clear();
    });

    test("should have an overlay over the element", async () => {
        new VisualBuilder();

        let visualBuilderOverlayWrapper = document.querySelector(
            `[data-testid="visual-builder__overlay__wrapper"]`
        );

        expect(visualBuilderOverlayWrapper).toMatchSnapshot();

        await sleep(0);
        // TODO - should we be using userEvent? which is more
        // accurate simulation of actual events that are triggered
        // in a browser on clicking. Right now, this test fails if we
        // use userEvent.click
        // await userEvent.click(h1);
        h1.click();
        await sleep(0);

        await waitFor(() => {
            expect(h1.getAttribute("contenteditable")).toBe("true");
        });
        visualBuilderOverlayWrapper = await screen.findByTestId(
            "visual-builder__overlay__wrapper"
        );
        expect(visualBuilderOverlayWrapper?.classList.contains("visible")).toBe(
            true
        );
        expect(visualBuilderOverlayWrapper).toMatchSnapshot();

        const visualBuilderWrapperTopOverlay = await screen.findByTestId(
            "visual-builder__overlay--top"
        );
        const visualBuilderWrapperLeftOverlay = await screen.findByTestId(
            "visual-builder__overlay--left"
        );
        const visualBuilderWrapperRightOverlay = await screen.findByTestId(
            "visual-builder__overlay--right"
        );
        const visualBuilderWrapperBottomOverlay = await screen.findByTestId(
            "visual-builder__overlay--bottom"
        );

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
    });

    test("should remove the DOM when method is triggered", async () => {
        const visualBuilder = new VisualBuilder();

        await sleep(0);
        h1.click();
        // We need this sleep as there are some async task happening while
        // the overlay is being rendered.
        await sleep(0);

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
        new VisualBuilder();

        await sleep(0);
        h1.click();
        // We need this sleep as there are some async task happening while
        // the overlay is being rendered.
        await sleep(0);

        expect(h1.getAttribute("contenteditable")).toBe("true");

        await waitFor(() => {
            expect(h1.getAttribute("contenteditable")).toBe("true");
        });
        let visualBuilderOverlayWrapper = await screen.findByTestId(
            "visual-builder__overlay__wrapper"
        );
        expect(visualBuilderOverlayWrapper?.classList.contains("visible")).toBe(
            true
        );

        const visualBuilderOverlayTop = document.querySelector(`
        [data-testid="visual-builder__overlay--top"]`) as HTMLDivElement;

        visualBuilderOverlayTop?.click();
        await sleep(0);

        await waitFor(() => {
            expect(h1.getAttribute("contenteditable")).toBeNull();
        });
        visualBuilderOverlayWrapper = await screen.findByTestId(
            "visual-builder__overlay__wrapper"
        );
        expect(visualBuilderOverlayWrapper?.classList.contains("visible")).toBe(
            true
        );
    });
});
