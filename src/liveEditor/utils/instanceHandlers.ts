import liveEditorPostMessage from "./../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./../utils/types/postMessage.types";
import { CslpData } from "../../cslp/types/cslp.types";

export function handleDeleteInstance(fieldMetadata: CslpData) {
    liveEditorPostMessage
        ?.send(LiveEditorPostMessageEvents.DELETE_INSTANCE, {
            data:
                fieldMetadata.fieldPathWithIndex +
                "." +
                fieldMetadata.multipleFieldMetadata.index,
            fieldMetadata: fieldMetadata,
        })
        .finally(closeOverlay);
}

export function handleMoveInstance(
    fieldMetadata: CslpData,
    direction: "previous" | "next"
) {
    //TODO: Disable first and last instance move
    liveEditorPostMessage
        ?.send(LiveEditorPostMessageEvents.MOVE_INSTANCE, {
            data:
                fieldMetadata.fieldPathWithIndex +
                "." +
                fieldMetadata.multipleFieldMetadata.index,
            direction: direction,
            fieldMetadata: fieldMetadata,
        })
        .finally(closeOverlay);
}

function closeOverlay() {
    document
        .querySelector<HTMLDivElement>(".visual-editor__overlay--top")
        ?.click();
}
