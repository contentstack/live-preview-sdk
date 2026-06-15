import Config, { updateConfigFromUrl, syncToStackSdk } from "../configManager";
import { getDefaultConfig, getUserInitData } from "../config.default";
import { DeepSignal } from "deepsignal";
import { IConfig } from "../../types/types";

describe("Config", () => {
    let config: DeepSignal<IConfig>;

    beforeEach(() => {
        Config.reset();
        config = Config.get();
    });

    afterAll(() => {
        Config.reset();
    });

    test("should return default value", () => {
        const defaultConfig = getDefaultConfig();
        const receivedConfig = config;

        // @ts-expect-error
        delete defaultConfig.onChange;
        // @ts-expect-error
        delete receivedConfig.onChange;
        expect(config).toStrictEqual(defaultConfig);
    });

    test("should set and get value", () => {
        const defaultConfig = getDefaultConfig();
        let receivedConfig = config;

        // @ts-expect-error
        delete defaultConfig.onChange;
        // @ts-expect-error
        delete receivedConfig.onChange;

        expect(receivedConfig).toEqual({ ...defaultConfig, ssr: true });

        Config.set("ssr", false);
        receivedConfig = config;

        // @ts-expect-error
        delete receivedConfig.onChange;

        expect(receivedConfig).toEqual({ ...defaultConfig, ssr: false });
    });

    test("should throw error if key is invalid", () => {
        expect(() => {
            Config.set("invalidKey", false);
        }).toThrowError("Invalid key: invalidKey");
    });

    test("should replace config", () => {
        const defaultConfig = getDefaultConfig();
        let receivedConfig = config;

        // @ts-expect-error
        delete defaultConfig.onChange;
        // @ts-expect-error
        delete receivedConfig.onChange;

        expect(receivedConfig).toEqual(defaultConfig);

        Config.replace({
            ssr: false,
            mode: "builder",
            stackDetails: {
                environment: "development",
                apiKey: "api-key",
            },
        });

        receivedConfig = config;

        // @ts-expect-error
        delete receivedConfig.onChange;

        expect(receivedConfig).toEqual({
            ...defaultConfig,
            ssr: false,
            mode: 2,
            stackDetails: {
                ...defaultConfig.stackDetails,
                environment: "development",
                apiKey: "api-key",
            },
        });
    });
});

describe("config default flags", () => {
    test("enableLivePreviewOutsideIframe defaults to undefined in getDefaultConfig", () => {
        const defaultConfig = getDefaultConfig();
        expect(defaultConfig.enableLivePreviewOutsideIframe).toBeUndefined();
    });

    test("enableLivePreviewOutsideIframe defaults to undefined in getUserInitData", () => {
        const initData = getUserInitData();
        expect(initData.enableLivePreviewOutsideIframe).toBeUndefined();
    });
});

describe("syncToStackSdk", () => {
    beforeEach(() => {
        Config.reset();
    });

    afterAll(() => {
        Config.reset();
    });

    test("should set hash, stackSdkLivePreview.hash and stackSdkLivePreview.live_preview when hash is provided", () => {
        syncToStackSdk({ hash: "abc123" });

        const config = Config.get();
        expect(config.stackSdk.live_preview.hash).toBe("abc123");
        expect(config.stackSdk.live_preview.live_preview).toBe("abc123");
        expect(config.stackSdk.live_preview.content_type_uid).toBeUndefined();
        expect(config.stackSdk.live_preview.entry_uid).toBeUndefined();
    });

    test("should set content_type_uid on stackSdk when contentTypeUid is provided", () => {
        syncToStackSdk({ contentTypeUid: "blog" });

        const config = Config.get();
        expect(config.stackSdk.live_preview.content_type_uid).toBe("blog");
        expect(config.stackSdk.live_preview.hash).toBeUndefined();
        expect(config.stackSdk.live_preview.entry_uid).toBeUndefined();
    });

    test("should set entry_uid on stackSdk when entryUid is provided", () => {
        syncToStackSdk({ entryUid: "entry-42" });

        const config = Config.get();
        expect(config.stackSdk.live_preview.entry_uid).toBe("entry-42");
        expect(config.stackSdk.live_preview.hash).toBeUndefined();
        expect(config.stackSdk.live_preview.content_type_uid).toBeUndefined();
    });

    test("should set all three fields when all params are provided", () => {
        syncToStackSdk({ hash: "h1", contentTypeUid: "page", entryUid: "e1" });

        const config = Config.get();
        expect(config.stackSdk.live_preview.hash).toBe("h1");
        expect(config.stackSdk.live_preview.live_preview).toBe("h1");
        expect(config.stackSdk.live_preview.content_type_uid).toBe("page");
        expect(config.stackSdk.live_preview.entry_uid).toBe("e1");
    });

    test("should skip falsy values — null and undefined are ignored", () => {
        syncToStackSdk({ hash: null, contentTypeUid: undefined, entryUid: null });

        const config = Config.get();
        expect(config.stackSdk.live_preview.hash).toBeUndefined();
        expect(config.stackSdk.live_preview.content_type_uid).toBeUndefined();
        expect(config.stackSdk.live_preview.entry_uid).toBeUndefined();
    });

    test("should not overwrite existing stackSdk values for keys not passed", () => {
        syncToStackSdk({ hash: "first", contentTypeUid: "ct1", entryUid: "e1" });
        syncToStackSdk({ hash: "second" });

        const config = Config.get();
        expect(config.stackSdk.live_preview.hash).toBe("second");
        expect(config.stackSdk.live_preview.content_type_uid).toBe("ct1");
        expect(config.stackSdk.live_preview.entry_uid).toBe("e1");
    });
});

describe("update config from url", () => {
    let config: DeepSignal<IConfig>;

    beforeEach(() => {
        Config.reset();
        config = Config.get();
    });

    afterEach(() => {
        Object.defineProperty(window, "location", {
            writable: true,
            value: {
                search: "",
            },
        });
    });

    afterAll(() => {
        Config.reset();
    });

    test("should update config from url if available", () => {
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

        const config = Config.get();

        expect(config.stackDetails.contentTypeUid).toEqual("");
        expect(config.stackDetails.entryUid).toEqual("");
        expect(config.hash).toEqual("");

        updateConfigFromUrl();

        expect(config.stackDetails.contentTypeUid).toEqual("test");
        expect(config.stackDetails.entryUid).toEqual("test");
        expect(config.hash).toEqual("test");
    });

    test("should be default config if url params are not available", () => {
        expect(config.stackDetails.contentTypeUid).toEqual("");
        expect(config.stackDetails.entryUid).toEqual("");
        expect(config.hash).toEqual("");

        updateConfigFromUrl();

        expect(config.stackDetails.contentTypeUid).toEqual("");
        expect(config.stackDetails.entryUid).toEqual("");
        expect(config.hash).toEqual("");
    });
});
