/* eslint-disable @typescript-eslint/no-explicit-any */
export declare interface IEntryValue {
    [field: string]: any;
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
    onChange: (entryEditParams: IEntryValue) => void;
}

export declare interface IInitData {
    ssr: boolean;
    enable: boolean;
    cleanCslpOnProduction: boolean;
    stackDetails: Partial<IInitStackDetails>;
    clientUrlParams: Partial<Omit<IClientUrlParams, "url">>;
    stackSdk: IStackSdk;
}
