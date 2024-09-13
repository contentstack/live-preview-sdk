import {
    type IClientUrlParams,
    type IInitData,
    ILivePreviewModeConfig,
    type IStackSdk,
} from "../types/types";
import Config from "./configManager";

const handleClientUrlParams = (userConfig: Partial<IClientUrlParams>): void => {
    const config = Config.get();
    const clientUrlParams = config.clientUrlParams;

    Config.set(
        "clientUrlParams.host",
        userConfig.host ?? config.clientUrlParams.host
    );

    Config.set(
        "clientUrlParams.protocol",
        userConfig.protocol ?? clientUrlParams.protocol
    );
    Config.set("clientUrlParams.port", userConfig.port ?? clientUrlParams.port);

    if (userConfig.protocol !== undefined && userConfig.port === undefined) {
        switch (userConfig.protocol) {
            case "http": {
                Config.set("clientUrlParams.port", 80);
                break;
            }
            case "https": {
                Config.set("clientUrlParams.port", 443);
                break;
            }
        }
    }

    let host = config.clientUrlParams.host;

    // build url
    if (typeof host == "string" && host.endsWith("/")) {
        host = host.slice(0, -1);
        Config.set("clientUrlParams.host", host);
    }

    const url = `${clientUrlParams.protocol}://${config.clientUrlParams.host}:${clientUrlParams.port}`;

    Config.set("clientUrlParams.url", url);
};

// TODO: add documentation mentioning that you cannot pass stack sdk in the init data

export const handleInitData = (initData: Partial<IInitData>): void => {
    const config = Config.get();
    const stackSdk = initData.stackSdk || config.stackSdk;

    Config.set(
        "enable",
        initData.enable ?? stackSdk.live_preview?.enable ?? config.enable
    );

    Config.set(
        "ssr",
        stackSdk.live_preview?.ssr ??
            initData.ssr ??
            (typeof initData.stackSdk === "object" ? false : true) ??
            true
    );

    Config.set(
        "runScriptsOnUpdate",
        initData.runScriptsOnUpdate ??
            stackSdk.live_preview?.runScriptsOnUpdate ??
            config.runScriptsOnUpdate
    );

    Config.set("stackSdk", initData.stackSdk ?? config.stackSdk);

    Config.set(
        "cleanCslpOnProduction",
        initData.cleanCslpOnProduction ??
            stackSdk.live_preview?.cleanCslpOnProduction ??
            config.cleanCslpOnProduction
    );

    Config.set("editButton", {
        enable:
            initData.editButton?.enable ??
            stackSdk.live_preview?.editButton?.enable ??
            config.editButton.enable,
        // added extra check if exclude data passed by user is array or not
        exclude:
            Array.isArray(initData.editButton?.exclude) &&
            initData.editButton?.exclude
                ? initData.editButton?.exclude
                : Array.isArray(stackSdk.live_preview?.exclude) &&
                    stackSdk.live_preview?.exclude
                  ? stackSdk.live_preview?.exclude
                  : (config.editButton.exclude ?? []),
        position:
            initData.editButton?.position ??
            stackSdk.live_preview?.position ??
            config.editButton.position ??
            "top",

        includeByQueryParameter:
            initData.editButton?.includeByQueryParameter ??
            stackSdk.live_preview?.includeByQueryParameter ??
            config.editButton.includeByQueryParameter ??
            true,
    });

    // client URL params
    handleClientUrlParams(
        initData.clientUrlParams ??
            stackSdk.live_preview?.clientUrlParams ??
            config.clientUrlParams
    );

    if (initData.mode) {
        switch (initData.mode) {
            case "preview": {
                Config.set("mode", ILivePreviewModeConfig.PREVIEW);
                break;
            }
            case "builder": {
                Config.set("mode", ILivePreviewModeConfig.BUILDER);
                break;
            }
            default: {
                throw new TypeError(
                    "Live Preview SDK: The mode must be either 'builder' or 'preview'"
                );
            }
        }
    }

    Config.set(
        "debug",
        initData.debug ?? stackSdk.live_preview?.debug ?? config.debug
    );

    handleStackDetails(initData, stackSdk as IStackSdk);
};

function handleStackDetails(
    initData: Partial<IInitData>,
    stackSdk: Partial<IStackSdk>
): void {
    const config = Config.get();

    Config.set(
        "stackDetails.apiKey",
        initData.stackDetails?.apiKey ?? config.stackDetails.apiKey
    );

    Config.set(
        "stackDetails.environment",
        initData.stackDetails?.environment ??
            stackSdk.environment ??
            config.stackDetails.environment
    );

    Config.set(
        "stackDetails.branch",
        initData.stackDetails?.branch ??
            stackSdk.headers?.branch ??
            config.stackDetails.branch
    );

    Config.set(
        "stackDetails.locale",
        initData.stackDetails?.locale ?? config.stackDetails.locale
    );

    if (config.mode >= ILivePreviewModeConfig.BUILDER) {
        if (!config.stackDetails.environment) {
            throw Error("Live preview SDK: environment is required");
        }

        if (!config.stackDetails.apiKey) {
            throw Error("Live preview SDK: api key is required");
        }
    }
}

export const handleUserConfig = {
    clientUrlParams: handleClientUrlParams,
};
