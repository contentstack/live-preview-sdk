import EventListenerHandlerParams from "./types";
import { VisualBuilder } from "..";
import handleBuilderInteraction from "./mouseClick";
import handleMouseHover, {
    hideCustomCursor,
    hideHoverOutline,
    showCustomCursor,
} from "./mouseHover";

type AddEventListenersParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails"
>;

type RemoveEventListenersParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails"
>;

export function addEventListeners(params: AddEventListenersParams): void {
    // capture any click event during the capture phase
    window.addEventListener(
        "click",
        (event) => {
            handleBuilderInteraction({
                event: event,
                overlayWrapper: params.overlayWrapper,
                visualBuilderContainer: params.visualBuilderContainer,
                previousSelectedEditableDOM:
                    VisualBuilder.VisualBuilderGlobalState.value
                        .previousSelectedEditableDOM,
                focusedToolbar: params.focusedToolbar,
                resizeObserver: params.resizeObserver,
            });
        },
        { capture: true }
    );

    window.addEventListener("mousemove", (event) => {
        handleMouseHover({
            event: event as MouseEvent,
            overlayWrapper: params.overlayWrapper,
            visualBuilderContainer: params.visualBuilderContainer,
            customCursor: params.customCursor,
        });
    });

    document.documentElement.addEventListener("mouseleave", () => {
        hideCustomCursor(params.customCursor);
        hideHoverOutline(params.visualBuilderContainer);
    });

    document.documentElement.addEventListener("mouseenter", () => {
        showCustomCursor(params.customCursor);
    });
}

export function removeEventListeners(params: RemoveEventListenersParams): void {
    window.removeEventListener("click", (event) => {
        handleBuilderInteraction({
            event: event,
            overlayWrapper: params.overlayWrapper,
            visualBuilderContainer: params.visualBuilderContainer,
            previousSelectedEditableDOM:
                VisualBuilder.VisualBuilderGlobalState.value
                    .previousSelectedEditableDOM,
            focusedToolbar: params.focusedToolbar,
            resizeObserver: params.resizeObserver,
        });
    });

    window.removeEventListener("mousemove", (event) => {
        handleMouseHover({
            event: event as MouseEvent,
            overlayWrapper: params.overlayWrapper,
            visualBuilderContainer: params.visualBuilderContainer,
            customCursor: params.customCursor,
        });
    });
}
