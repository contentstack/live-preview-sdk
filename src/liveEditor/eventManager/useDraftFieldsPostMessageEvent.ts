import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

interface DraftFieldsEvent {
    data: {
        fields: string[];
    };
}

function removeDraftFieldClass(): void {
    const draftFieldElements = document.querySelectorAll('.visual-editor__draft-field');
    draftFieldElements.forEach((element) => {
        element.classList.remove('visual-editor__draft-field');
    });
}

function addDraftFieldClass(fields: string[]): void { 
    fields.forEach((field: string) => { 
        const element = document.querySelector(`[data-cslp="${field}"]`);
        if (element) {
            element.classList.add('visual-editor__draft-field');
        }
    });
}

export function useDraftFieldsPostMessageEvent(): void {
    liveEditorPostMessage?.on(LiveEditorPostMessageEvents.SHOW_DRAFT_FIELDS, (event: DraftFieldsEvent) => {
        removeDraftFieldClass();
        addDraftFieldClass(event.data.fields);
    });

    liveEditorPostMessage?.on(LiveEditorPostMessageEvents.REMOVE_DRAFT_FIELDS, () => {
        removeDraftFieldClass();
    });
}