import { PublicLogger } from "../public-logger";
import { handleInitData, handleUserConfig } from "../handleUserConfig";
import { IConfig, IInitData, IStackSdk } from "../types";

// example Stack object

let config: IConfig;
describe("handleInitData()", () => {
    beforeEach(() => {
        config = {
            ssr: true,
            enable: false,
            cleanCslpOnProduction: true,
            runScriptsOnUpdate: false,
            hash: "",

            editButton: {
                enable: true,
                exclude: [],
            },

            stackDetails: {
                apiKey: "",
                environment: "",
                branch: "main",
                contentTypeUid: "",
                entryUid: "",
            },

            clientUrlParams: {
                protocol: "https",
                host: "app.contentstack.com",
                port: 443,
                url: "https://app.contentstack.com:443",
            },
            stackSdk: {
                live_preview: {},
                environment: "",
            },

            onChange: () => {
                // this is intentional
            },
        };
    });

    test("must set data when config is provided", () => {
        const initData: Partial<IInitData> = {
            enable: true,
            stackDetails: {
                apiKey: "bltanything",
                environment: "",
                branch: "main",
            },
        };

        handleInitData(initData, config);
        const expectedOutput = {
            ssr: true,
            enable: true,
            cleanCslpOnProduction: true,
            stackDetails: {
                apiKey: "bltanything",
                environment: "",
                branch: "main",
                contentTypeUid: "",
                entryUid: "",
            },
            clientUrlParams: {
                protocol: "https",
                host: "app.contentstack.com",
                port: 443,
                url: "https://app.contentstack.com:443",
            },
            stackSdk: {
                environment: "",
            },
        };
        expect(config).toMatchObject(expectedOutput);
    });

    test("must set data when only Stack is provided", () => {
        const initData = {
            live_preview: {
                enable: true,
            },
            config: {},
            environment: "",
            cachePolicy: 1,
        };

        handleInitData(initData, config);
        const expectedOutput = {
            ssr: false,
            enable: true,
            cleanCslpOnProduction: true,
            stackDetails: {
                apiKey: "",
                environment: "",
                contentTypeUid: "",
                entryUid: "",
            },
            clientUrlParams: {
                protocol: "https",
                host: "app.contentstack.com",
                port: 443,
                url: "https://app.contentstack.com:443",
            },
            stackSdk: {
                live_preview: {
                    enable: true,
                },
                config: {},
                environment: "",
                cachePolicy: 1,
            },
        };
        expect(config).toMatchObject(expectedOutput);
    });

    test("must set SSR: true is stack SDK is not provided", () => {
        const initData: Partial<IInitData> = {
            enable: true,
            stackDetails: {
                apiKey: "bltanything",
                environment: "",
            },
        };

        handleInitData(initData, config);
        expect(config.ssr).toBe(true);
    });

    test("must set SSR: true is stack SDK is not provided", () => {
        const initData: Partial<IInitData> = {
            enable: true,
            stackDetails: {
                apiKey: "bltanything",
                environment: "",
            },
            stackSdk: {
                live_preview: {
                    enable: true,
                },
                environment: "",
                cachePolicy: 1,
            },
        };

        handleInitData(initData, config);
        expect(config.ssr).toBe(false);
    });

    test("should show depricated warning if stack object is passed directly", () => {
        const initData: Partial<IStackSdk> = {
            live_preview: {
                enable: true,
            },
            environment: "",
            cachePolicy: 1,
        };

        const spiedConsole = jest.spyOn(PublicLogger, "warn");

        handleInitData(initData, config);

        expect(spiedConsole).toHaveBeenCalledWith(
            "Deprecated: Do not pass the Stack object directly to the Live Preview SDK. Pass it using the config.stackSDK config object."
        );
    });
});

describe("handleClientUrlParams()", () => {
    beforeEach(() => {
        config = {
            ssr: true,
            enable: true,
            cleanCslpOnProduction: true,
            runScriptsOnUpdate: false,
            hash: "",

            editButton: {
                enable: true,
                exclude: [],
            },

            stackDetails: {
                apiKey: "",
                environment: "",
                branch: "main",
                contentTypeUid: "",
                entryUid: "",
            },

            clientUrlParams: {
                protocol: "https",
                host: "app.contentstack.com",
                port: 443,
                url: "https://app.contentstack.com:443",
            },
            stackSdk: {
                live_preview: {},
                environment: "",
            },

            onChange: () => {
                // this is intentional
            },
        };
    });

    test("must modify host and url accordingly", () => {
        handleUserConfig.clientUrlParams(config, {
            host: "example.com/",
            protocol: "http",
        });

        const expectedOutputForHttp = {
            protocol: "http",
            host: "example.com",
            port: 80,
            url: "http://example.com:80",
        };
        expect(config.clientUrlParams).toMatchObject(expectedOutputForHttp);

        handleUserConfig.clientUrlParams(config, {
            host: "example.com/",
            protocol: "https",
        });

        const expectedOutputForHttps = {
            protocol: "https",
            host: "example.com",
            port: 443,
            url: "https://example.com:443",
        };
        expect(config.clientUrlParams).toMatchObject(expectedOutputForHttps);
    });
});
