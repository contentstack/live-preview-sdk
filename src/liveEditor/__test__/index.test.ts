import crypto from "crypto";

import { sleep } from "../../__test__/utils";
import { IConfig } from "../../types/types";
import { getDefaultConfig } from "../../utils/defaults";
import { VisualEditor } from "../index";

jest.mock("../utils/liveEditorPostMessage", () => {
    const { getAllContentTypes } = jest.requireActual(
        "../../__test__/data/contentType"
    );
    const contentTypes = getAllContentTypes();
    return {
        __esModule: true,
        default: {
            send: jest.fn().mockImplementation((eventName: string) => {
                if (eventName === "init")
                    return Promise.resolve({
                        contentTypes,
                    });
                return Promise.resolve();
            }),
        },
    };
});

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

describe("Visual editor", () => {
    let config: IConfig;
    beforeEach(() => {
        config = getDefaultConfig();
    });

    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    test("should append a visual editor container to the DOM", () => {
        let visualEditorDOM = document.querySelector(
            ".visual-editor__container"
        );

        expect(visualEditorDOM).toBeNull();

        new VisualEditor(config);

        visualEditorDOM = document.querySelector(".visual-editor__container");

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
            new VisualEditor(config);

            await sleep(0);
            h1Tag.click();

            expect(document.body).toMatchSnapshot();
        });
    });

    describe("on click, the sdk", () => {
        afterEach(() => {
            document.getElementsByTagName("html")[0].innerHTML = "";
        });

        test("should do nothing if data-cslp not available", () => {
            const h1 = document.createElement("h1");

            document.body.appendChild(h1);
            new VisualEditor(config);

            h1.click();

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
                new VisualEditor(config);

                await sleep(0);
                h1.click();

                expect(h1).toMatchSnapshot();
                expect(h1.getAttribute("contenteditable")).toBe("true");
            });

            test("multi line should be contenteditable", () => {
                const h1 = document.createElement("h1");
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.multi_line"
                );
                document.body.appendChild(h1);
                new VisualEditor(config);

                h1.click();

                // h1.addEventListener("keydown", (e: KeyboardEvent) => {
                //     e.code.includes("")
                // })

                expect(h1).toMatchSnapshot();
                expect(h1.getAttribute("contenteditable")).toBe("true");
            });

            test("file should render a replacer and remove when it is not", () => {
                const h1 = document.createElement("h1");
                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.file"
                );
                document.body.appendChild(h1);
                new VisualEditor(config);
                h1.click();

                let replaceBtn = document.getElementsByClassName(
                    "visual-editor__replace-button"
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

                replaceBtn = document.getElementsByClassName(
                    "visual-editor__replace-button"
                )[0];

                expect(replaceBtn).toBeUndefined();
            });
        });
    });
});

describe("start editing button", () => {
    let config: IConfig;
    beforeEach(() => {
        config = getDefaultConfig();
    });
    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        jest.restoreAllMocks();
    });

    test("should exist", () => {
        new VisualEditor(config);
        const startEditingButton = document.querySelector(
            `[data-testid="vcms-start-editing-btn"]`
        );

        expect(startEditingButton).toBeDefined();
    });

    test("should go to an URL upon click", () => {
        config.stackDetails.apiKey = "api_key";
        config.stackDetails.environment = "environment";

        Object.defineProperty(window, "location", {
            value: {
                href: "https://example.com",
            },
        });

        new VisualEditor(config);
        const startEditingButton = document.querySelector(
            `[data-testid="vcms-start-editing-btn"]`
        ) as HTMLButtonElement;

        startEditingButton.click();

        expect(startEditingButton.getAttribute("href")).toBe(
            "https://app.contentstack.com/live-editor/stack/api_key/environment/environment/target_url/https%3A%2F%2Fexample.com?branch=main&locale=en-us"
        );

        const h1 = document.createElement("h1");
        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-uk.title"
        );

        document.body.appendChild(h1);

        startEditingButton.click();

        expect(startEditingButton.getAttribute("href")).toBe(
            "https://app.contentstack.com/live-editor/stack/api_key/environment/environment/target_url/https%3A%2F%2Fexample.com?branch=main&locale=en-uk"
        );
    });
});

describe("visual editor DOM", () => {
    let h1: HTMLHeadElement;
    let config: IConfig;

    beforeEach(() => {
        config = getDefaultConfig();

        h1 = document.createElement("h1");

        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.title"
        );

        h1.getBoundingClientRect = jest.fn(() => ({
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

    test("should have an overlay over the element", async () => {
        new VisualEditor(config);

        let visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );

        expect(visualEditorOverlayWrapper).toMatchSnapshot();

        await sleep(0);
        h1.click();

        visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );

        expect(visualEditorOverlayWrapper).toMatchSnapshot();
        expect(visualEditorOverlayWrapper?.classList.contains("visible")).toBe(
            true
        );

        const visualEditorWrapperTopOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--top"]`
        ) as HTMLDivElement;
        const visualEditorWrapperLeftOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--left"]`
        ) as HTMLDivElement;
        const visualEditorWrapperRightOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--right"]`
        ) as HTMLDivElement;
        const visualEditorWrapperBottomOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--bottom"]`
        ) as HTMLDivElement;

        expect(visualEditorWrapperTopOverlay.style.top).toBe("0px");
        expect(visualEditorWrapperTopOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperTopOverlay.style.width).toBe("100%");
        expect(visualEditorWrapperTopOverlay.style.height).toBe("10px");

        expect(visualEditorWrapperBottomOverlay.style.top).toBe("20px");
        expect(visualEditorWrapperBottomOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperBottomOverlay.style.width).toBe("100%");
        expect(visualEditorWrapperBottomOverlay.style.height).toBe("-20px");

        expect(visualEditorWrapperLeftOverlay.style.top).toBe("10px");
        expect(visualEditorWrapperLeftOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperLeftOverlay.style.width).toBe("10px");

        expect(visualEditorWrapperRightOverlay.style.top).toBe("10px");
        expect(visualEditorWrapperRightOverlay.style.left).toBe("20px");
        expect(visualEditorWrapperRightOverlay.style.width).toBe("1004px");
    });

    test("should remove the DOM when method is triggered", async () => {
        const visualEditor = new VisualEditor(config);

        await sleep(0);
        h1.click();

        let visualEditorContainer = document.querySelector(
            `[data-testid="visual-editor__container"]`
        );

        expect(visualEditorContainer).toBeDefined();

        visualEditor.removeVisualEditorDOM();

        visualEditorContainer = document.querySelector(
            `[data-testid="visual-editor__container"]`
        );

        expect(visualEditorContainer).toBeNull();
    });

    test("should hide the DOM, when it is clicked", async () => {
        new VisualEditor(config);

        await sleep(0);
        h1.click();

        let visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );
        expect(visualEditorOverlayWrapper?.classList.contains("visible")).toBe(
            true
        );
        expect(h1.getAttribute("contenteditable")).toBe("true");

        const visualEditorOverlayTop = document.querySelector(`
        [data-testid="visual-editor__overlay--top"]`) as HTMLDivElement;

        visualEditorOverlayTop?.click();

        visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );
        expect(visualEditorOverlayWrapper?.classList.contains("visible")).toBe(
            false
        );
        expect(h1.getAttribute("contenteditable")).toBeNull();
    });
});