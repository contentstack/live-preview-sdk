import { liveEditorStyles } from "../liveEditor.style";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

interface DraftFieldsEvent {
    data: {
        fields: string[];
    };
}

function removeDraftFieldClass(): void {
    const draftFieldElements = document.querySelectorAll(
        `.${liveEditorStyles()["visual-builder__draft-field"]}`
    );
    draftFieldElements.forEach((element) => {
        element.classList.remove(
            liveEditorStyles()["visual-builder__draft-field"]
        );
    });
}

function addDraftFieldClass(fields: string[]): void {
    fields.forEach((field: string) => {
        const element = document.querySelector(`[data-cslp="${field}"]`);
        if (element) {
            element.classList.add(
                liveEditorStyles()["visual-builder__draft-field"]
            );
        }
    });
}

export function useDraftFieldsPostMessageEvent(): void {
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.SHOW_DRAFT_FIELDS,
        (event: DraftFieldsEvent) => {
            removeDraftFieldClass();
            addDraftFieldClass(event.data.fields);
        }
    );

    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.REMOVE_DRAFT_FIELDS,
        () => {
            removeDraftFieldClass();
        }
    );
}
