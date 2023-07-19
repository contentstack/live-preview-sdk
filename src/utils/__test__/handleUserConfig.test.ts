import { PublicLogger } from "../public-logger";
import { handleInitData, handleUserConfig } from "../handleUserConfig";
import {
    IConfig,
    IInitData,
    IStackSdk,
    ILivePreviewMode,
    ILivePreviewModeConfig,
} from "../types";
import { getDefaultConfig } from "../defaults";

// example Stack object

/*
{
  "fetchOptions": {
    "retryLimit": 5
  },
  "config": {
    "protocol": "https",
    "host": "cdn.contentstack.io",
    "port": 443,
    "version": "v3",
    "urls": {
      "sync": "/stacks/sync",
      "content_types": "/content_types/",
      "entries": "/entries/",
      "assets": "/assets/",
      "environments": "/environments/"
    }
  },
  "cachePolicy": -1,
  "provider": {},
  "headers": {
    "api_key": "blt8pfsahuae8dsdfji",
    "access_token": "cstv7889p4tgy7h45bgvAA"
  },
  "environment": "preview",
  "live_preview": {
    "enable": true,
    "management_token": "csa73f9wndsnfjdnybaevke9r38"
  }
}
*/

let config: IConfig;
describe("handleInitData()", () => {
    beforeEach(() => {
        config = getDefaultConfig();
    });

    test("must set data when config is provided", () => {
        const initData: Partial<IInitData> = {
            enable: true,
            stackDetails: {
                apiKey: "bltanything",
                environment: "",
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
                headers: {
                    api_key: "",
                },
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
            headers: {
                api_key: "bltanything",
            },
            environment: "",
            cachePolicy: 1,
        };

        handleInitData(initData, config);
        const expectedOutput = {
            ssr: false,
            enable: true,
            cleanCslpOnProduction: true,
            stackDetails: {
                apiKey: "bltanything",
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
                headers: {
                    api_key: "bltanything",
                },
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
                headers: {
                    api_key: "bltanything",
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
            headers: {
                api_key: "bltanything",
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

    describe("live mode", () => {
        test("should be set to 1 by default", () => {
            const initData: Partial<IInitData> = {
                enable: true,
            };

            handleInitData(initData, config);
            expect(config.mode).toBe(ILivePreviewModeConfig.PREVIEW);
        });
        test("should be set to 2 if user set it to editor", () => {
            const initData: Partial<IInitData> = {
                enable: true,
                mode: "editor",
            };

            handleInitData(initData, config);
            expect(config.mode).toBe(ILivePreviewModeConfig.EDITOR);
        });
        test("should be set to 1 if user set it to preview", () => {
            const initData: Partial<IInitData> = {
                enable: true,
                mode: "preview",
            };

            handleInitData(initData, config);
            expect(config.mode).toBe(ILivePreviewModeConfig.PREVIEW);
        });
        test("should throw an error if user set it to something else", () => {
            const initData: Partial<IInitData> = {
                enable: true,
                // @ts-ignore
                mode: "wrong-value",
            };

            expect(() => {
                handleInitData(initData, config);
            }).toThrowError(
                "Live Preview SDK: The mode must be either 'editor' or 'preview'"
            );
        });
    });
});

describe("handleClientUrlParams()", () => {
    beforeEach(() => {
        config = {
            ssr: true,
            enable: true,
            cleanCslpOnProduction: true,
            runScriptsOnUpdate: false,
            mode: 1,
            editButton: {
                enable: true,
                exclude: [],
            },

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
                live_preview: {},
                headers: {
                    api_key: "",
                },
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
