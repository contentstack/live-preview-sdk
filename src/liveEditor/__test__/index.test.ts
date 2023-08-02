import { VisualEditor } from "../index";
import { getDefaultConfig } from "../../utils/defaults";
import { IConfig } from "../../types/types";
import { sleep } from "../../__test__/utils";

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

    describe("on hover, the sdk", () => {
        let h1Tag: HTMLHeadingElement;
        let h2Tag: HTMLHeadElement;
        let noCslpTag: HTMLHeadingElement;

        beforeEach(() => {
            h1Tag = document.createElement("h1");
            h1Tag.innerText = "Hello World";

            h1Tag.setAttribute(
                "data-cslp",
                "all_fields.blt58a50b4cebae75c5.en-us.title"
            );
            document.body.appendChild(h1Tag);

            noCslpTag = document.createElement("h2");
            noCslpTag.innerText = "No cslp tag";
            document.body.appendChild(noCslpTag);

            h2Tag = document.createElement("h2");
            h2Tag.setAttribute(
                "data-cslp",
                "all_fields.blt58a50b4cebae75c5.en-us.unknown"
            );
            document.body.appendChild(h2Tag);
        });

        afterEach(() => {
            document.getElementsByTagName("html")[0].innerHTML = "";
        });

        test("show a custom cursor", () => {
            new VisualEditor(config);

            const mouseoverEvent = new Event("mousemove", {
                bubbles: true,
            });

            h1Tag.dispatchEvent(mouseoverEvent);

            const cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(cursor).toMatchSnapshot();
        });

        test("should hide custom cursor if data cslp not available", async () => {
            new VisualEditor(config);

            const mouseoverEvent = new Event("mousemove", {
                bubbles: true,
            });

            h1Tag.dispatchEvent(mouseoverEvent);

            let cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(cursor).toMatchSnapshot();
            expect(cursor?.classList.contains("visible")).toBe(true);

            noCslpTag.dispatchEvent(mouseoverEvent);

            cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            await sleep();

            expect(cursor).toMatchSnapshot();
            expect(cursor?.classList.contains("visible")).toBe(false);
        });

        test("should hide custom cursor if the current element is not previously hovered element", async () => {
            new VisualEditor(config);

            const mouseoverEvent = new Event("mousemove", {
                bubbles: true,
            });

            h1Tag.dispatchEvent(mouseoverEvent);

            let cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(cursor).toMatchSnapshot();
            expect(cursor?.classList.contains("visible")).toBe(true);

            h2Tag.dispatchEvent(mouseoverEvent);

            cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            await sleep();

            expect(cursor).toMatchSnapshot();
            expect(cursor?.classList.contains("visible")).toBe(false);
        });

        test("should do nothing if the element is hovered with empty data-cslp", async () => {
            new VisualEditor(config);

            const mouseoverEvent = new Event("mousemove", {
                bubbles: true,
            });

            h1Tag.dispatchEvent(mouseoverEvent);

            let cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(cursor).toMatchSnapshot();
            expect(cursor?.classList.contains("visible")).toBe(true);

            h1Tag.dispatchEvent(mouseoverEvent);

            cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            await sleep();

            expect(cursor).toMatchSnapshot();
            expect(cursor?.classList.contains("visible")).toBe(true);
        });

        test("should do nothing if the same element is hovered", async () => {
            new VisualEditor(config);

            const mouseoverEvent = new Event("mousemove", {
                bubbles: true,
            });
            await sleep();

            h1Tag.dispatchEvent(mouseoverEvent);

            let cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            expect(cursor).toMatchSnapshot();
            expect(cursor?.classList.contains("visible")).toBe(true);

            h2Tag.setAttribute("data-cslp", "");
            await sleep();

            h2Tag.dispatchEvent(mouseoverEvent);

            cursor = document.querySelector(
                `[data-testid="visual-editor__cursor"]`
            );

            await sleep();

            expect(cursor).toMatchSnapshot();
            expect(cursor?.classList.contains("visible")).toBe(false);
        });

        describe("handle multiple elements", () => {
            test("handle block element", async () => {
                const firstChild = document.createElement("div");
                firstChild.setAttribute(
                    "data-cslp",
                    "all_fields.bltapikey.en-us.modular_blocks.0.block"
                );
                firstChild.setAttribute(
                    "data-cslp-container",
                    "all_fields.bltapikey.en-us.modular_blocks"
                );

                firstChild.getBoundingClientRect = jest.fn(() => ({
                    left: 10,
                    right: 20,
                    top: 10,
                    bottom: 20,
                })) as any;

                const secondChild = document.createElement("div");
                secondChild.setAttribute(
                    "data-cslp",
                    "all_fields.bltapikey.en-us.modular_blocks.1.second_block"
                );
                secondChild.setAttribute(
                    "data-cslp-container",
                    "all_fields.bltapikey.en-us.modular_blocks"
                );

                const container = document.createElement("div");
                container.setAttribute(
                    "data-cslp",
                    "all_fields.bltapikey.en-us.modular_blocks"
                );
                container.appendChild(firstChild);
                container.appendChild(secondChild);

                document.body.appendChild(container);

                new VisualEditor(config);

                await sleep(1000);
                const mouseoverEvent = new Event("mousemove", {
                    bubbles: true,
                });

                firstChild.dispatchEvent(mouseoverEvent);

                const [prevBtn, nextBtn] = document.getElementsByClassName(
                    "visual-editor__add-button"
                ) as unknown as [HTMLDivElement, HTMLDivElement];

                expect(prevBtn.style.left).toBe("15px");
                expect(prevBtn.style.top).toBe("10px");

                expect(nextBtn.style.left).toBe("15px");
                expect(nextBtn.style.top).toBe("20px");
            });
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
