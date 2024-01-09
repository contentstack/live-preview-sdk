import { IConfig, IInitData } from "../types/types";

export function getUserInitData(): IInitData {
    return {
        ssr: true,
        enable: true,
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
        cleanCslpOnProduction: true,
        editButton: {
            enable: true,
            exclude: [],
            position: "top",
            includeByQueryParameter: true,
        },

        hash: "",
        mode: 1,

        stackDetails: {
            apiKey: "",
            environment: "",
            contentTypeUid: "",
            entryUid: "",
            locale: "en-us",
            branch: "main",
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
    };
}
