import Config from "../configHandler";
import { getDefaultConfig } from "../defaults";

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
