export declare interface IEditEntrySearchParams {
    hash?: string;
    entry_uid?: string;
    content_type_uid?: string;
    /**
     * @deprecated pass this value as hash instead
     */
    live_preview?: string;
}

export declare interface IClientUrlParams {
    protocol: "http" | "https";
    host: string;
    port: string | number;
    url: string;
}

export declare interface IStackSdk {
    live_preview: { [key: string]: any } & Partial<IConfig>;
    [key: string]: any;
    headers: {
        api_key: string;
    };
    environment: string;
}

export declare interface IStackDetails {
    apiKey: string;
    environment: string;
    contentTypeUid: string;
    entryUid: string;
}

export declare interface IInitStackDetails {
    apiKey: string;
    environment: string;
}
export declare interface IConfig {
    ssr: boolean;
    enable: boolean;
    cleanCslpOnProduction: boolean;
    stackDetails: IStackDetails;
    clientUrlParams: IClientUrlParams;
    stackSdk: IStackSdk;
    onChange: () => void;
    runScriptsOnUpdate: boolean;
}

export declare interface IInitData {
    ssr: boolean;
    runScriptsOnUpdate: boolean;
    enable: boolean;
    cleanCslpOnProduction: boolean;
    stackDetails: Partial<IInitStackDetails>;
    clientUrlParams: Partial<Omit<IClientUrlParams, "url">>;
    stackSdk: IStackSdk;
}

// Post message types

export declare interface ILivePreviewMessageCommon {
    from: "live-preview";
}

export type ILivePreviewReceivePostMessages =
    | IClientDataMessage
    | IInitAckMessage
    | IHistoryMessage
    | IDocWithScriptMessage;
export declare interface IClientDataMessage extends ILivePreviewMessageCommon {
    type: "client-data-send";
    data: {
        hash: string;
    };
}

export declare interface IInitAckMessage extends ILivePreviewMessageCommon {
    type: "init-ack";
    data: {
        contentTypeUid: string;
        entryUid: string;
    };
}

export declare interface IHistoryMessage extends ILivePreviewMessageCommon {
    type: "history";
    data: {
        type: "forward" | "backward" | "reload";
    };
}

export declare interface IDocWithScriptMessage
    extends ILivePreviewMessageCommon {
    type: "document-body-post-scripts-loaded";
    data: {
        body: string;
    };
}

// end of Post message types

export declare type OnEntryChangeCallback = () => void;

export declare type OnEntryChangeCallbackUID = string;
