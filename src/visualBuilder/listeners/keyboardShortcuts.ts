import { VisualBuilder } from "..";
import { hideOverlay } from "../generators/generateOverlay";
import { sendMouseClickPostMessage } from "../utils/sendMouseClickPostMessage";
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
        // An Escape that ends an IME composition is not a request to leave the field.
        // Safari reports that Escape with keyCode 229 and isComposing false.
        if (
            event.key !== "Escape" ||
            event.isComposing ||
            event.keyCode === 229
        )
            return;
        const hadFocusedField = Boolean(
            VisualBuilder.VisualBuilderGlobalState.value
                .previousSelectedEditableDOM
        );
        hideOverlay({
            visualBuilderOverlayWrapper: overlayWrapper,
            visualBuilderContainer,
            focusedToolbar: focusedToolbar,
            resizeObserver: resizeObserver,
        });
        // Same as an empty-space click: the host releases the field lock on it.
        if (hadFocusedField) sendMouseClickPostMessage();
    });
}
