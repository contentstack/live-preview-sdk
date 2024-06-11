import { VisualEditor } from "..";
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
    visualEditorContainer,
    focusedToolbar,
    resizeObserver,
}: AddKeyboardShortcutsParams): void {
    document.addEventListener("keydown", (e: Event) => {
        const event = e as KeyboardEvent;
        // un-focusses the focussed canvas item and removes the overlay
        if (event.key === "Escape") {
            hideOverlay({
                visualEditorOverlayWrapper: overlayWrapper,
                visualEditorContainer,
                focusedToolbar: focusedToolbar,
                resizeObserver: resizeObserver,
            });
            while (VisualEditor.VisualEditorUnfocusFieldCleanups.length > 0) {
                const cleanup =
                    VisualEditor.VisualEditorUnfocusFieldCleanups.pop();
                cleanup && cleanup();
            }
        }
    });
}
