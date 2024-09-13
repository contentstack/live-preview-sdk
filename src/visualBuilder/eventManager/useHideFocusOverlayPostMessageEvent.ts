import { hideOverlay } from "../generators/generateOverlay";
import EventListenerHandlerParams from "../listeners/types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

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
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.HIDE_FOCUS_OVERLAY,
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
