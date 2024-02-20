import { ILivePreviewWindowType } from "../../types/types";
import { LivePreviewInitEventResponse } from "../eventManager/types/livePreviewPostMessageEvent.type";

export function mockLivePreviewInitEventListener(): LivePreviewInitEventResponse {
    return {
        contentTypeUid: "contentTypeUid",
        entryUid: "entryUid",
        windowType: ILivePreviewWindowType.PREVIEW,
    };
}
