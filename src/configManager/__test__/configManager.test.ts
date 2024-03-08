import Config, { updateConfigFromUrl } from "../configManager";
import { getDefaultConfig } from "../config.default";

const colours = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
 
    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
        crimson: "\x1b[38m" // Scarlet
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
        gray: "\x1b[100m",
        crimson: "\x1b[48m"
    }
 };
 

describe("Config", () => {
    beforeEach(() => {
        Config.reset();
    });
    afterAll(() => {
        Config.reset();
    });

    test("should return default value", () => {
        const defaultConfig = getDefaultConfig();
        const receivedConfig = Config.get("state");

        //@ts-expect-error
        delete defaultConfig.onChange;
        delete receivedConfig.onChange;
        expect(Config.get("state")).toStrictEqual(defaultConfig);
    });

    test("should set and get value", () => {
        const defaultConfig = getDefaultConfig();
        let receivedConfig = Config.get("state");

        // @ts-expect-error
        delete defaultConfig.onChange;
        delete receivedConfig.onChange;

        expect(receivedConfig).toEqual({ ...defaultConfig, ssr: true });

        Config.set("state.ssr", false);
        receivedConfig = Config.get("state");

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
        let receivedConfig = Config.get("state");

        // @ts-expect-error
        delete defaultConfig.onChange;
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

        receivedConfig = Config.get("state");

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

        expect(Config.get("state.stackDetails.contentTypeUid")).toEqual("");
        expect(Config.get("state.stackDetails.entryUid")).toEqual("");
        expect(Config.get("state.hash")).toEqual("");

        updateConfigFromUrl();

        expect(Config.get("state.stackDetails.contentTypeUid")).toEqual("test");
        expect(Config.get("state.stackDetails.entryUid")).toEqual("test");
        expect(Config.get("state.hash")).toEqual("test");
    });

    it("should be default config if url params are not available", () => {
        expect(Config.get("state.stackDetails.contentTypeUid")).toEqual("");
        expect(Config.get("state.stackDetails.entryUid")).toEqual("");
        expect(Config.get("state.hash")).toEqual("");

        updateConfigFromUrl();

        expect(Config.get("state.stackDetails.contentTypeUid")).toEqual("");
        expect(Config.get("state.stackDetails.entryUid")).toEqual("");
        expect(Config.get("state.hash")).toEqual("");
    });
});
