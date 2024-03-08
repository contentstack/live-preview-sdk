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
        "state.clientUrlParams.host",
        userConfig.host ?? Config.get("state.clientUrlParams.host")
    );

    Config.set(
        "state.clientUrlParams.protocol",
        userConfig.protocol ?? Config.get("state.clientUrlParams.protocol")
    );
    Config.set(
        "state.clientUrlParams.port",
        userConfig.port ?? Config.get("state.clientUrlParams.port")
    );

    if (userConfig.protocol !== undefined && userConfig.port === undefined) {
        switch (userConfig.protocol) {
            case "http": {
                Config.set("state.clientUrlParams.port", 80);
                break;
            }
            case "https": {
                Config.set("state.clientUrlParams.port", 443);
                break;
            }
        }
    }

    // build url
    let host = Config.get("state.clientUrlParams.host") as unknown as string;
    let protocol = Config.get(
        "state.clientUrlParams.protocol"
    ) as unknown as string;
    let port = Config.get("state.clientUrlParams.port") as unknown as
        | string
        | number;

    if (host.endsWith("/")) {
        host = host.slice(0, -1);
        Config.set("state.clientUrlParams.host", host);
    }

    Config.set("state.clientUrlParams.url", `${protocol}://${host}:${port}`);
};

// TODO: add documentation mentioning that you cannot pass stack sdk in the init data

export const handleInitData = (initData: Partial<IInitData>): void => {
    const stackSdk: IStackSdk =
        initData.stackSdk ||
        (Config.get("state.stackSdk") as unknown as IStackSdk);

    Config.set(
        "state.enable",
        initData.enable ??
            stackSdk.live_preview?.enable ??
            Config.get("state.enable")
    );

    Config.set(
        "state.ssr",
        stackSdk.live_preview?.ssr ??
            (typeof initData.stackSdk === "object" ? false : true) ??
            true
    );

    Config.set(
        "state.runScriptsOnUpdate",
        initData.runScriptsOnUpdate ??
            stackSdk.live_preview?.runScriptsOnUpdate ??
            Config.get("state.runScriptsOnUpdate")
    );

    Config.set(
        "state.stackSdk",
        initData.stackSdk as unknown as DeepSignal<IStackSdk>
    );

    Config.set(
        "state.cleanCslpOnProduction",
        initData.cleanCslpOnProduction ??
            stackSdk.live_preview?.cleanCslpOnProduction ??
            Config.get("state.cleanCslpOnProduction")
    );

    Config.set("state.editButton", {
        enable:
            initData.editButton?.enable ??
            stackSdk.live_preview?.editButton?.enable ??
            Config.get("state.editButton.enable"),
        // added extra check if exclude data passed by user is array or not
        exclude:
            Array.isArray(initData.editButton?.exclude) &&
            initData.editButton?.exclude
                ? initData.editButton?.exclude
                : Array.isArray(stackSdk.live_preview?.exclude) &&
                  stackSdk.live_preview?.exclude
                ? stackSdk.live_preview?.exclude
                : Config.get("state.editButton.exclude") ?? [],
        position:
            initData.editButton?.position ??
            stackSdk.live_preview?.position ??
            Config.get("state.editButton.position") ??
            "top",

        includeByQueryParameter:
            initData.editButton?.includeByQueryParameter ??
            stackSdk.live_preview?.includeByQueryParameter ??
            Config.get("state.editButton.includeByQueryParameter") ??
            true,
    });

    // client URL params
    handleClientUrlParams(
        (initData.clientUrlParams as
            | Partial<Omit<IClientUrlParams, "url">>
            | undefined) ??
            (stackSdk.live_preview?.clientUrlParams as IClientUrlParams) ??
            (Config.get("state.clientUrlParams") as unknown as IClientUrlParams)
    );

    // Partial<Omit<IClientUrlParams, "url">>; || IClientUrlParams ||

    if (initData.mode) {
        switch (initData.mode) {
            case "preview": {
                Config.set("state.mode", ILivePreviewModeConfig.PREVIEW);
                break;
            }
            case "editor": {
                Config.set("state.mode", ILivePreviewModeConfig.EDITOR);
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
        "state.debug",
        initData.debug ??
            stackSdk.live_preview?.debug ??
            Config.get("state.debug")
    );

    handleStackDetails(initData, stackSdk);
};

function handleStackDetails(
    initData: Partial<IInitData>,
    stackSdk: Partial<IStackSdk>
): void {
    Config.set(
        "state.stackDetails.apiKey",
        initData.stackDetails?.apiKey ??
            stackSdk.headers?.api_key ??
            Config.get("state.stackDetails.apiKey")
    );

    Config.set(
        "state.stackDetails.environment",
        initData.stackDetails?.environment ??
            stackSdk.environment ??
            Config.get("state.stackDetails.environment")
    );

    Config.set(
        "state.stackDetails.branch",
        initData.stackDetails?.branch ??
            stackSdk.headers?.branch ??
            Config.get("state.stackDetails.branch")
    );

    Config.set(
        "state.stackDetails.locale",
        initData.stackDetails?.locale ?? Config.get("state.stackDetails.locale")
    );

    if (
        (Config.get("state.mode") as unknown as number) >=
        ILivePreviewModeConfig.EDITOR
    ) {
        if (!Config.get("state.stackDetails.environment")) {
            throw Error("Live preview SDK: environment is required");
        }

        if (!Config.get("state.stackDetails.apiKey")) {
            throw Error("Live preview SDK: api key is required");
        }
    }
}

export const handleUserConfig = {
    clientUrlParams: handleClientUrlParams,
};
