import LivePreview from "../live-preview";
import { userInitData } from "../utils/defaults";
import { PublicLogger } from "../utils/public-logger";
import { convertObjectToMinifiedString } from "./utils";

const TITLE_CSLP_TAG = "content-type-1.entry-uid-1.en-us.field-title";
const DESC_CSLP_TAG = "content-type-2.entry-uid-2.en-us.field-description";
const LINK_CSLP_TAG = "content-type-3.entry-uid-3.en-us.field-link";

describe("cslp tooltip", () => {
    beforeEach(() => {
        const titlePara = document.createElement("h3");
        titlePara.setAttribute("data-cslp", TITLE_CSLP_TAG);
        titlePara.setAttribute("data-test-id", "title-para");

        const descPara = document.createElement("p");
        descPara.setAttribute("data-cslp", DESC_CSLP_TAG);
        descPara.setAttribute("data-test-id", "desc-para");

        const linkPara = document.createElement("a");
        linkPara.setAttribute("data-cslp", LINK_CSLP_TAG);
        linkPara.setAttribute("href", "https://www.example.com");
        linkPara.setAttribute("data-test-id", "link-para");

        document.body.appendChild(titlePara);
        document.body.appendChild(descPara);
        document.body.appendChild(linkPara);
    });

    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    test("should get value of cslp-tooltip into current-data-cslp when tag is hovered", () => {
        new LivePreview({
            enable: true,
        });

        const tooltip = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        );

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(null);

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(TITLE_CSLP_TAG);

        descPara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(DESC_CSLP_TAG);
    });

    test("should change the button to single when hovered again to element without href", () => {
        new LivePreview({
            enable: true,
        });

        const tooltip = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        );

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const linkPara = document.querySelector("[data-test-id='link-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(TITLE_CSLP_TAG);

        linkPara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(LINK_CSLP_TAG);

        titlePara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(TITLE_CSLP_TAG);
    });

    test("should stick to top when element is above the viewport", () => {
        new LivePreview({
            enable: true,
        });

        const tooltip = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        ) as HTMLDivElement;

        const titlePara = document.querySelector(
            "[data-test-id='title-para']"
        ) as HTMLHeadingElement;
        const descPara = document.querySelector(
            "[data-test-id='desc-para']"
        ) as HTMLParagraphElement;

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara.getBoundingClientRect = jest.fn(() => ({
            x: 50,
            y: 50,
            width: 50,
            height: 50,
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        })) as any;

        titlePara?.dispatchEvent(hoverEvent);

        expect(tooltip.style.top).toBe("10px");

        descPara.getBoundingClientRect = jest.fn(() => ({
            bottom: 16,
            height: 21,
            left: 8,
            right: 46.25,
            top: -5,
            width: 38.25,
            x: 8,
            y: -5,
        })) as any;

        descPara?.dispatchEvent(hoverEvent);

        expect(tooltip.style.top).toBe("0px");
    });

    test("should redirect to page when edit tag button is clicked", () => {
        new LivePreview({
            enable: true,
            stackDetails: {
                apiKey: "sample-api-key",
            },
        });

        const singularEditButton = document.querySelector(
            "[data-test-id='cslp-singular-edit-button']"
        ) as HTMLDivElement;

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        jest.spyOn(window, "open").mockImplementation(
            (url?: string | URL, target?: string, features?: string) => {
                return {} as Window;
            }
        );

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        singularEditButton?.click();

        const expectedRedirectUrl =
            "https://app.contentstack.com/#!/stack/sample-api-key/content-type/content-type-1/en-us/entry/entry-uid-1/edit?preview-field=field-title&preview-url=http%3A%2F%2Flocalhost";

        expect(window.open).toHaveBeenCalledWith(expectedRedirectUrl, "_blank");

        descPara?.dispatchEvent(hoverEvent);
    });

    test("should throw error when edit tag is used without apiKey", () => {
        new LivePreview({
            enable: true,
        });

        const singularEditButton = document.querySelector(
            "[data-test-id='cslp-singular-edit-button']"
        ) as HTMLDivElement;

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        const spiedConsole = jest.spyOn(PublicLogger, "error");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        singularEditButton?.click();

        const outputErrorLog = (spiedConsole.mock.calls[0] as any[])[0];
        const sanitizedErrorMessage =
            convertObjectToMinifiedString(outputErrorLog);
        const expectedErrorLog =
            "To use edit tags, you must provide the stack API key. Specify the API key while initializing the Live Preview SDK.  ContentstackLivePreview.init({  ...,  stackDetails: {  apiKey: 'your-api-key'  },  ...  })";

        expect(sanitizedErrorMessage).toEqual(expectedErrorLog);

        descPara?.dispatchEvent(hoverEvent);
    });

    test("should remove data-cslp tag when cleanCslpOnProduction is true", () => {
        new LivePreview({
            enable: false,
            cleanCslpOnProduction: true,
        });

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        expect(titlePara?.getAttribute("data-cslp")).toBe(null);

        descPara?.dispatchEvent(hoverEvent);

        expect(descPara?.getAttribute("data-cslp")).toBe(null);
    });

    test("should not remove data-cslp tag when enable is true even if cleanCslpOnProduction is true", () => {
        new LivePreview({
            enable: true,
            cleanCslpOnProduction: true,
        });

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        expect(titlePara?.getAttribute("data-cslp")).toBe(TITLE_CSLP_TAG);

        descPara?.dispatchEvent(hoverEvent);

        expect(descPara?.getAttribute("data-cslp")).toBe(DESC_CSLP_TAG);
    });

    test("should create multiple button when hover on a link", () => {
        new LivePreview({
            enable: true,
        });

        const link = document.querySelector("[data-test-id='link-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        link?.dispatchEvent(hoverEvent);

        const multipleEditButton = document.querySelector(
            "[data-test-id='cslp-multiple-edit-button']"
        );

        expect(multipleEditButton).toBeTruthy();
    });

    test("should have current-href when hover upon a link", () => {
        new LivePreview({
            enable: true,
        });

        const link = document.querySelector("[data-test-id='link-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        link?.dispatchEvent(hoverEvent);

        const multipleEditButton = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        );

        expect(multipleEditButton?.getAttribute("current-href")).toBe(
            "https://www.example.com"
        );
    });

    test("should remove class when another element is hovered", () => {});

    test.skip("should redirect to link when multiple Tooltip is clicked", () => {
        new LivePreview({
            enable: true,
        });

        const linkPara = document.querySelector("[data-test-id='link-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        linkPara?.dispatchEvent(hoverEvent);

        const linkButton = document.querySelector(
            "[data-test-id='cslp-multiple-external-link-button']"
        ) as HTMLDivElement;

        linkButton?.click();

        global.window = Object.create(window);
        const url = "http://localhost";
        Object.defineProperty(window, "location", {
            value: {
                href: url,
            },
            writable: true,
        });

        console.log("mayhem", document.body.innerHTML, linkButton);

        expect(window.location.assign).toHaveBeenCalledWith(
            "https://www.example.com"
        );
    });

    // test("should show warning when Live preview is initialized twice", () => {
    //     const spiedConsole = jest.spyOn(console, "warn");

    //     new LivePreview({
    //         enable: true,
    //     });

    //     // re-initialized to see if warning is thrown
    //     new LivePreview({
    //         enable: true,
    //         ssr: false,
    //     });

    //     const outputErrorLog = spiedConsole.mock.calls[0] as any[];

    //     console.log("outputErrorLog", outputErrorLog);
    // });
    // test.skip("should run onchangeCallback() when entry is updated", () => {});`
});

describe("debug module", () => {
    test("should display config when debug is true", () => {
        const spiedConsole = jest.spyOn(PublicLogger, "debug");
        new LivePreview({
            //@ts-ignore
            debug: true,
        });

        const outputErrorLog = spiedConsole.mock.calls[0];

        expect(outputErrorLog[0]).toEqual(
            "Contentstack Live Preview Debugging mode: config --"
        );

        expect(outputErrorLog[1]).toMatchObject(userInitData);
    });
});
