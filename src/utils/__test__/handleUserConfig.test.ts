import { handleInitData, handleUserConfig } from "../handleUserConfig";
import { IConfig, IInitData } from "../types";

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
        config = {
            ssr: true,
            enable: false,
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

    test("must throw error if apiKey is missing", () => {
        expect(() => {
            handleInitData({}, config);
        }).toThrow("Please add the stack API key for live preview");
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

    test("throw error if apiKey is missing from Stack headers", () => {
        const initData = {
            live_preview: {
                enable: true,
            },
            config: {},
            headers: {
                api_key: "",
            },
            environment: "",
            cachePolicy: 1,
        };

        expect(() => {
            handleInitData(initData, config);
        }).toThrow("Please add the stack API key for live preview");
    });
});

describe("handleClientUrlParams()", () => {
    beforeEach(() => {
        config = {
            ssr: true,
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
            host: "example.com",
            protocol: "http",
        });

        const expectedOutput = {
            protocol: "http",
            host: "example.com",
            port: 80,
            url: "http://example.com:80",
        };
        expect(config.clientUrlParams).toMatchObject(expectedOutput);
    });
});
