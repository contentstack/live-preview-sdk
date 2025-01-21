import {
    IInviteMetadata,
    IThreadDTO,
} from "../visualBuilder/types/collab.types";
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
    environment: string;
}

export declare interface IStackDetails {
    apiKey: string;
    environment: string;
    contentTypeUid: string;
    entryUid: string;
    branch: string;
    /**
     * This locale is currently used by the visual builder to
     * redirect to the correct locale if the no data-cslp tag
     * is present in the HTML to extract the locale.
     */
    locale: string;
    masterLocale: string;
}

export declare interface IInitStackDetails {
    apiKey: string;
    environment: string;
    branch: string;
    /**
     * This locale is currently used by the visual builder to
     * redirect to the correct locale if the no data-cslp tag
     * is present in the HTML to extract the locale.
     */
    locale: string;
}

export declare type ILivePreviewMode = "builder" | "preview";

//? We kept it as number so that we could disable only the unrequired features,
//? since the "Builder" mode will contain all the features of the "Preview" mode.
export enum ILivePreviewModeConfig {
    PREVIEW = 1,
    BUILDER = 2,
}

export enum ILivePreviewWindowType {
    PREVIEW = "preview",
    PREVIEW_SHARE = "preview-share",
    BUILDER = "builder",
    INDEPENDENT = "independent",
}

export declare interface IConfig {
    ssr: boolean;
    enable: boolean;
    /**
     * @default false
     */
    debug: boolean;
    cleanCslpOnProduction: boolean;
    stackDetails: IStackDetails;
    clientUrlParams: IClientUrlParams;
    stackSdk: IStackSdk;
    onChange: () => void;
    runScriptsOnUpdate: boolean;
    windowType: ILivePreviewWindowType;
    hash: string;
    editButton: IConfigEditButton;
    mode: ILivePreviewModeConfig;
    elements: {
        highlightedElement: HTMLElement | null;
    };
    collab: {
        enable: boolean;
        state: boolean;
        inviteMetadata: IInviteMetadata;
    };
}

export declare interface IConfigEditButton {
    enable: boolean;
    exclude?: ("insideLivePreviewPortal" | "outsideLivePreviewPortal")[];
    includeByQueryParameter?: boolean;
    position?:
        | "top"
        | "bottom"
        | "left"
        | "right"
        | "top-left"
        | "top-right"
        | "top-center"
        | "bottom-left"
        | "bottom-right"
        | "bottom-center";
}

export declare interface IInitData {
    ssr: boolean;
    runScriptsOnUpdate: boolean;
    enable: boolean;
    /**
     * @default false
     */
    debug: boolean;
    cleanCslpOnProduction: boolean;
    stackDetails: Partial<IInitStackDetails>;
    clientUrlParams: Partial<Omit<IClientUrlParams, "url">>;
    stackSdk: IStackSdk;
    editButton: IConfigEditButton;
    mode: ILivePreviewMode;
}

// type PickPartial<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

// export type IInitData =
//     | {
//           ssr?: true;
//           stackSdk?: IStackSdk;
//           runScriptsOnUpdate?: boolean;
//           enable?: boolean;
//           cleanCslpOnProduction?: boolean;
//           stackDetails?: Partial<IInitStackDetails>;
//           clientUrlParams?: Partial<Omit<IClientUrlParams, "url">>;
//           editButton?: IConfigEditButton;
//           mode?: "preview";
//       }
//     | {
//           ssr?: true;
//           stackSdk?: IStackSdk;
//           runScriptsOnUpdate?: boolean;
//           enable?: boolean;
//           cleanCslpOnProduction?: boolean;
//           stackDetails: PickPartial<IInitStackDetails, "branch">;
//           clientUrlParams: PickPartial<
//               Omit<IClientUrlParams, "url">,
//               "port" | "protocol"
//           >;
//           editButton?: IConfigEditButton;
//           mode: "builder";
//       }
//     | {
//           ssr: false;
//           runScriptsOnUpdate?: boolean;
//           enable?: boolean;
//           cleanCslpOnProduction?: boolean;
//           stackDetails?: Partial<IInitStackDetails>;
//           clientUrlParams?: Partial<Omit<IClientUrlParams, "url">>;
//           stackSdk: IStackSdk;
//           editButton?: IConfigEditButton;
//           mode?: "preview";
//       }
//     | {
//           ssr: false;
//           runScriptsOnUpdate?: boolean;
//           enable?: boolean;
//           cleanCslpOnProduction?: boolean;
//           stackDetails: PickPartial<IInitStackDetails, "branch">;
//           clientUrlParams: PickPartial<
//               Omit<IClientUrlParams, "url">,
//               "port" | "protocol"
//           >;
//           stackSdk: IStackSdk;
//           editButton?: IConfigEditButton;
//           mode: "builder";
//       };

// Post message types

export declare interface ILivePreviewMessageCommon {
    from: "live-preview";
}

export declare interface IEditButtonPosition {
    upperBoundOfTooltip: number;
    leftBoundOfTooltip: number;
}

// end of Post message types

export interface IVisualBuilderInitEvent {
    windowType: ILivePreviewWindowType;
    stackDetails: {
        masterLocale: string;
    };
    collab?: {
        enable: boolean;
        state: boolean;
        inviteMetadata: IInviteMetadata;
        payload: IThreadDTO[];
    };
}
