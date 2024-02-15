import { IConfig, IInitData, ILivePreviewWindowType } from "../types/types";

export function getUserInitData(): IInitData {
    return {
        ssr: true,
        enable: true,
        debug: false,
        cleanCslpOnProduction: true,
        editButton: {
            enable: true,
            exclude: [],
            position: "top",
            includeByQueryParameter: true,
        },

        mode: "preview",

        stackDetails: {
            apiKey: "",
            environment: "",
        },

        clientUrlParams: {
            protocol: "https",
            host: "app.contentstack.com",
            port: 443,
        },
        stackSdk: {
            live_preview: {},
            headers: {
                api_key: "",
                branch: "main",
            },
            environment: "",
        },
        runScriptsOnUpdate: false,
    };
}

export function getDefaultConfig(): IConfig {
    return {
        ssr: true,
        enable: true,
        debug: false,
        cleanCslpOnProduction: true,
        editButton: {
            enable: true,
            exclude: [],
            position: "top",
            includeByQueryParameter: true,
        },

        hash: "",
        mode: 1,
        windowType: ILivePreviewWindowType.INDEPENDENT,

        stackDetails: {
            apiKey: "",
            environment: "",
            contentTypeUid: "",
            entryUid: "",
            locale: "en-us",
            branch: "main",
            masterLocale: "en-us",
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
        runScriptsOnUpdate: false,

        onChange() {
            // this is intentional
        },

        elements: {
            highlightedElement: null,
        },
    };
}
