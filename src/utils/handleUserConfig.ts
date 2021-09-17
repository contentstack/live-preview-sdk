import { IClientUrlParams, IConfig, IStackSdk } from "./types";

const handleClientUrlParams = (
    existingConfig: IConfig,
    userConfig: Partial<IClientUrlParams>
): void => {
    existingConfig.clientUrlParams.host =
        userConfig.host ?? existingConfig.clientUrlParams.host;
    existingConfig.clientUrlParams.protocol =
        userConfig.protocol ?? existingConfig.clientUrlParams.protocol;
    existingConfig.clientUrlParams.port =
        userConfig.port ?? existingConfig.clientUrlParams.port;

    if (userConfig.protocol !== undefined && userConfig.port === undefined) {
        switch (userConfig.protocol) {
            case "http": {
                existingConfig.clientUrlParams.port = 80;
                break;
            }
            case "https": {
                existingConfig.clientUrlParams.port = 443;
                break;
            }
        }
    }

    // build url
    let host = existingConfig.clientUrlParams.host

    if (host.endsWith('/')) {
        host = host.slice(0, -1)
    }

    existingConfig.clientUrlParams.url = `${existingConfig.clientUrlParams.protocol}://${existingConfig.clientUrlParams.host}:${existingConfig.clientUrlParams.port}`
};

function isInitDataStackSdk(
    initObj: Partial<IConfig> | Partial<IStackSdk>
): initObj is IStackSdk {
    return Object.prototype.hasOwnProperty.call(initObj, "cachePolicy")
}

export const handleInitData = (
    initData: Partial<IConfig> | Partial<IStackSdk>,
    config: IConfig
): void => {
    // only have stack sdk
    if (isInitDataStackSdk(initData)) {
        const livePreviewObject = initData?.config?.live_preview || {};

        // only stack indicates that user is running it on client side application
        config.shouldReload = false;

        config.enable =
            livePreviewObject.enable ?? config.enable;

        config.cleanCslpOnProduction =
            livePreviewObject.cleanCslpOnProduction ??
            config.cleanCslpOnProduction;

        config.stackSdk = initData

        if (!Object.prototype.hasOwnProperty.call(initData, "headers"))
            throw new Error("Please add Api key to continue");

        // stack details
        if (!Object.prototype.hasOwnProperty.call(initData, "api_key"))
            throw new Error("Please add the stack API key for live preview");
        else {
            config.stackDetails.apiKey = initData.headers.api_key;
        }
        if (Object.prototype.hasOwnProperty.call(initData, "environment")) {
            config.stackDetails.environment = initData.environment;
        }

        // client URL params
        handleClientUrlParams(
            config,
            livePreviewObject.clientUrlParams ?? config.clientUrlParams
        );
    } else {
        const stackSdk: Partial<IStackSdk> =
            initData.stackSdk || config.stackSdk;

        config.enable =
            initData.enable ??
            stackSdk.config?.live_preview?.enable ??
            config.enable;

        config.shouldReload = initData.shouldReload ?? stackSdk.config?.live_preview?.shouldReload ?? false

        config.stackSdk = {
            ...config.stackSdk,
            ...stackSdk
        }

        config.cleanCslpOnProduction =
            initData.cleanCslpOnProduction ??
            stackSdk.config?.live_preview?.cleanCslpOnProduction ??
            config.cleanCslpOnProduction;

        config.stackDetails.apiKey =
            initData.stackDetails?.apiKey ??
            stackSdk.headers?.api_key ??
            config.stackDetails.apiKey;

        if (!config.stackDetails.apiKey)
            throw new Error("Please add the stack API key for live preview");

        config.stackDetails.environment =
            initData.stackDetails?.environment ??
            stackSdk.environment ??
            config.stackDetails.environment;

        // client URL params
        handleClientUrlParams(
            config,
            initData.clientUrlParams ??
                stackSdk.config?.live_preview?.clientUrlParams ??
                config.clientUrlParams
        );
    }
};

export const handleUserConfig = {
    clientUrlParams: handleClientUrlParams,
};
