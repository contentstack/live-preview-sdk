import Config, { updateConfigFromUrl } from "../configManager";
import { getDefaultConfig } from "../config.default";

describe("Config", () => {
    beforeEach(() => {
        Config.reset();
    });
    afterAll(() => {
        Config.reset();
    });

    test("should return default value", () => {
        const defaultConfig = getDefaultConfig();
        const receivedConfig = Config.get();

        //@ts-expect-error
        delete defaultConfig.onChange;
        //@ts-expect-error
        delete receivedConfig.onChange;
        expect(Config.get()).toStrictEqual(defaultConfig);
    });

    test("should set and get value", () => {
        const defaultConfig = getDefaultConfig();
        let receivedConfig = Config.get();

        // @ts-expect-error
        delete defaultConfig.onChange;
        // @ts-expect-error
        delete receivedConfig.onChange;

        expect(receivedConfig).toEqual({ ...defaultConfig, ssr: true });

        Config.set("ssr", false);
        receivedConfig = Config.get();

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
        let receivedConfig = Config.get();

        // @ts-expect-error
        delete defaultConfig.onChange;
        // @ts-expect-error
        delete receivedConfig.onChange;

        expect(receivedConfig).toEqual(defaultConfig);

        Config.replace({
            ssr: false,
            mode: "editor",
            stackDetails: {
                environment: "development",
                apiKey: "api-key",
            },
        });

        receivedConfig = Config.get();

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

describe("update config from url", () => {
    beforeEach(() => {
        Config.reset();
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

    it("should update config from url if available", () => {
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

        updateConfigFromUrl();

        expect(Config.get().stackDetails.contentTypeUid).toEqual("test");
        expect(Config.get().stackDetails.entryUid).toEqual("test");
        expect(Config.get().hash).toEqual("test");
    });

    it("should be default config if url params are not available", () => {
        expect(Config.get().stackDetails.contentTypeUid).toEqual("");
        expect(Config.get().stackDetails.entryUid).toEqual("");
        expect(Config.get().hash).toEqual("");

        updateConfigFromUrl();

        expect(Config.get().stackDetails.contentTypeUid).toEqual("");
        expect(Config.get().stackDetails.entryUid).toEqual("");
        expect(Config.get().hash).toEqual("");
    });
});
