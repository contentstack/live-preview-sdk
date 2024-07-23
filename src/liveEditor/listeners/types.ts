import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";

interface EventListenerHandlerParams {
    event: MouseEvent;
    overlayWrapper: HTMLDivElement | null;
    visualEditorContainer: HTMLDivElement | null;
    previousSelectedEditableDOM: Element | null;
    focusedToolbar: HTMLDivElement | null;
    resizeObserver: ResizeObserver;
    eventDetails: VisualEditorCslpEventDetails;
    customCursor: HTMLDivElement | null;
}

export default EventListenerHandlerParams;