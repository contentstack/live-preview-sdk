import crypto from "crypto";
import { getFieldSchemaMap } from "../../__test__/data/fieldSchemaMap";
import { sleep } from "../../__test__/utils";
import Config from "../../configManager/configManager";
import { VisualEditor } from "../index";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";

vi.mock("../utils/liveEditorPostMessage", async () => {
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

describe("Visual editor", () => {
    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
        Config.set("mode", 2);
    });

    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        FieldSchemaMap.clear();
    });

    test("should append a visual editor container to the DOM", () => {
        let visualEditorDOM = document.querySelector(
            ".visual-builder__container"
        );

        expect(visualEditorDOM).toBeNull();

        new VisualEditor();

        visualEditorDOM = document.querySelector(
            `[data-testid="visual-builder__container"]`
        );

        expect(visualEditorDOM).toMatchSnapshot();
    });

    describe("inline editing", () => {
        let h1Tag: HTMLHeadingElement;
        beforeEach(() => {
            h1Tag = document.createElement("h1");
            h1Tag.innerText = "Hello World";

            h1Tag.setAttribute(
                "data-cslp",
                "all_fields.blt58a50b4cebae75c5.en-us.modular_blocks.0.block.single_line"
            );
            document.body.appendChild(h1Tag);
        });

        test("should add overlay to DOM when clicked", async () => {
            new VisualEditor();

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
            new VisualEditor();

            h1.click();
            await sleep(0);

            expect(document.body).toMatchSnapshot();
        });

        describe("inline elements must be contenteditable", () => {
            test("single line should be contenteditable", async () => {
                const h1 = document.createElement("h1");

                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.single_line"
                );

                document.body.appendChild(h1);
                new VisualEditor();

                await sleep(0);
                h1.click();
                await sleep(0);

                expect(h1).toMatchSnapshot();
                expect(h1.getAttribute("contenteditable")).toBe("true");
            });

            test("multi line should be contenteditable", async () => {
                const h1 = document.createElement("h1");
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.multi_line"
                );
                document.body.appendChild(h1);
                new VisualEditor();

                h1.click();
                await sleep(0);

                // h1.addEventListener("keydown", (e: KeyboardEvent) => {
                //     e.code.includes("")
                // })

                expect(h1).toMatchSnapshot();
                expect(h1.getAttribute("contenteditable")).toBe("true");
            });

            test("file should render a replacer and remove when it is not", async () => {
                const h1 = document.createElement("h1");
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.file"
                );
                document.body.appendChild(h1);
                new VisualEditor();
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

describe("visual editor DOM", () => {
    let h1: HTMLHeadElement;

    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
    });

    beforeEach(() => {
        h1 = document.createElement("h1");

        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.title"
        );

        h1.getBoundingClientRect = vi.fn(() => ({
            left: 10,
            right: 20,
            top: 10,
            bottom: 20,
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
        new VisualEditor();

        let visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-builder__overlay__wrapper"]`
        );

        expect(visualEditorOverlayWrapper).toMatchSnapshot();

        await sleep(0);
        h1.click();
        await sleep(0);

        visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-builder__overlay__wrapper"]`
        );

        expect(visualEditorOverlayWrapper).toMatchSnapshot();
        expect(visualEditorOverlayWrapper?.classList.contains("visible")).toBe(
            true
        );

        const visualEditorWrapperTopOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--top"]`
        ) as HTMLDivElement;
        const visualEditorWrapperLeftOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--left"]`
        ) as HTMLDivElement;
        const visualEditorWrapperRightOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--right"]`
        ) as HTMLDivElement;
        const visualEditorWrapperBottomOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--bottom"]`
        ) as HTMLDivElement;

        expect(visualEditorWrapperTopOverlay.style.top).toBe("0px");
        expect(visualEditorWrapperTopOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperTopOverlay.style.width).toBe("100%");
        expect(visualEditorWrapperTopOverlay.style.height).toBe(
            "calc(10px - 2px)"
        );

        expect(visualEditorWrapperBottomOverlay.style.top).toBe(
            "calc(20px + 2px)"
        );
        expect(visualEditorWrapperBottomOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperBottomOverlay.style.width).toBe("100%");
        expect(visualEditorWrapperBottomOverlay.style.height).toBe(
            "calc(-20px - 2px)"
        );

        expect(visualEditorWrapperLeftOverlay.style.top).toBe(
            "calc(10px - 2px)"
        );
        expect(visualEditorWrapperLeftOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperLeftOverlay.style.width).toBe(
            "calc(10px - 2px)"
        );

        expect(visualEditorWrapperRightOverlay.style.top).toBe(
            "calc(10px - 2px)"
        );
        expect(visualEditorWrapperRightOverlay.style.left).toBe(
            "calc(20px + 2px)"
        );
        expect(visualEditorWrapperRightOverlay.style.width).toBe(
            "calc(1004px - 2px)"
        );
    });

    test("should remove the DOM when method is triggered", async () => {
        const visualEditor = new VisualEditor();

        await sleep(0);
        h1.click();
        // We need this sleep as there are some async task happening while
        // the overlay is being rendered.
        await sleep(0);

        let visualEditorContainer = document.querySelector(
            `[data-testid="visual-builder__container"]`
        );

        expect(visualEditorContainer).toBeDefined();

        visualEditor.destroy();

        visualEditorContainer = document.querySelector(
            `[data-testid="visual-builder__container"]`
        );

        expect(visualEditorContainer).toBeNull();
    });

    test("should hide the DOM, when it is clicked", async () => {
        new VisualEditor();

        await sleep(0);
        h1.click();
        // We need this sleep as there are some async task happening while
        // the overlay is being rendered.
        await sleep(0);

        let visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-builder__overlay__wrapper"]`
        );
        expect(visualEditorOverlayWrapper?.classList.contains("visible")).toBe(
            true
        );
        expect(h1.getAttribute("contenteditable")).toBe("true");

        const visualEditorOverlayTop = document.querySelector(`
        [data-testid="visual-builder__overlay--top"]`) as HTMLDivElement;

        visualEditorOverlayTop?.click();

        visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-builder__overlay__wrapper"]`
        );
        expect(visualEditorOverlayWrapper?.classList.contains("visible")).toBe(
            false
        );
        expect(h1.getAttribute("contenteditable")).toBeNull();
    });
});
