import EventListenerHandlerParams from "./types";

import handleEditorInteraction from "./mouseClick";
import handleMouseHover from "./mouseHover";
import { VisualEditor } from "..";

type AddEventListenersParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails"
>;

type RemoveEventListenersParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails"
>;

export function addEventListeners(params: AddEventListenersParams): void {
    window.addEventListener("click", (event) => {
        handleEditorInteraction({
            event: event,
            overlayWrapper: params.overlayWrapper,
            visualEditorContainer: params.visualEditorContainer,
            previousSelectedEditableDOM:
                VisualEditor.VisualEditorGlobalState.value
                    .previousSelectedEditableDOM,
            focusedToolbar: params.focusedToolbar,
            resizeObserver: params.resizeObserver,
        });
    });

    window.addEventListener("mousemove", (event) => {
        handleMouseHover({
            event: event as MouseEvent,
            overlayWrapper: params.overlayWrapper,
            visualEditorContainer: params.visualEditorContainer,
            customCursor: params.customCursor,
        });
    });

    // window.addEventListener("keydown", (event) => {
    //     if (event.key === "Escape") {
    //         onClick(visualEditorOverlayWrapper);
    //     }
    // });
}

export function removeEventListeners(params: RemoveEventListenersParams): void {
    window.removeEventListener("click", (event) => {
        handleEditorInteraction({
            event: event,
            overlayWrapper: params.overlayWrapper,
            visualEditorContainer: params.visualEditorContainer,
            previousSelectedEditableDOM:
                VisualEditor.VisualEditorGlobalState.value
                    .previousSelectedEditableDOM,
            focusedToolbar: params.focusedToolbar,
            resizeObserver: params.resizeObserver,
        });
    });

    window.removeEventListener("mousemove", (event) => {
        handleMouseHover({
            event: event as MouseEvent,
            overlayWrapper: params.overlayWrapper,
            visualEditorContainer: params.visualEditorContainer,
            customCursor: params.customCursor,
        });
    });
}
