import crypto from "crypto";
import { convertObjectToMinifiedString } from "../../__test__/utils";
import Config from "../../configManager/configManager";
import { PublicLogger } from "../../logger/logger";
import { ILivePreviewWindowType } from "../../types/types";
import { mockLivePreviewInitEventListener } from "../__test__/mock";
import livePreviewPostMessage from "../eventManager/livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "../eventManager/livePreviewEventManager.constant";
import { LivePreviewEditButton } from "./editButton";

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

const TITLE_CSLP_TAG = "content-type-1.entry-uid-1.en-us.field-title";
const DESC_CSLP_TAG = "content-type-2.entry-uid-2.en-us.field-description";
const LINK_CSLP_TAG = "content-type-3.entry-uid-3.en-us.field-link";

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

describe("cslp tooltip", () => {
    beforeEach(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );

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

        Config.set("windowType", ILivePreviewWindowType.PREVIEW);
    });

    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
    });

    // test("should get value of cslp-tooltip into current-data-cslp when tag is hovered", () => {
    //     new LivePreviewEditButton();

    //     const tooltip = document.querySelector(
    //         "[data-test-id='cs-cslp-tooltip']"
    //     );

    //     const titlePara = document.querySelector("[data-test-id='title-para']");
    //     const descPara = document.querySelector("[data-test-id='desc-para']");

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(null);

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     titlePara?.dispatchEvent(hoverEvent);

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(TITLE_CSLP_TAG);

    //     descPara?.dispatchEvent(hoverEvent);

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(DESC_CSLP_TAG);
    // });

    // test("should change the button to single when hovered again to element without href", () => {
    //     new LivePreviewEditButton();

    //     const tooltip = document.querySelector(
    //         "[data-test-id='cs-cslp-tooltip']"
    //     );

    //     const titlePara = document.querySelector("[data-test-id='title-para']");
    //     const linkPara = document.querySelector("[data-test-id='link-para']");

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     titlePara?.dispatchEvent(hoverEvent);

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(TITLE_CSLP_TAG);

    //     linkPara?.dispatchEvent(hoverEvent);

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(LINK_CSLP_TAG);

    //     titlePara?.dispatchEvent(hoverEvent);

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(TITLE_CSLP_TAG);
    // });

    // test("should stick to top when element is above the viewport", () => {
    //     new LivePreviewEditButton();

    //     const tooltip = document.querySelector(
    //         "[data-test-id='cs-cslp-tooltip']"
    //     ) as HTMLDivElement;

    //     const titlePara = document.querySelector(
    //         "[data-test-id='title-para']"
    //     ) as HTMLHeadingElement;
    //     const descPara = document.querySelector(
    //         "[data-test-id='desc-para']"
    //     ) as HTMLParagraphElement;

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     titlePara.getBoundingClientRect = jest.fn(() => ({
    //         x: 50,
    //         y: 50,
    //         width: 50,
    //         height: 50,
    //         top: 50,
    //         right: 50,
    //         bottom: 50,
    //         left: 50,
    //     })) as any;

    //     titlePara?.dispatchEvent(hoverEvent);

    //     expect(tooltip.style.top).toBe("10px");

    //     const expectedTop = -5;

    //     descPara.getBoundingClientRect = jest.fn(() => ({
    //         bottom: 16,
    //         height: 21,
    //         left: 8,
    //         right: 46.25,
    //         top: expectedTop,
    //         width: 38.25,
    //         x: 8,
    //         y: expectedTop,
    //     })) as any;

    //     descPara?.dispatchEvent(hoverEvent);

    //     expect(tooltip.style.top).toBe(`${expectedTop}px`);
    // });

    // test("should redirect to page when edit tag button is clicked", () => {
    //     Config.replace({
    //         enable: true,
    //         stackDetails: {
    //             apiKey: "sample-api-key",
    //             environment: "sample-environment",
    //         },
    //     });
    //     new LivePreviewEditButton();

    //     const singularEditButton = document.querySelector(
    //         "[data-test-id='cslp-singular-edit-button']"
    //     ) as HTMLDivElement;

    //     const titlePara = document.querySelector("[data-test-id='title-para']");
    //     const descPara = document.querySelector("[data-test-id='desc-para']");

    //     jest.spyOn(window, "open").mockImplementation(
    //         (url?: string | URL, target?: string, features?: string) => {
    //             return {} as Window;
    //         }
    //     );

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     titlePara?.dispatchEvent(hoverEvent);

    //     singularEditButton?.click();

    //     const expectedRedirectUrl =
    //         "https://app.contentstack.com/#!/stack/sample-api-key/content-type/content-type-1/en-us/entry/entry-uid-1/edit?preview-field=field-title&preview-locale=en-us&preview-environment=sample-environment";

    //     expect(window.open).toHaveBeenCalledWith(expectedRedirectUrl, "_blank");

    //     descPara?.dispatchEvent(hoverEvent);
    // });

    // test("should throw error when edit tag is used without apiKey", () => {
    //     new LivePreviewEditButton();

    //     const singularEditButton = document.querySelector(
    //         "[data-test-id='cslp-singular-edit-button']"
    //     ) as HTMLDivElement;

    //     const titlePara = document.querySelector("[data-test-id='title-para']");
    //     const descPara = document.querySelector("[data-test-id='desc-para']");

    //     const spiedConsole = jest.spyOn(PublicLogger, "error");

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     titlePara?.dispatchEvent(hoverEvent);

    //     singularEditButton?.click();

    //     const outputErrorLog = (spiedConsole.mock.calls[0] as any[])[0];
    //     const sanitizedErrorMessage =
    //         convertObjectToMinifiedString(outputErrorLog);
    //     const expectedErrorLog =
    //         "To use edit tags, you must provide the stack API key. Specify the API key while initializing the Live Preview SDK.  ContentstackLivePreview.init({  ...,  stackDetails: {  apiKey: 'your-api-key'  },  ...  })";

    //     expect(sanitizedErrorMessage).toEqual(expectedErrorLog);

    //     descPara?.dispatchEvent(hoverEvent);
    //     spiedConsole.mockReset();
    // });

    // test("should throw error when edit tag is used without environment", () => {
    //     Config.replace({
    //         enable: true,
    //         stackDetails: {
    //             apiKey: "Your-api-key",
    //         },
    //     });
    //     new LivePreviewEditButton();

    //     const singularEditButton = document.querySelector(
    //         "[data-test-id='cslp-singular-edit-button']"
    //     ) as HTMLDivElement;

    //     const titlePara = document.querySelector("[data-test-id='title-para']");
    //     const descPara = document.querySelector("[data-test-id='desc-para']");

    //     const spiedConsole = jest.spyOn(PublicLogger, "error");

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     titlePara?.dispatchEvent(hoverEvent);

    //     singularEditButton?.click();

    //     const outputErrorLog = (spiedConsole.mock.calls[0] as any[])[0];
    //     const sanitizedErrorMessage =
    //         convertObjectToMinifiedString(outputErrorLog);
    //     const expectedErrorLog =
    //         "To use edit tags, you must provide the preview environment. Specify the preview environment while initializing the Live Preview SDK.  ContentstackLivePreview.init({  ...,  stackDetails: {  environment: 'Your-environment'  },  ...  })";
    //     expect(sanitizedErrorMessage).toEqual(expectedErrorLog);

    //     descPara?.dispatchEvent(hoverEvent);
    // });

    // test("should create multiple button when hover on a link", () => {
    //     new LivePreviewEditButton();

    //     const link = document.querySelector("[data-test-id='link-para']");

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     link?.dispatchEvent(hoverEvent);

    //     const multipleEditButton = document.querySelector(
    //         "[data-test-id='cslp-multiple-edit-button']"
    //     );

    //     expect(multipleEditButton).toBeTruthy();
    // });

    // test("should have current-href when hover upon a link", () => {
    //     new LivePreviewEditButton();

    //     const link = document.querySelector("[data-test-id='link-para']");

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     link?.dispatchEvent(hoverEvent);

    //     const multipleEditButton = document.querySelector(
    //         "[data-test-id='cs-cslp-tooltip']"
    //     );

    //     expect(multipleEditButton?.getAttribute("current-href")).toBe(
    //         "https://www.example.com"
    //     );
    // });

    // test("should move class to another element when that element is hovered", () => {
    //     new LivePreviewEditButton();

    //     const titlePara = document.querySelector("[data-test-id='title-para']");
    //     const descPara = document.querySelector("[data-test-id='desc-para']");

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });
    //     expect(titlePara?.classList.contains("cslp-edit-mode")).toBeFalsy();
    //     expect(descPara?.classList.contains("cslp-edit-mode")).toBeFalsy();

    //     titlePara?.dispatchEvent(hoverEvent);

    //     expect(titlePara?.classList.contains("cslp-edit-mode")).toBeTruthy();
    //     expect(descPara?.classList.contains("cslp-edit-mode")).toBeFalsy();

    //     descPara?.dispatchEvent(hoverEvent);

    //     expect(titlePara?.classList.contains("cslp-edit-mode")).toBeFalsy();
    //     expect(descPara?.classList.contains("cslp-edit-mode")).toBeTruthy();
    // });

    // test("should redirect to link when multiple Tooltip is clicked", () => {
    //     const { location } = window;
    //     new LivePreviewEditButton();

    //     const linkPara = document.querySelector("[data-test-id='link-para']");

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     const mockAssign = jest.fn();

    //     const locationSpy = jest
    //         .spyOn(window, "location", "get")
    //         .mockImplementation(() => {
    //             const mockLocation: Location = JSON.parse(
    //                 JSON.stringify(location)
    //             );
    //             mockLocation.assign = mockAssign;
    //             return mockLocation;
    //         });

    //     linkPara?.dispatchEvent(hoverEvent);

    //     const linkButton = document.querySelector(
    //         "[data-test-id='cslp-multiple-external-link-button']"
    //     ) as HTMLDivElement;

    //     linkButton?.click();

    //     expect(mockAssign).toHaveBeenCalledWith("https://www.example.com");

    //     locationSpy.mockRestore();
    // });
    // test("should send postMessage for scroll when button is clicked inside an iframe", () => {
    //     const { location } = window;

    //     const locationSpy = jest
    //         .spyOn(window, "location", "get")
    //         .mockImplementation(() => {
    //             const mockLocation = JSON.parse(JSON.stringify(location));
    //             mockLocation.href = "https://example.com";
    //             return mockLocation;
    //         });

    //     const topLocationSpy = jest
    //         .spyOn(window, "top", "get")
    //         .mockImplementation(() => {
    //             const mockLocation = JSON.parse(JSON.stringify(location));
    //             mockLocation.href = "https://example1.com";
    //             return mockLocation;
    //         });

    //     new LivePreviewEditButton();

    //     const singularEditButton = document.querySelector(
    //         "[data-test-id='cslp-singular-edit-button']"
    //     ) as HTMLDivElement;

    //     const titlePara = document.querySelector("[data-test-id='title-para']");

    //     if (!livePreviewPostMessage) {
    //         throw new Error("livePreviewPostMessage is not defined");
    //     }
    //     const spiedPostMessage = jest.spyOn(livePreviewPostMessage, "send");

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     titlePara?.dispatchEvent(hoverEvent);

    //     singularEditButton?.click();

    //     expect(spiedPostMessage).toHaveBeenCalledWith("scroll", {
    //         field: "field-title",
    //         content_type_uid: "content-type-1",
    //         entry_uid: "entry-uid-1",
    //         locale: "en-us",
    //     });

    //     locationSpy.mockRestore();
    //     topLocationSpy.mockRestore();
    //     spiedPostMessage.mockRestore();
    // });

    // test("should disable the edit button when the editButton config is disabled", async () => {
    //     Config.replace({
    //         enable: true,
    //         editButton: {
    //             enable: false,
    //         },
    //     });
    //     new LivePreviewEditButton();

    //     const tooltip = document.querySelector(
    //         "[data-test-id='cs-cslp-tooltip']"
    //     );

    //     const titlePara = document.querySelector("[data-test-id='title-para']");
    //     const descPara = document.querySelector("[data-test-id='desc-para']");

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

    //     const hoverEvent = new CustomEvent("mouseover", {
    //         bubbles: true,
    //     });

    //     titlePara?.dispatchEvent(hoverEvent);

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);

    //     descPara?.dispatchEvent(hoverEvent);

    //     expect(tooltip?.getAttribute("current-data-cslp")).toBe(undefined);
    // });

    test("should disable the edit button even with the query parameter if includeByQueryParameter is false", async () => {
        const { location } = window;

        const locationSpy = jest
            .spyOn(window, "location", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example.com?cslp-buttons=true";
                return mockLocation;
            });

        Config.replace({
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

        LivePreviewEditButton.livePreviewEditButton =
            new LivePreviewEditButton();

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
});
