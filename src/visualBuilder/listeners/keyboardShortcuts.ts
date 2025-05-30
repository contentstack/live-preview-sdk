import { hideOverlay } from "../generators/generateOverlay";
import EventListenerHandlerParams from "./types";

type AddKeyboardShortcutsParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails" | "customCursor" | "previousSelectedEditableDOM"
>;

// NOTE - when we add complex keyboard shortcuts, we can look into libraries
// like hotkeys, etc.
export function addKeyboardShortcuts({
    overlayWrapper,
    visualBuilderContainer,
    focusedToolbar,
    resizeObserver,
}: AddKeyboardShortcutsParams): void {
    document.addEventListener("keydown", (e: Event) => {
        const event = e as KeyboardEvent;
        // un-focusses the focussed canvas item and removes the overlay
        if (event.key === "Escape") {
            // previously, this was achieved by clicking on overlayWrapper
            hideOverlay({
                visualBuilderOverlayWrapper: overlayWrapper,
                visualBuilderContainer,
                focusedToolbar: focusedToolbar,
                resizeObserver: resizeObserver,
            });
        }
    });
}
