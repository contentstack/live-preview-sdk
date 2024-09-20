import { ILivePreviewWindowType } from "../../../types/types";

export interface HistoryLivePreviewPostMessageEventData {
    type: "forward" | "backward" | "reload";
}

export interface OnChangeLivePreviewPostMessageEventData {
    hash: string;
}

export interface OnAudienceModeVariantPatchUpdate {
    expectedCSLPValues: Record<"variant" | "base", string>;
}

export interface LivePreviewInitEventResponse {
    contentTypeUid: string;
    entryUid: string;
    windowType: ILivePreviewWindowType;
}
