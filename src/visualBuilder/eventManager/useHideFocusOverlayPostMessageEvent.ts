import { hideOverlay } from "../generators/generateOverlay";
import EventListenerHandlerParams from "../listeners/types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

type HideFocusOverlayEventHandlerParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails" | "customCursor" | "previousSelectedEditableDOM"
>;

export function useHideFocusOverlayPostMessageEvent({
    visualBuilderContainer,
    overlayWrapper,
    focusedToolbar,
    resizeObserver,
}: HideFocusOverlayEventHandlerParams): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.HIDE_FOCUS_OVERLAY,
        () => {
            hideOverlay({
                visualBuilderOverlayWrapper: overlayWrapper,
                visualBuilderContainer,
                focusedToolbar,
                resizeObserver,
            });
        }
    );
}
