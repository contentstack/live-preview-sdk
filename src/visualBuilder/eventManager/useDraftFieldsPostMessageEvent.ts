import { visualBuilderStyles } from "../visualBuilder.style";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { queryCslpElement } from "../utils/cslpQueryHelpers";

interface DraftFieldsEvent {
    data: {
        fields: string[];
    };
}

function removeDraftFieldClass(): void {
    const draftFieldElements = document.querySelectorAll(
        `.${visualBuilderStyles()["visual-builder__draft-field"]}`
    );
    draftFieldElements.forEach((element) => {
        element.classList.remove(
            visualBuilderStyles()["visual-builder__draft-field"]
        );
    });
}

function addDraftFieldClass(fields: string[]): void {
    fields.forEach((field: string) => {
        // Query element with both attribute and invisible metadata support
        const element = queryCslpElement(field);
        if (element) {
            element.classList.add(
                visualBuilderStyles()["visual-builder__draft-field"]
            );
        }
    });
}

export function useDraftFieldsPostMessageEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.SHOW_DRAFT_FIELDS,
        (event: DraftFieldsEvent) => {
            removeDraftFieldClass();
            addDraftFieldClass(event.data.fields);
        }
    );

    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.REMOVE_DRAFT_FIELDS,
        () => {
            removeDraftFieldClass();
        }
    );
}
