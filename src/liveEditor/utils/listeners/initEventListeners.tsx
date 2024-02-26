import EventListenerHandlerParams from "./params";

import handleMouseClick from "./mouseClick";
import handleMouseOver from "./mouseOver";
import handleMouseHover from "./mouseHover";
import VisualEditorGlobalUtils from "../../globals";

interface InitEventListenersParams extends Omit<EventListenerHandlerParams, "event" | "eventDetails"> {}


function initEventListeners(params: InitEventListenersParams) {
    window.addEventListener("click", (event) => {
        handleMouseClick({
            event: event,
            overlayWrapper: params.overlayWrapper,
            visualEditorWrapper: params.visualEditorWrapper,
            previousSelectedEditableDOM: VisualEditorGlobalUtils.previousSelectedEditableDOM,
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
        });
    });

    // window.addEventListener("keydown", (event) => {
    //     if (event.key === "Escape") {
    //         onClick(visualEditorOverlayWrapper);
    //     }
    // });

}

export default initEventListeners;