export declare type OnEntryChangeCallback = () => void;

export declare type OnEntryChangeConfig = {
    skipInitialRender?: boolean;
};

export declare type OnEntryChangeCallbackUID = string;

export type OnEntryChangeCallbackSubscribers = Record<
    OnEntryChangeCallbackUID,
    OnEntryChangeCallback
>;

export type OnEntryChangeUnsubscribeParameters =
    | OnEntryChangeCallbackUID
    | OnEntryChangeCallback;
