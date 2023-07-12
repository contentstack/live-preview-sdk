import { VisualEditor } from "../index";
import { getDefaultConfig } from "../../utils/defaults";

import { IConfig } from "../../utils/types";

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

    describe("instance buttons", () => {
        test.todo("should append to the DOM");
        test.todo("should hide when overlay is closed");
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

            (h1Tag.firstChild as HTMLDivElement).click();

            expect(document.body).toMatchSnapshot();
        });
    });

    describe("on hover, the sdk", () => {
        let h1Tag: HTMLHeadingElement;

        beforeEach(() => {
            h1Tag = document.createElement("h1");
            h1Tag.innerText = "Hello World";

            h1Tag.setAttribute(
                "data-cslp",
                "page.blt58a50b4cebae75c5.en-us.title"
            );
            document.body.appendChild(h1Tag);
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
    });
});
