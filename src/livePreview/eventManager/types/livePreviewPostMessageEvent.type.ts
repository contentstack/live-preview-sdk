import { ILivePreviewWindowType } from "../../../types/types";

export const OnChangeLivePreviewPostMessageEventTypes = {
    HASH_CHANGE: "hash_change",
    URL_CHANGE: "url_change"
} as const;

export interface HistoryLivePreviewPostMessageEventData {
    type: "forward" | "backward" | "reload";
}

export interface OnChangeLivePreviewPostMessageEventData {
    hash: string;
    entry_uid?: string;
    content_type_uid?: string;
    url?: string;
    _metadata?: {
        event_type: typeof OnChangeLivePreviewPostMessageEventTypes[keyof typeof OnChangeLivePreviewPostMessageEventTypes];
    }
}

export interface LivePreviewInitEventResponse {
    contentTypeUid: string;
    entryUid: string;
    windowType: ILivePreviewWindowType;
}
