export interface HistoryLivePreviewPostMessageEventData {
    type: "forward" | "backward" | "reload";
}

export interface OnChangeLivePreviewPostMessageEventData {
    hash: string;
}
