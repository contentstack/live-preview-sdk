import { useEffect } from "preact/compat";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

// Define the interface for the ScrollToField event data
export interface IScrollToFieldEventData {
    cslpData: {
        content_type_uid: string;
        entry_uid: string;
        locale: string;
        path: string;
    };
}

export interface IScrollToFieldEvent {
    data: IScrollToFieldEventData;
}

const handleScrollToField = (event: IScrollToFieldEvent) => {
    const { content_type_uid, entry_uid, locale, path } = event.data.cslpData;

    const cslpValue = `${content_type_uid}.${entry_uid}.${locale}.${path}`;

    // Query the element using the generated cslpValue
    const element = document.querySelector(`[data-cslp="${cslpValue}"]`);

    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};

export const useScrollToField = () => {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.SCROLL_TO_FIELD,
        handleScrollToField
    );
};
