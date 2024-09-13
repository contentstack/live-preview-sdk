import { hideOverlay } from "../generators/generateOverlay";
import EventListenerHandlerParams from "../listeners/types";
import liveEditorPostMessage from "../utils/visualBuilderPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

type HideFocusOverlayEventHandlerParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails" | "customCursor" | "previousSelectedEditableDOM"
>;

export function useHideFocusOverlayPostMessageEvent({
    visualEditorContainer,
    overlayWrapper,
    focusedToolbar,
    resizeObserver,
}: HideFocusOverlayEventHandlerParams): void {
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.HIDE_FOCUS_OVERLAY,
        () => {
            hideOverlay({
                visualEditorOverlayWrapper: overlayWrapper,
                visualEditorContainer,
                focusedToolbar,
                resizeObserver,
            });
        }
    );
}
