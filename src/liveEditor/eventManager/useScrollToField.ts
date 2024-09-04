import { useEffect } from "react";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

// Define the interface for the ScrollToField event data
export interface IScrollToFieldEventData {
    cslpValue: string;
    clickNeeded?: boolean;
}

export interface IScrollToFieldEvent {
    data: IScrollToFieldEventData;
}

const handleScrollToField = (event: IScrollToFieldEvent) => {
    const { cslpValue, clickNeeded } = event.data;
    const element = document.querySelector(`[data-cslp="${cslpValue}"]`);
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};

const useScrollToField = () => {
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.SCROLL_TO_FIELD,
        handleScrollToField
    );
};

export default useScrollToField;
