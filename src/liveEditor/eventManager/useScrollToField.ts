import { useEffect } from "react";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

// Define the interface for the ScrollToField event data
export interface IScrollToFieldEventData {
    cslpData: {
        content_type_uid: string;
        entry_uid: string;
        locale: string;
        cslpValue: string;
      };
      absolutePath: string;
}

export interface IScrollToFieldEvent {
    data: IScrollToFieldEventData;
}

const handleScrollToField = (event: IScrollToFieldEvent) => {
    const { cslpData } = event.data;
    const element = document.querySelector(`[data-cslp="${cslpData.cslpValue}"]`);
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};

export const useScrollToField = () => {
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.SCROLL_TO_FIELD,
        handleScrollToField
    );
};
