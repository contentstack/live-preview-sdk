import { IInitData } from "./types";

export const userInitData: IInitData = {
        shouldReload: true,
        enable: true,
        cleanCslpOnProduction: true,

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
            config: {
                live_preview: {},
            },
            headers: {
                api_key: "",
            },
            environment: "",
        },

        onChange: () => {
            // this is intentional
        },
    }
