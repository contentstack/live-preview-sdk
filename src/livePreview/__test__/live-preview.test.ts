import crypto from "crypto";
import { fireEvent, waitFor } from "@testing-library/preact";
import { sleep } from "../../__test__/utils";
import { getDefaultConfig } from "../../configManager/config.default";
import Config from "../../configManager/configManager";
import { PublicLogger } from "../../logger/logger";
import { ILivePreviewWindowType } from "../../types/types";
import livePreviewPostMessage from "../eventManager/livePreviewEventManager";
import LivePreview from "../live-preview";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "../eventManager/livePreviewEventManager.constant";
import { mockLivePreviewInitEventListener } from "./mock";
import {
    HistoryLivePreviewPostMessageEventData,
    OnChangeLivePreviewPostMessageEventData,
} from "../eventManager/types/livePreviewPostMessageEvent.type";
import { addLivePreviewQueryTags } from "../../utils";

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

jest.mock("../../utils", () => ({
    addLivePreviewQueryTags: jest.fn(),
}));

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
        const actualOutput = outputErrorLog[1]["state"];

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
        await sleep(0);

        expect(window.history.forward).toHaveBeenCalled();

        // for back
        livePreviewPostMessage?.send(LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY, {
            type: "backward",
        } as HistoryLivePreviewPostMessageEventData);

        await sleep(0);
        expect(window.history.back).toHaveBeenCalled();

        // for reload
        livePreviewPostMessage?.send(LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY, {
            type: "reload",
        } as HistoryLivePreviewPostMessageEventData);

        await sleep(0);
        expect(window.history.go).toHaveBeenCalled();
    });
});

describe("testing window event listeners", () => {
    let addEventListenerMock: any;
    let sendInitEvent: any;
    let livePreviewInstance: LivePreview;

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

        addEventListenerMock = jest.spyOn(window, "addEventListener");
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.getElementsByTagName("html")[0].innerHTML = "";
    });

    afterAll(() => {
        Config.reset();
        livePreviewPostMessage?.destroy({ soft: true });
    });

    test("should attach a load event to call requestDataSync if document is not yet loaded", () => {
        Object.defineProperty(document, "readyState", {
            get() {
                return "loading";
            },
        });

        Config.replace({
            enable: true,
        });

        livePreviewInstance = new LivePreview();

        expect(addEventListenerMock).toBeCalledWith(
            "load",
            expect.any(Function)
        );
    });

    test("should handle link click event if ssr is set to true", async () => {
        Config.replace({
            enable: true,
            ssr: true,
        });

        const targetElement = document.createElement("a");
        targetElement.href = "http://localhost:3000/";

        document.body.appendChild(targetElement);

        livePreviewInstance = new LivePreview();

        expect(addEventListenerMock).toHaveBeenCalledWith(
            "click",
            expect.any(Function)
        );

        fireEvent.click(targetElement);
        expect(addLivePreviewQueryTags).toBeCalled();
    });
});