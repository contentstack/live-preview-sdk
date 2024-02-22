
import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";

import EventListenerHandlerParams from "./params";

import handleMouseClick from "./mouseClick";
import handleMouseOver from "./mouseOver";
import handleMouseHover from "./mouseHover";

interface InitEventListenersParams extends Omit<EventListenerHandlerParams, "event" | "eventDetails"> {}


export default function initEventListeners(params: InitEventListenersParams) {
    window.addEventListener("click", (event) => {
        handleMouseClick({
            event: event,
            overlayWrapper: params.overlayWrapper,
            visualEditorWrapper: params.visualEditorWrapper,
            previousSelectedEditableDOM: params.previousSelectedEditableDOM,
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
            visualEditorWrapper: params.visualEditorWrapper,
            customCursor: params.customCursor,
            previousHoveredTargetDOM: params.previousHoveredTargetDOM

        });
    });

    // window.addEventListener("keydown", (event) => {
    //     if (event.key === "Escape") {
    //         onClick(visualEditorOverlayWrapper);
    //     }
    // });

}


