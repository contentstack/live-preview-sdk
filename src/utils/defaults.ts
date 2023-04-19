import { IInitData } from "./types";

export const userInitData: IInitData = {
    ssr: true,
    enable: true,
    cleanCslpOnProduction: true,
    renderCslpButtonsByDefault: true,

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
        },
        environment: "",
    },
    runScriptsOnUpdate: false,
};
