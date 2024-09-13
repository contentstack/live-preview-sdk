import {
    ILivePreviewWindowType,
    type IVisualEditorInitEvent,
} from "../../types/types";
import { LivePreviewInitEventResponse } from "../eventManager/types/livePreviewPostMessageEvent.type";

export function mockLivePreviewInitEventListener(): LivePreviewInitEventResponse {
    return {
        contentTypeUid: "contentTypeUid",
        entryUid: "entryUid",
        windowType: ILivePreviewWindowType.PREVIEW,
    };
}

export function mockVisualBuilderInitEventListener(): IVisualEditorInitEvent {
    return {
        stackDetails: {
            masterLocale: "en-us",
        },
        windowType: ILivePreviewWindowType.EDITOR,
    };
}
