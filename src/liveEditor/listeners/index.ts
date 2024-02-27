import EventListenerHandlerParams from "./params";

import handleMouseClick from "./mouseClick";
import handleMouseOver from "./mouseOver";
import handleMouseHover from "./mouseHover";
import VisualEditorGlobalState from "../globals";

interface addEventListenersParams extends Omit<EventListenerHandlerParams, "event" | "eventDetails"> {}

interface RemoveEventListenersParams extends Omit<EventListenerHandlerParams, "event" | "eventDetails"> {}

export function addEventListeners(params: addEventListenersParams) {
    window.addEventListener("click", (event) => {
        handleMouseClick({
            event: event,
            overlayWrapper: params.overlayWrapper,
            visualEditorContainer: params.visualEditorContainer,
            previousSelectedEditableDOM: VisualEditorGlobalState.value.previousSelectedEditableDOM,
            focusedToolbar: params.focusedToolbar,
            resizeObserver: params.resizeObserver
        })
    });

    window.addEventListener("mouseover", (event) => {
        handleMouseOver(event);
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

export function removeEventListeners(params: RemoveEventListenersParams) {
    window.removeEventListener("click", (event) => {
        handleMouseClick({ 
            event: event,
            overlayWrapper: params.overlayWrapper,
            visualEditorContainer: params.visualEditorContainer,
            previousSelectedEditableDOM: VisualEditorGlobalState.value.previousSelectedEditableDOM,
            focusedToolbar: params.focusedToolbar,
            resizeObserver: params.resizeObserver
        })
    });

    window.removeEventListener("mouseover", (event) => {
        handleMouseOver(event);
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
