import fetch from "jest-fetch-mock";

import LivePreview from "../live-preview";
import { userInitData } from "../utils/defaults";
import { PublicLogger } from "../utils/public-logger";
import {
    convertObjectToMinifiedString,
    sendPostmessageToWindow,
} from "./utils";

const TITLE_CSLP_TAG = "content-type-1.entry-uid-1.en-us.field-title";
const VARIANT_TITLE_CSLP_TAG =
    "v2:content-type-1.entry-uid-1_variant-uid-1.en-us.field-title";
const DESC_CSLP_TAG = "content-type-2.entry-uid-2.en-us.field-description";
const LINK_CSLP_TAG = "content-type-3.entry-uid-3.en-us.field-link";

describe("cslp tooltip", () => {
    beforeEach(() => {
        const titlePara = document.createElement("h3");
        titlePara.setAttribute("data-cslp", TITLE_CSLP_TAG);
        titlePara.setAttribute("data-test-id", "title-para");

        const variantTitlePara = document.createElement("h3");
        variantTitlePara.setAttribute("data-cslp", VARIANT_TITLE_CSLP_TAG);
        variantTitlePara.setAttribute("data-test-id", "title-variant-para");

        const descPara = document.createElement("p");
        descPara.setAttribute("data-cslp", DESC_CSLP_TAG);
        descPara.setAttribute("data-test-id", "desc-para");

        const linkPara = document.createElement("a");
        linkPara.setAttribute("data-cslp", LINK_CSLP_TAG);
        linkPara.setAttribute("href", "https://www.example.com");
        linkPara.setAttribute("data-test-id", "link-para");

        document.body.appendChild(titlePara);
        document.body.appendChild(variantTitlePara);
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

        const expectedTop = -5;

        descPara.getBoundingClientRect = jest.fn(() => ({
            bottom: 16,
            height: 21,
            left: 8,
            right: 46.25,
            top: expectedTop,
            width: 38.25,
            x: 8,
            y: expectedTop,
        })) as any;

        descPara?.dispatchEvent(hoverEvent);

        expect(tooltip.style.top).toBe(`${expectedTop}px`);
    });

    test("should redirect to page when edit tag button is clicked with default branch", () => {
        new LivePreview({
            enable: true,
            stackDetails: {
                apiKey: "sample-api-key",
                environment: "sample-environment",
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
            "https://app.contentstack.com/#!/stack/sample-api-key/content-type/content-type-1/en-us/entry/entry-uid-1/edit?preview-field=field-title&preview-locale=en-us&preview-environment=sample-environment";

        expect(window.open).toHaveBeenCalledWith(expectedRedirectUrl, "_blank");

        descPara?.dispatchEvent(hoverEvent);
    });

    test("should redirect to page when edit tag button is clicked with added branch", () => {
        new LivePreview({
            enable: true,
            stackDetails: {
                apiKey: "sample-api-key",
                environment: "sample-environment",
                branch: "dev",
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
            "https://app.contentstack.com/#!/stack/sample-api-key/content-type/content-type-1/en-us/entry/entry-uid-1/edit?branch=dev&preview-field=field-title&preview-locale=en-us&preview-environment=sample-environment";

        expect(window.open).toHaveBeenCalledWith(expectedRedirectUrl, "_blank");

        descPara?.dispatchEvent(hoverEvent);
    });

    test("should redirect to page when edit tag button is clicked for variant field", () => {
        new LivePreview({
            enable: true,
            stackDetails: {
                apiKey: "sample-api-key",
                environment: "sample-environment",
                branch: "dev",
            },
        });

        const singularEditButton = document.querySelector(
            "[data-test-id='cslp-singular-edit-button']"
        ) as HTMLDivElement;

        const variantTitlePara = document.querySelector(
            "[data-test-id='title-variant-para']"
        );
        const descPara = document.querySelector("[data-test-id='desc-para']");

        jest.spyOn(window, "open").mockImplementation(
            (url?: string | URL, target?: string, features?: string) => {
                return {} as Window;
            }
        );

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        variantTitlePara?.dispatchEvent(hoverEvent);

        singularEditButton?.click();

        const expectedRedirectUrl =
            "https://app.contentstack.com/#!/stack/sample-api-key/content-type/content-type-1/en-us/entry/entry-uid-1/variant/variant-uid-1/edit?branch=dev&preview-field=field-title&preview-locale=en-us&preview-environment=sample-environment";

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
        spiedConsole.mockReset();
    });

    test("should throw error when edit tag is used without environment", () => {
        new LivePreview({
            enable: true,
            stackDetails: {
                apiKey: "Your-api-key",
            },
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
            "To use edit tags, you must provide the preview environment. Specify the preview environment while initializing the Live Preview SDK.  ContentstackLivePreview.init({  ...,  stackDetails: {  environment: 'Your-environment'  },  ...  })";
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

    //TODO: Fix it later
    test.skip("should move class to another element when that element is hovered", () => {
        new LivePreview({
            enable: true,
        });

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });
        expect(titlePara?.classList.contains("cslp-edit-mode")).toBeFalsy();
        expect(descPara?.classList.contains("cslp-edit-mode")).toBeFalsy();

        titlePara?.dispatchEvent(hoverEvent);

        expect(titlePara?.classList.contains("cslp-edit-mode")).toBeTruthy();
        expect(descPara?.classList.contains("cslp-edit-mode")).toBeFalsy();

        descPara?.dispatchEvent(hoverEvent);

        expect(titlePara?.classList.contains("cslp-edit-mode")).toBeFalsy();
        expect(descPara?.classList.contains("cslp-edit-mode")).toBeTruthy();
    });

    test("should redirect to link when multiple Tooltip is clicked", () => {
        const { location } = window;
        new LivePreview({
            enable: true,
        });

        const linkPara = document.querySelector("[data-test-id='link-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        const mockAssign = jest.fn();

        const locationSpy = jest
            .spyOn(window, "location", "get")
            .mockImplementation(() => {
                const mockLocation: Location = JSON.parse(
                    JSON.stringify(location)
                );
                mockLocation.assign = mockAssign;
                return mockLocation;
            });

        linkPara?.dispatchEvent(hoverEvent);

        const linkButton = document.querySelector(
            "[data-test-id='cslp-multiple-external-link-button']"
        ) as HTMLDivElement;

        linkButton?.click();

        expect(mockAssign).toHaveBeenCalledWith("https://www.example.com");

        locationSpy.mockRestore();
    });
    test("should send postMessage for scroll when button is clicked inside an iframe", () => {
        const { location } = window;

        const locationSpy = jest
            .spyOn(window, "location", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example.com";
                return mockLocation;
            });

        const parentLocationSpy = jest
            .spyOn(window.parent, "location", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example1.com";

                return mockLocation;
            });

        new LivePreview({
            enable: true,
        });

        const singularEditButton = document.querySelector(
            "[data-test-id='cslp-singular-edit-button']"
        ) as HTMLDivElement;

        const titlePara = document.querySelector("[data-test-id='title-para']");

        jest.spyOn(window, "postMessage");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        singularEditButton?.click();

        expect(window.postMessage).toHaveBeenCalledWith(
            {
                from: "live-preview",
                type: "scroll",
                data: {
                    field: "field-title",
                    content_type_uid: "content-type-1",
                    entry_uid: "entry-uid-1",
                    locale: "en-us",
                    variant: undefined,
                },
            },
            "*"
        );

        locationSpy.mockRestore();
        parentLocationSpy.mockRestore();
    });

    test("should disable the edit button when the editButton config is disabled", async () => {
        new LivePreview({
            enable: true,
            editButton: {
                enable: false,
            },
        });

        const tooltip = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        );

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        descPara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);
    });

    test("should disable the edit button when the editButton config is disabled for outside live preview panel", async () => {
        new LivePreview({
            enable: true,
            editButton: {
                enable: true,
                exclude: ["outsideLivePreviewPortal"],
            },
        });

        const tooltip = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        );

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        descPara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);
    });

    test("should disable the edit button when the editButton config is disabled for inside live preview panel", async () => {
        const { location } = window;

        const locationSpy = jest
            .spyOn(window, "location", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example.com";
                return mockLocation;
            });

        const parentLocationSpy = jest
            .spyOn(window.parent, "location", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example1.com";

                return mockLocation;
            });

        new LivePreview({
            enable: true,
            editButton: {
                enable: true,
                exclude: ["insideLivePreviewPortal"],
            },
        });

        const tooltip = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        );

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        descPara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        locationSpy.mockRestore();
        parentLocationSpy.mockRestore();
    });

    test("should enable the edit button when the editButton config is disabled for outside live preview panel but query parameter is passed", async () => {
        const { location } = window;

        const locationSpy = jest
            .spyOn(window, "location", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example.com?cslp-buttons=true";
                return mockLocation;
            });

        new LivePreview({
            enable: true,
            editButton: {
                enable: true,
                exclude: [
                    "outsideLivePreviewPortal",
                    "insideLivePreviewPortal",
                ],
            },
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

        locationSpy.mockRestore();
    });

    test("should disable the edit button even with the query parameter if includeByQueryParameter is false", async () => {
        const { location } = window;

        const locationSpy = jest
            .spyOn(window, "location", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example.com?cslp-buttons=true";
                return mockLocation;
            });

        new LivePreview({
            enable: true,
            editButton: {
                enable: true,
                exclude: [
                    "outsideLivePreviewPortal",
                    "insideLivePreviewPortal",
                ],
                includeByQueryParameter: false,
            },
        });

        const tooltip = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        );

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        descPara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

        locationSpy.mockRestore();
    });

    test("should re-render the edit button tooltip if not already available even when edit button is enabled", async () => {
        new LivePreview({
            enable: true,
            editButton: {
                enable: true,
            },
        });

        let tooltip = document.querySelector(
            "[data-test-id='cs-cslp-tooltip']"
        );
        const tooltipParent = tooltip?.parentNode;
        // deleting the tooltip
        tooltipParent?.removeChild(tooltip as Node);

        expect(
            document.querySelector("[data-test-id='cs-cslp-tooltip']")
        ).toBeNull();

        const titlePara = document.querySelector("[data-test-id='title-para']");
        const descPara = document.querySelector("[data-test-id='desc-para']");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        tooltip = document.querySelector("[data-test-id='cs-cslp-tooltip']");
        expect(tooltip).toBeDefined();

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(TITLE_CSLP_TAG);

        descPara?.dispatchEvent(hoverEvent);

        expect(tooltip?.getAttribute("current-data-cslp")).toBe(DESC_CSLP_TAG);
    });
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

describe("incoming postMessage", () => {
    beforeEach(() => {
        fetch.resetMocks();
    });
    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    test("should trigger user onChange function when client-data-send is sent with ssr: false", async () => {
        const mockedStackSdk = {
            live_preview: {},
            environment: "",
        };

        // initiate live preview
        const livePreview = new LivePreview({
            enable: true,
            ssr: false,
            stackSdk: mockedStackSdk,
        });

        await sendPostmessageToWindow("init-ack", {
            entryUid: "entryUid",
            contentTypeUid: "entryContentTypeUid",
        });

        // set user onChange function
        const userOnChange = jest.fn();
        livePreview.setOnChangeCallback(userOnChange);

        await sendPostmessageToWindow("client-data-send", {
            hash: "livePreviewHash1234",
            content_type_uid: "entryContentTypeUid",
        });

        expect(userOnChange).toHaveBeenCalled();
        expect(mockedStackSdk.live_preview).toMatchObject({
            hash: "livePreviewHash1234",
            content_type_uid: "entryContentTypeUid",
            live_preview: "livePreviewHash1234",
            entry_uid: "entryUid",
        });
    });

    test("should receive contentTypeUid and EntryUid on init-ack", async () => {
        const livePreview = new LivePreview({
            enable: true,
        });

        await sendPostmessageToWindow("init-ack", {
            entryUid: "livePreviewEntryUid",
            contentTypeUid: "livePreviewContentTypeUid",
        });

        expect(livePreview["config"].stackDetails).toMatchObject({
            apiKey: "",
            contentTypeUid: "livePreviewContentTypeUid",
            entryUid: "livePreviewEntryUid",
            environment: "",
        });
    });
    test("should navigate forward, backward and reload page on history call", async () => {
        new LivePreview({
            enable: true,
        });

        jest.spyOn(window.history, "forward");
        jest.spyOn(window.history, "back");
        jest.spyOn(window.history, "go").mockImplementation(() => {});

        // for forward
        await sendPostmessageToWindow("history", {
            type: "forward",
        });

        expect(window.history.forward).toHaveBeenCalled();

        // for back
        await sendPostmessageToWindow("history", {
            type: "backward",
        });

        expect(window.history.back).toHaveBeenCalled();

        // for reload
        await sendPostmessageToWindow("history", {
            type: "reload",
        });

        expect(window.history.go).toHaveBeenCalled();
    });
});

describe("live preview hash", () => {
    test("should be empty by default", () => {
        const livePreview = new LivePreview();

        expect(livePreview.hash).toBe("");
    });

    test("should be set when client-data-send event is fired", async () => {
        const livePreview = new LivePreview();
        const livePreviewHash = "livePreviewHash1234";

        await sendPostmessageToWindow("client-data-send", {
            hash: livePreviewHash,
            content_type_uid: "entryContentTypeUid",
            entry_uid: "entryUid",
        });

        expect(livePreview.hash).toBe(livePreviewHash);
    });
});

describe("setConfigFromParams()", () => {
    test("should set hash if live_preview is present", () => {
        const livePreview = new LivePreview();
        const livePreviewHash = "livePreviewHash1234";

        expect(livePreview.hash).toBe("");

        livePreview.setConfigFromParams({
            live_preview: livePreviewHash,
        });

        expect(livePreview.hash).toBe(livePreviewHash);
    });

    test("should throw an error if param is not an object", () => {
        const livePreview = new LivePreview();

        expect(() => {
            // @ts-ignore
            livePreview.setConfigFromParams("");
        }).toThrowError("Live preview SDK: query param must be an object");
    });
});
