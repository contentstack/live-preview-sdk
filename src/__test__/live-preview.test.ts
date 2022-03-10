import LivePreview from "../live-preview";

const TITLE_CSLP_TAG = "content-type-1.entry-uid-1.en-us.field-title";
const DESC_CSLP_TAG = "content-type-2.entry-uid-2.en-us.field-description";

describe("cslp tooltip", () => {
    beforeEach(() => {
        const titlePara = document.createElement("h3");
        titlePara.setAttribute("data-cslp", TITLE_CSLP_TAG);
        titlePara.setAttribute("data-test-id", "title-para");

        const descPara = document.createElement("p");
        descPara.setAttribute("data-cslp", DESC_CSLP_TAG);
        descPara.setAttribute("data-test-id", "desc-para");

        document.body.appendChild(titlePara);
        document.body.appendChild(descPara);
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

        const clickEvent = new CustomEvent("click", {
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

        const spiedConsole = jest.spyOn(console, "error");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        singularEditButton?.click();

        const outputErrorLog = (spiedConsole.mock.calls[0] as any[])[0];
        const sanitizedErrorMessage = outputErrorLog.replace(
            /([\n]+|[\s]{2,})/gm,
            " "
        );
        const expectedErrorLog =
            "Contentstack Live Preview: You must provide api key to use Edit tags. Provide the api key while initializing the Live preview SDK.  ContentstackLivePreview.init({  ...,  stackDetails: {  apiKey: 'your-api-key'  },  ...  })";

        expect(sanitizedErrorMessage).toEqual(expectedErrorLog);

        descPara?.dispatchEvent(hoverEvent);
    });
    // test.skip("should show warning when Live preview is initialized twice", () => {});
    // test.skip("should run onchangeCallback() when entry is updated", () => {});
});
