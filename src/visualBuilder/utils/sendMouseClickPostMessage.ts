import type { CslpData } from "../../cslp/types/cslp.types";
import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";
import visualBuilderPostMessage from "./visualBuilderPostMessage";

interface MouseClickDetails {
    cslpData?: string | null;
    fieldMetadata?: CslpData;
}

/** Tells the host about a canvas click. No details means a deselect (empty-space click or Escape). */
export function sendMouseClickPostMessage(details?: MouseClickDetails): void {
    visualBuilderPostMessage
        ?.send(VisualBuilderPostMessageEvents.MOUSE_CLICK, {
            cslpData: details?.cslpData,
            fieldMetadata: details?.fieldMetadata,
        })
        .catch((err) => {
            console.warn("Error while sending post message", err);
        });
}
