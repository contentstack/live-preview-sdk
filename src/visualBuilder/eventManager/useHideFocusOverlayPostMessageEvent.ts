import { hideOverlay } from "../generators/generateOverlay";
import EventListenerHandlerParams from "../listeners/types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import Config from "../../configManager/configManager";

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
        (args: { data: { noTrigger: boolean; fromCollab: boolean } }) => {
            if (Boolean(args?.data?.fromCollab)) {
                Config.set("collab.enable", true);
                Config.set("collab.pauseFeedback", true);
            }

            hideOverlay({
                visualBuilderOverlayWrapper: overlayWrapper,
                visualBuilderContainer,
                focusedToolbar,
                resizeObserver,
                noTrigger: Boolean(args?.data?.noTrigger),
            });
        }
    );
}
