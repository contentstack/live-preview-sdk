import { DeepSignal } from "deepsignal";
import {
    IClientUrlParams,
    IConfig,
    IInitData,
    ILivePreviewModeConfig,
    IStackSdk,
} from "../types/types";
import Config from "./configManager";

const handleClientUrlParams = (userConfig: Partial<IClientUrlParams>): void => {
    Config.set(
        "clientUrlParams.host",
        userConfig.host ?? Config.get("clientUrlParams.host")
    );

    Config.set(
        "clientUrlParams.protocol",
        userConfig.protocol ?? Config.get("clientUrlParams.protocol")
    );
    Config.set(
        "clientUrlParams.port",
        userConfig.port ?? Config.get("clientUrlParams.port")
    );

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

    // build url
    let host = Config.get("clientUrlParams.host") as unknown as string;
    let protocol = Config.get(
        "clientUrlParams.protocol"
    ) as unknown as string;
    let port = Config.get("clientUrlParams.port") as unknown as
        | string
        | number;

    if (host.endsWith("/")) {
        host = host.slice(0, -1);
        Config.set("clientUrlParams.host", host);
    }

    Config.set("clientUrlParams.url", `${protocol}://${host}:${port}`);
};

// TODO: add documentation mentioning that you cannot pass stack sdk in the init data

export const handleInitData = (initData: Partial<IInitData>): void => {
    const stackSdk: IStackSdk =
        initData.stackSdk ||
        (Config.get("stackSdk") as unknown as IStackSdk);

    Config.set(
        "enable",
        initData.enable ??
            stackSdk.live_preview?.enable ??
            Config.get("enable")
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
            Config.get("runScriptsOnUpdate")
    );
    
    Config.set(
        "stackSdk",
        initData.stackSdk ?? Config.get("stackSdk")
    );

    Config.set(
        "cleanCslpOnProduction",
        initData.cleanCslpOnProduction ??
            stackSdk.live_preview?.cleanCslpOnProduction ??
            Config.get("cleanCslpOnProduction")
    );

    Config.set("editButton", {
        enable:
            initData.editButton?.enable ??
            stackSdk.live_preview?.editButton?.enable ??
            Config.get("editButton.enable"),
        // added extra check if exclude data passed by user is array or not
        exclude:
            Array.isArray(initData.editButton?.exclude) &&
            initData.editButton?.exclude
                ? initData.editButton?.exclude
                : Array.isArray(stackSdk.live_preview?.exclude) &&
                  stackSdk.live_preview?.exclude
                ? stackSdk.live_preview?.exclude
                : Config.get("editButton.exclude") ?? [],
        position:
            initData.editButton?.position ??
            stackSdk.live_preview?.position ??
            Config.get("editButton.position") ??
            "top",

        includeByQueryParameter:
            initData.editButton?.includeByQueryParameter ??
            stackSdk.live_preview?.includeByQueryParameter ??
            Config.get("editButton.includeByQueryParameter") ??
            true,
    });

    // client URL params
    handleClientUrlParams(
        (initData.clientUrlParams as
            | Partial<Omit<IClientUrlParams, "url">>
            | undefined) ??
            (stackSdk.live_preview?.clientUrlParams as IClientUrlParams) ??
            (Config.get("clientUrlParams") as unknown as IClientUrlParams)
    );

    // Partial<Omit<IClientUrlParams, "url">>; || IClientUrlParams ||

    if (initData.mode) {
        switch (initData.mode) {
            case "preview": {
                Config.set("mode", ILivePreviewModeConfig.PREVIEW);
                break;
            }
            case "editor": {
                Config.set("mode", ILivePreviewModeConfig.EDITOR);
                break;
            }
            default: {
                throw new TypeError(
                    "Live Preview SDK: The mode must be either 'editor' or 'preview'"
                );
            }
        }
    }

    Config.set(
        "debug",
        initData.debug ??
            stackSdk.live_preview?.debug ??
            Config.get("debug")
    );

    handleStackDetails(initData, stackSdk);
};

function handleStackDetails(
    initData: Partial<IInitData>,
    stackSdk: Partial<IStackSdk>
): void {
    Config.set(
        "stackDetails.apiKey",
        initData.stackDetails?.apiKey ??
            stackSdk.headers?.api_key ??
            Config.get("stackDetails.apiKey")
    );

    Config.set(
        "stackDetails.environment",
        initData.stackDetails?.environment ??
            stackSdk.environment ??
            Config.get("stackDetails.environment")
    );

    Config.set(
        "stackDetails.branch",
        initData.stackDetails?.branch ??
            stackSdk.headers?.branch ??
            Config.get("stackDetails.branch")
    );

    Config.set(
        "stackDetails.locale",
        initData.stackDetails?.locale ?? Config.get("stackDetails.locale")
    );

    if (
        (Config.get("mode") as unknown as number) >=
        ILivePreviewModeConfig.EDITOR
    ) {
        if (!Config.get("stackDetails.environment")) {
            throw Error("Live preview SDK: environment is required");
        }

        if (!Config.get("stackDetails.apiKey")) {
            throw Error("Live preview SDK: api key is required");
        }
    }
}

export const handleUserConfig = {
    clientUrlParams: handleClientUrlParams,
};
