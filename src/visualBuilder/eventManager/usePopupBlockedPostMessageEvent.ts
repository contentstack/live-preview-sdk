import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { popupBlockedModalManager } from "../components/PopupBlockedModalManager";

/**
 * Registers a post message event listener for popup blocked events.
 * Displays a modal when a popup is blocked by the browser.
 */
export function usePopupBlockedPostMessageEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.POPUP_BLOCKED,
        () => {
            popupBlockedModalManager.show();
        }
    );
}
