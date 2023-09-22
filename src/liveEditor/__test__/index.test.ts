import { VisualEditor } from "../index";
import { getDefaultConfig } from "../../utils/defaults";
import { IConfig } from "../../types/types";

jest.mock("../utils/liveEditorPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: jest.fn(),
        },
    };
});

const multipleElementDOM = `<div data-cslp="page.blt58a50b4cebae75c5.en-us.page_components.4.section_with_cards"
    data-cslp-container="page.blt58a50b4cebae75c5.en-us.page_components">
    <div class="demo-section">
        <div class="cards">
            <h3 data-cslp="page.blt58a50b4cebae75c5.en-us.page_components.4.section_with_cards.cards.0.title_h3">
                Schedule a Demo with us</h3>
            <p data-cslp="page.blt58a50b4cebae75c5.en-us.page_components.4.section_with_cards.cards.0.description">Get a
                customized platform walk through for your stack.</p>
            <div class="card-cta"><a class="btn primary-btn"
                    data-cslp="page.blt58a50b4cebae75c5.en-us.page_components.4.section_with_cards.cards.0.call_to_action.title"
                    href="/contact-us">Schedule a Demo</a></div>
        </div>
        <div class="cards">
            <h3 data-cslp="page.blt58a50b4cebae75c5.en-us.page_components.4.section_with_cards.cards.1.title_h3">Start a
                Free Trial</h3>
            <p data-cslp="page.blt58a50b4cebae75c5.en-us.page_components.4.section_with_cards.cards.1.description">Lorem
                ipsum dolor sit amet, consectetur adipiscing elit. Vel lorem morbi nulla quis sed diam sed.</p>
            <div class="card-cta"><a class="btn primary-btn"
                    data-cslp="page.blt58a50b4cebae75c5.en-us.page_components.4.section_with_cards.cards.1.call_to_action.title"
                    href="/contact-us">Start Free Trial</a></div>
        </div>
    </div>
</div>`;

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
        let multiple: HTMLDivElement;
        beforeEach(() => {
            h1Tag = document.createElement("h1");
            h1Tag.innerText = "Hello World";

            h1Tag.setAttribute(
                "data-cslp",
                "page.blt58a50b4cebae75c5.en-us.page_components.1.section.title_h2"
            );

            multiple = new DOMParser().parseFromString(
                multipleElementDOM,
                "text/html"
            ).body.firstChild as HTMLDivElement;

            document.body.appendChild(h1Tag);
            document.body.appendChild(multiple);
        });

        test("should add overlay to DOM when clicked", () => {
            new VisualEditor(config);
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
            test("single line should be contenteditable", () => {
                const h1 = document.createElement("h1");

                h1.setAttribute(
                    "data-cslp",
                    "all_fields.blt58a50b4cebae75c5.en-us.single_line"
                );

                document.body.appendChild(h1);
                new VisualEditor(config);

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
    });
    test("should exist", () => {
        new VisualEditor(config);
        const startEditingButton = document.querySelector(
            `[data-testid="vcms-start-editing-btn"]`
        );

        expect(startEditingButton).toBeDefined();
    });

    test("should go to an URL upon click", () => {
        new VisualEditor(config);
        const startEditingButton = document.querySelector(
            `[data-testid="vcms-start-editing-btn"]`
        ) as HTMLButtonElement;

        const mockReplace = jest.fn();
        Object.defineProperty(window, "location", {
            value: {
                replace: mockReplace,
            },
        });

        startEditingButton.click();

        expect(mockReplace).toHaveBeenCalled();
        expect(mockReplace).toHaveBeenCalledWith(
            new URL(
                "https://app.contentstack.com/#!/live-editor/stack//environment//target_url/undefined?branch=main"
            )
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
        jest.resetAllMocks();
    });

    test("should have an overlay over the element", () => {
        new VisualEditor(config);

        let visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );

        expect(visualEditorOverlayWrapper).toMatchSnapshot();

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

    test("should remove the DOM when method is triggered", () => {
        const visualEditor = new VisualEditor(config);

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

    test("should hide the DOM, when it is clicked", () => {
        new VisualEditor(config);

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
