import crypto from "crypto";

import packageJson from "../../../package.json";
import { sleep } from "../../__test__/utils";
import Config from "../../configManager/configManager";
import liveEditorPostMessage from "../../liveEditor/utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../../liveEditor/utils/types/postMessage.types";
import {
    mockLiveEditorInitEventListener,
    mockLivePreviewInitEventListener,
} from "../../livePreview/__test__/mock";
import livePreviewPostMessage from "../../livePreview/eventManager/livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "../../livePreview/eventManager/livePreviewEventManager.constant";
import { PublicLogger } from "../../logger/logger";
import { IInitData } from "../../types/types";
import ContentstackLivePreview from "../contentstack-live-preview-HOC";
import { vi } from "vitest";

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe("Live Preview HOC init", () => {
    beforeEach(() => {
        Config.reset();

        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );

        liveEditorPostMessage?.on(
            LiveEditorPostMessageEvents.INIT,
            mockLiveEditorInitEventListener
        );
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        // @ts-ignore
        ContentstackLivePreview.previewConstructors = {};
        livePreviewPostMessage?.destroy({ soft: true });
        liveEditorPostMessage?.destroy({ soft: true });
        vi.clearAllMocks();
    });

    afterAll(() => {
        Config.reset();
    });

    test("should initialize only the live preview ", async () => {
        if (!livePreviewPostMessage || !liveEditorPostMessage) {
            throw new Error(
                "livePreviewPostMessage or liveEditor is unavailable"
            );
        }

        const livePreviewPostMessageSpy = vi.spyOn(
            livePreviewPostMessage,
            "send"
        );

        const liveEditorPostMessageSpy = vi.spyOn(
            liveEditorPostMessage,
            "send"
        );

        ContentstackLivePreview.init({});

        expect(livePreviewPostMessageSpy).toHaveBeenCalledTimes(1);
        expect(liveEditorPostMessageSpy).toHaveBeenCalledTimes(0);
    });

    test("should initialize both live preview and live editor when mode is editor", async () => {
        if (!livePreviewPostMessage || !liveEditorPostMessage) {
            throw new Error(
                "livePreviewPostMessage or liveEditor is unavailable"
            );
        }

        const livePreviewPostMessageSpy = vi.spyOn(
            livePreviewPostMessage,
            "send"
        );

        const liveEditorPostMessageSpy = vi.spyOn(
            liveEditorPostMessage,
            "send"
        );

        ContentstackLivePreview.init({
            mode: "editor",
            stackDetails: {
                environment: "development",
                apiKey: "livePreviewApiKey123",
            },
        });

        await sleep();
        expect(livePreviewPostMessageSpy).toHaveBeenCalledTimes(1);
        expect(liveEditorPostMessageSpy).toHaveBeenCalledTimes(1);
    });

    test("should return the existing live preview instance if it is already initialized", async () => {
        const PublicLoggerWarnSpy = vi.spyOn(PublicLogger, "warn");

        ContentstackLivePreview.init();
        ContentstackLivePreview.init();

        expect(PublicLoggerWarnSpy).toHaveBeenCalledTimes(1);
        expect(PublicLoggerWarnSpy).toHaveBeenCalledWith(
            "You have already initialized the Live Preview SDK. So, any subsequent initialization returns the existing SDK instance."
        );
    });
});

describe("Live Preview HOC config", () => {
    beforeEach(() => {
        Config.reset();

        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );

        liveEditorPostMessage?.on(
            LiveEditorPostMessageEvents.INIT,
            mockLiveEditorInitEventListener
        );
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        // @ts-ignore
        ContentstackLivePreview.previewConstructors = {};
        livePreviewPostMessage?.destroy({ soft: true });
        liveEditorPostMessage?.destroy({ soft: true });
        vi.clearAllMocks();
    });

    afterAll(() => {
        Config.reset();
    });

    test("should set user config", async () => {
        const userConfig: Partial<IInitData> = {
            enable: true,
            stackDetails: {
                apiKey: "livePreviewApiKey123",
            },
        };

        ContentstackLivePreview.init(userConfig);

        expect(Config.get().stackDetails.apiKey).toBe("livePreviewApiKey123");
    });

    test("should set the hash from the URL", async () => {
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

        ContentstackLivePreview.init();

        expect(Config.get().hash).toBe("test");
        expect(Config.get().stackDetails.contentTypeUid).toBe("test");
        expect(Config.get().stackDetails.entryUid).toBe("test");

        Object.defineProperty(window, "location", {
            writable: true,
            value: {
                search: "",
            },
        });
    });

    test.skip("should save the config when window is not available", () => {
        const originalWindow = global.window;

        // mock window deletion using define property
        Object.defineProperty(global, "window", {
            value: undefined,
        });

        expect(global.window).toBeUndefined();

        const userConfig: Partial<IInitData> = {
            enable: true,
            stackDetails: {
                apiKey: "livePreviewApiKey123",
            },
        };

        // expect(ContentstackLivePreview.userConfig).toBeNull();

        ContentstackLivePreview.init(userConfig);

        // expect(ContentstackLivePreview.userConfig).toBe(userConfig);

        // restoring the window
        Object.defineProperty(global, "window", {
            value: originalWindow,
        });
    });
});

describe("Live Preview HOC hash", () => {
    beforeEach(() => {
        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );

        liveEditorPostMessage?.on(
            LiveEditorPostMessageEvents.INIT,
            mockLiveEditorInitEventListener
        );
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        // @ts-ignore
        ContentstackLivePreview.previewConstructors = {};
        livePreviewPostMessage?.destroy({ soft: true });
        liveEditorPostMessage?.destroy({ soft: true });

        Config.reset();
        vi.clearAllMocks();
    });

    test("should return empty string if live preview is not initialized", async () => {
        expect(ContentstackLivePreview.hash).toBe("");
    });

    test("should return hash if live preview is initialized", async () => {
        ContentstackLivePreview.init({
            ssr: false,
        });
        await sleep();

        await livePreviewPostMessage?.send(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
            {
                hash: "livePreviewHash1234",
            }
        );

        expect(ContentstackLivePreview.hash).toBe("livePreviewHash1234");
    });

    test("should return hash from the URL if live preview is not initialized", async () => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("live_preview", "test");

        // mock window location
        Object.defineProperty(window, "location", {
            writable: true,
            value: {
                search: searchParams.toString(),
            },
        });

        expect(ContentstackLivePreview.hash).toBe("test");

        Object.defineProperty(window, "location", {
            writable: true,
            value: {
                search: "",
            },
        });
    });
});
describe("Live preview HOC onEntryChange", () => {
    beforeAll(() => {
        livePreviewPostMessage?.on(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            mockLivePreviewInitEventListener
        );
    });
    test("should save the callback when SDK is not yet initialized", async () => {
        const onChangeCallback1 = vi.fn();
        const onChangeCallback2 = vi.fn();
        ContentstackLivePreview.onEntryChange(onChangeCallback1, {
            skipInitialRender: true,
        });
        ContentstackLivePreview.onEntryChange(onChangeCallback2, {
            skipInitialRender: true,
        });

        ContentstackLivePreview.init({
            ssr: false,
        });
        await sleep();

        await livePreviewPostMessage?.send(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
            {
                hash: "livePreviewHash1234",
            }
        );

        expect(onChangeCallback1).toHaveBeenCalledTimes(1);
        expect(onChangeCallback2).toHaveBeenCalledTimes(1);
    });

    test("should save the callback when SDK is initialized", async () => {
        ContentstackLivePreview.init({
            ssr: false,
        });

        await sleep();

        const onChangeCallback1 = vi.fn();
        const onChangeCallback2 = vi.fn();
        ContentstackLivePreview.onEntryChange(onChangeCallback1, {
            skipInitialRender: true,
        });
        ContentstackLivePreview.onEntryChange(onChangeCallback2, {
            skipInitialRender: true,
        });

        await livePreviewPostMessage?.send(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
            {
                hash: "livePreviewHash1234",
            }
        );

        expect(onChangeCallback1).toHaveBeenCalledTimes(1);
    });

    test("should run the callback saved when SDK was uninitialized when the entry is changed", async () => {
        const onChangeCallback1 = vi.fn();
        ContentstackLivePreview.onEntryChange(onChangeCallback1);

        ContentstackLivePreview.init({
            ssr: false,
        });
        await sleep();

        expect(onChangeCallback1).toHaveBeenCalledTimes(1);
    });

    test("should honor the skipInitialRender option", async () => {
        const onChangeCallback1 = vi.fn();
        const onChangeCallback2 = vi.fn();
        ContentstackLivePreview.onEntryChange(onChangeCallback1, {
            skipInitialRender: true,
        });
        ContentstackLivePreview.onEntryChange(onChangeCallback2);

        ContentstackLivePreview.init({
            ssr: false,
        });
        await sleep();

        expect(onChangeCallback1).toHaveBeenCalledTimes(0);
        expect(onChangeCallback2).toHaveBeenCalledTimes(1);
    });
});

describe("Live preview HOC onLiveEdit", () => {
    test("should not run the callback when the live preview is not initialized", () => {
        const onLiveEditCallback = vi.fn();
        ContentstackLivePreview.onLiveEdit(onLiveEditCallback);

        expect(onLiveEditCallback).toHaveBeenCalledTimes(0);
    });
});

describe("Live Preview HOC unsubscribeOnEntryChange", () => {
    describe("unsubscribing with callback ID", () => {
        test("callback should be removed, before SDK has initialized", async () => {
            const onChangeCallbackToStay = vi.fn();
            const onChangeCallbackToBeRemoved = vi.fn();

            ContentstackLivePreview.onEntryChange(onChangeCallbackToStay);

            const callbackUidToBeRemoved =
                ContentstackLivePreview.onEntryChange(
                    onChangeCallbackToBeRemoved
                );

            ContentstackLivePreview.unsubscribeOnEntryChange(
                callbackUidToBeRemoved
            );

            ContentstackLivePreview.init({
                ssr: false,
            });
            await sleep();

            await livePreviewPostMessage?.send(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
                { hash: "livePreviewHash1234" }
            );

            expect(onChangeCallbackToBeRemoved).toHaveBeenCalledTimes(1);
            expect(onChangeCallbackToStay).toHaveBeenCalledTimes(2);
        });
        test("callback should be removed, after SDK has initialized", async () => {
            const onChangeCallbackToStay = vi.fn();
            const onChangeCallbackToBeRemoved = vi.fn();

            ContentstackLivePreview.onEntryChange(onChangeCallbackToStay);

            const callbackUidToBeRemoved =
                ContentstackLivePreview.onEntryChange(
                    onChangeCallbackToBeRemoved
                );

            ContentstackLivePreview.init({
                ssr: false,
            });

            ContentstackLivePreview.unsubscribeOnEntryChange(
                callbackUidToBeRemoved
            );

            await sleep();

            await livePreviewPostMessage?.send(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
                { hash: "livePreviewHash1234" }
            );

            expect(onChangeCallbackToBeRemoved).toHaveBeenCalledTimes(1);
            expect(onChangeCallbackToStay).toHaveBeenCalledTimes(2);
        });
        test("should warn user if callback is not present", async () => {
            const spiedConsole = vi.spyOn(PublicLogger, "warn");

            ContentstackLivePreview.unsubscribeOnEntryChange(
                "invalidCallbackId"
            );

            expect(spiedConsole).toHaveBeenCalledTimes(1);
            expect(spiedConsole).toHaveBeenCalledWith(
                "No subscriber found with the given id."
            );

            spiedConsole.mockRestore();
        });
    });

    describe("unsubscribing with callback function", () => {
        afterAll(() => {
            vi.clearAllMocks();
        });
        test("callback should be removed, before SDK has initialized", async () => {
            const onChangeCallbackToStay = vi.fn();
            const onChangeCallbackToBeRemoved = vi.fn();

            ContentstackLivePreview.onEntryChange(onChangeCallbackToStay);
            ContentstackLivePreview.onEntryChange(onChangeCallbackToBeRemoved);

            ContentstackLivePreview.unsubscribeOnEntryChange(
                onChangeCallbackToBeRemoved
            );

            ContentstackLivePreview.init({
                ssr: false,
            });
            await sleep();

            await livePreviewPostMessage?.send(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
                { hash: "livePreviewHash1234" }
            );

            expect(onChangeCallbackToBeRemoved).toHaveBeenCalledTimes(1);
            expect(onChangeCallbackToStay).toHaveBeenCalledTimes(2);
        });
        test("callback should be removed, after SDK has initialized", async () => {
            const onChangeCallbackToStay = vi.fn();
            const onChangeCallbackToBeRemoved = vi.fn();

            ContentstackLivePreview.onEntryChange(onChangeCallbackToStay);
            ContentstackLivePreview.onEntryChange(onChangeCallbackToBeRemoved);

            ContentstackLivePreview.init({
                ssr: false,
            });
            await sleep();

            ContentstackLivePreview.unsubscribeOnEntryChange(
                onChangeCallbackToBeRemoved
            );

            await livePreviewPostMessage?.send(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
                { hash: "livePreviewHash1234" }
            );

            expect(onChangeCallbackToBeRemoved).toHaveBeenCalledTimes(1);
            expect(onChangeCallbackToStay).toHaveBeenCalledTimes(2);
        });
        test("should warn user if callback is not present", async () => {
            const spiedConsole = vi.spyOn(PublicLogger, "warn");

            ContentstackLivePreview.unsubscribeOnEntryChange(vi.fn());

            expect(spiedConsole).toHaveBeenCalledTimes(1);
            expect(spiedConsole).toHaveBeenCalledWith(
                "No subscriber found with the given callback."
            );
        });
    });
});

describe("getSdkVersion", () => {
    test("should return current version", () => {
        // we put the version from the package.json file
        // to the environment variable. Hence, we will add
        // the version from the package.json file to the
        // environment variable.
        process.env.PACKAGE_VERSION = packageJson.version;

        expect(ContentstackLivePreview.getSdkVersion()).toBe(
            packageJson.version
        );
    });
});
