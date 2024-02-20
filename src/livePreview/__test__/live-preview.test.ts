import crypto from "crypto";
import {
    convertObjectToMinifiedString,
    sendPostmessageToWindow,
    sleep,
} from "../../__test__/utils";
import { getDefaultConfig } from "../../configManager/config.default";
import Config from "../../configManager/configManager";
import * as LiveEditorModule from "../../liveEditor";
import { PublicLogger } from "../../logger/logger";
import { IInitData, ILivePreviewWindowType } from "../../types/types";
import livePreviewPostMessage from "../eventManager/livePreviewEventManager";
import LivePreview from "../live-preview";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "../eventManager/livePreviewEventManager.constant";
import { mockLivePreviewInitEventListener } from "./mock";
import {
    HistoryLivePreviewPostMessageEventData,
    OnChangeLivePreviewPostMessageEventData,
} from "../eventManager/types/livePreviewPostMessageEvent.type";

jest.mock("../../liveEditor/utils/liveEditorPostMessage", () => {
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
            on: jest.fn(),
        },
    };
});

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

    test("should get value of cslp-tooltip into current-data-cslp when tag is hovered", () => {
        new LivePreview();

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
        new LivePreview();

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
        new LivePreview();

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

    test("should redirect to page when edit tag button is clicked", () => {
        Config.replace({
            enable: true,
            stackDetails: {
                apiKey: "sample-api-key",
                environment: "sample-environment",
            },
        });
        new LivePreview();

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

    test("should throw error when edit tag is used without apiKey", () => {
        new LivePreview();

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
        Config.replace({
            enable: true,
            stackDetails: {
                apiKey: "Your-api-key",
            },
        });
        new LivePreview();

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
        Config.replace({
            enable: false,
            cleanCslpOnProduction: true,
        });
        new LivePreview();

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
        Config.replace({
            enable: true,
            cleanCslpOnProduction: true,
        });
        new LivePreview();

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
        new LivePreview();

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
        new LivePreview();

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

    test("should move class to another element when that element is hovered", () => {
        new LivePreview();

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
        new LivePreview();

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

        const topLocationSpy = jest
            .spyOn(window, "top", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example1.com";
                return mockLocation;
            });

        new LivePreview();

        const singularEditButton = document.querySelector(
            "[data-test-id='cslp-singular-edit-button']"
        ) as HTMLDivElement;

        const titlePara = document.querySelector("[data-test-id='title-para']");

        if (!livePreviewPostMessage) {
            throw new Error("livePreviewPostMessage is not defined");
        }
        const spiedPostMessage = jest.spyOn(livePreviewPostMessage, "send");

        const hoverEvent = new CustomEvent("mouseover", {
            bubbles: true,
        });

        titlePara?.dispatchEvent(hoverEvent);

        singularEditButton?.click();

        expect(spiedPostMessage).toHaveBeenCalledWith("scroll", {
            field: "field-title",
            content_type_uid: "content-type-1",
            entry_uid: "entry-uid-1",
            locale: "en-us",
        });

        locationSpy.mockRestore();
        topLocationSpy.mockRestore();
        spiedPostMessage.mockRestore();
    });

    test("should disable the edit button when the editButton config is disabled", async () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: false,
            },
        });
        new LivePreview();

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
        Config.replace({
            enable: true,
            editButton: {
                enable: true,
                exclude: ["outsideLivePreviewPortal"],
            },
        });
        new LivePreview();

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

        const topLocationSpy = jest
            .spyOn(window, "top", "get")
            .mockImplementation(() => {
                const mockLocation = JSON.parse(JSON.stringify(location));
                mockLocation.href = "https://example1.com";
                return mockLocation;
            });

        Config.replace({
            enable: true,
            editButton: {
                enable: true,
                exclude: ["insideLivePreviewPortal"],
            },
        });
        new LivePreview();

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
        topLocationSpy.mockRestore();
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

        Config.replace({
            enable: true,
            editButton: {
                enable: true,
                exclude: [
                    "outsideLivePreviewPortal",
                    "insideLivePreviewPortal",
                ],
            },
        });
        new LivePreview();

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
        new LivePreview();

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

describe("debug module", () => {
    beforeEach(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );
    });

    afterAll(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
    });

    test("should display config when debug is true", () => {
        const spiedConsole = jest.spyOn(PublicLogger, "debug");
        Config.replace({
            debug: true,
        });
        new LivePreview();

        const outputErrorLog = spiedConsole.mock.calls[0];

        expect(outputErrorLog[0]).toEqual(
            "Contentstack Live Preview Debugging mode: config --"
        );

        const expectedOutput = getDefaultConfig();
        expectedOutput.debug = true;
        const actualOutput = outputErrorLog[1];

        // Not removing them causes serialization problems.
        // @ts-ignore
        delete expectedOutput.onChange;
        delete actualOutput.onChange;

        expect(actualOutput).toMatchObject(expectedOutput);
    });
});

describe("incoming postMessage", () => {
    beforeEach(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );
    });
    afterEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
    });
    test("should trigger user onChange function when client-data-send is sent for CSR app", async () => {
        const mockedStackSdk = {
            live_preview: {},
            headers: {
                api_key: "",
            },
            environment: "",
        };

        Config.replace({
            stackSdk: mockedStackSdk,
        });

        livePreviewPostMessage?.destroy({ soft: true });
        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );

        const livePreview = new LivePreview();
        await sleep();

        // set user onChange function
        const userOnChange = jest.fn();

        livePreview.subscribeToOnEntryChange(userOnChange, "mock-callback-uid");

        const onChangeData: OnChangeLivePreviewPostMessageEventData = {
            hash: "livePreviewHash1234",
        };

        await livePreviewPostMessage?.send(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
            onChangeData
        );

        expect(userOnChange).toHaveBeenCalled();
        expect(mockedStackSdk.live_preview).toMatchObject({
            hash: "livePreviewHash1234",
            content_type_uid: "contentTypeUid",
            live_preview: "livePreviewHash1234",
            entry_uid: "entryUid",
        });
    });

    test("should receive contentTypeUid and EntryUid on init", async () => {
        if (!livePreviewPostMessage) {
            throw new Error("livePreviewPostMessage is not defined");
        }

        new LivePreview();
        await sleep();

        expect(Config.get().stackDetails).toMatchObject({
            apiKey: "",
            contentTypeUid: "contentTypeUid",
            entryUid: "entryUid",
            environment: "",
        });
    });
    test("should navigate forward, backward and reload page on history call", async () => {
        new LivePreview();
        await sleep();

        jest.spyOn(window.history, "forward");
        jest.spyOn(window.history, "back");
        jest.spyOn(window.history, "go").mockImplementation(() => {});

        // for forward
        livePreviewPostMessage?.send(LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY, {
            type: "forward",
        } as HistoryLivePreviewPostMessageEventData);
        await sendPostmessageToWindow("history", {
            type: "forward",
        });

        expect(window.history.forward).toHaveBeenCalled();

        // for back
        livePreviewPostMessage?.send(LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY, {
            type: "backward",
        } as HistoryLivePreviewPostMessageEventData);
        await sendPostmessageToWindow("history", {
            type: "backward",
        });

        expect(window.history.back).toHaveBeenCalled();

        // for reload
        livePreviewPostMessage?.send(LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY, {
            type: "reload",
        } as HistoryLivePreviewPostMessageEventData);
        await sendPostmessageToWindow("history", {
            type: "reload",
        });

        expect(window.history.go).toHaveBeenCalled();
    });
});

describe("Live modes", () => {
    beforeEach(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );
        jest.clearAllMocks();
    });

    afterAll(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
    });

    test.skip("should initiate Visual editor if mode is greater than editor", () => {
        const config: Partial<IInitData> = {
            enable: true,
            stackDetails: {
                environment: "development",
                apiKey: "bltapikey",
            },
        };

        const spiedVisualEditor = jest.spyOn(LiveEditorModule, "VisualEditor");

        Config.replace(config);
        new LivePreview();
        expect(spiedVisualEditor).not.toHaveBeenCalled();

        config.mode = "editor";

        Config.replace(config);
        new LivePreview();
        expect(spiedVisualEditor).toHaveBeenCalled();
    });

    test("should not initiate Visual editor if mode is less than editor", () => {
        const config: Partial<IInitData> = {
            enable: true,
        };

        const spiedVisualEditor = jest.spyOn(LiveEditorModule, "VisualEditor");

        new LivePreview();
        expect(spiedVisualEditor).not.toHaveBeenCalled();

        config.mode = "preview";
        Config.replace(config);

        new LivePreview();
        expect(spiedVisualEditor).not.toHaveBeenCalled();
    });
});

// TODO: capetown: Add test for the following
// describe.skip("live preview hash", () => {
//     test("should be empty by default", () => {
//         const livePreview = new LivePreview();

//         expect(livePreview.hash).toBe("");
//     });

//     test("should be set when client-data-send event is fired", async () => {
//         const livePreview = new LivePreview();
//         const livePreviewHash = "livePreviewHash1234";

//         await sendPostmessageToWindow("client-data-send", {
//             hash: livePreviewHash,
//             content_type_uid: "entryContentTypeUid",
//             entry_uid: "entryUid",
//         });

//         expect(livePreview.hash).toBe(livePreviewHash);
//     });
// });

describe.only("Live preview config update", () => {
    beforeEach(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
    });

    afterAll(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
    });

    // TODO: capetown: move this file to HOC.
    test.skip("should update the config from the URL", async () => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("content_type_uid", "test");
        searchParams.set("entry_uid", "test");
        searchParams.set("live_preview", "test");

        // mock window location
        Object.defineProperty(window, "location", {
            writable: true,
            value: {
                search: searchParams.toString(),
            },
        });

        expect(Config.get().stackDetails.contentTypeUid).toEqual("");
        expect(Config.get().stackDetails.entryUid).toEqual("");
        expect(Config.get().hash).toEqual("");

        new LivePreview();
        await sleep();

        console.log("james", Config.get());

        expect(Config.get().stackDetails.contentTypeUid).toEqual(
            "contentTypeUid"
        );
        expect(Config.get().stackDetails.entryUid).toEqual("entryUid");
        expect(Config.get().hash).toEqual("test");

        Object.defineProperty(window, "location", {
            writable: true,
            value: {
                search: "",
            },
        });
    });
});
