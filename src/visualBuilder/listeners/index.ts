import { VisualBuilder } from "..";
import handleBuilderInteraction from "./mouseClick";
import handleMouseHover, {
    hideCustomCursor,
    hideHoverOutline,
    showCustomCursor,
} from "./mouseHover";
import EventListenerHandlerParams from "./types";

type AddEventListenersParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails"
>;

type RemoveEventListenersParams = Omit<
    EventListenerHandlerParams,
    "event" | "eventDetails"
>;
const eventHandlers = {
    click: (params: AddEventListenersParams) => (event: MouseEvent) => {
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
    mousemove: (params: AddEventListenersParams) => (event: MouseEvent) => {
        handleMouseHover({
            event: event,
            overlayWrapper: params.overlayWrapper,
            visualBuilderContainer: params.visualBuilderContainer,
            customCursor: params.customCursor,
        });
    },
    mouseleave: (params: AddEventListenersParams) => () => {
        hideCustomCursor(params.customCursor);
        hideHoverOutline(params.visualBuilderContainer);
    },
    mouseenter: (params: AddEventListenersParams) => () => {
        showCustomCursor(params.customCursor);
    },
};
const eventListenersMap = new Map<string, EventListener>();
export function addEventListeners(params: AddEventListenersParams): void {
    const clickHandler = eventHandlers.click(params);
    const mousemoveHandler = eventHandlers.mousemove(params);
    const mouseleaveHandler = eventHandlers.mouseleave(params);
    const mouseenterHandler = eventHandlers.mouseenter(params);

    eventListenersMap.set("click", clickHandler as EventListener);
    eventListenersMap.set("mousemove", mousemoveHandler as EventListener);
    eventListenersMap.set("mouseleave", mouseleaveHandler);
    eventListenersMap.set("mouseenter", mouseenterHandler);

    window.addEventListener("click", clickHandler, { capture: true });
    window.addEventListener("mousemove", mousemoveHandler);
    document.documentElement.addEventListener("mouseleave", mouseleaveHandler);
    document.documentElement.addEventListener("mouseenter", mouseenterHandler);
}

export function removeEventListeners(params: RemoveEventListenersParams): void {
    const clickHandler = eventListenersMap.get("click");
    const mousemoveHandler = eventListenersMap.get("mousemove");
    const mouseleaveHandler = eventListenersMap.get("mouseleave");
    const mouseenterHandler = eventListenersMap.get("mouseenter");

    if (clickHandler) {
        window.removeEventListener("click", clickHandler, { capture: true });
    }
    if (mousemoveHandler) {
        window.removeEventListener("mousemove", mousemoveHandler);
    }
    if (mouseleaveHandler) {
        document.documentElement.removeEventListener(
            "mouseleave",
            mouseleaveHandler
        );
    }
    if (mouseenterHandler) {
        document.documentElement.removeEventListener(
            "mouseenter",
            mouseenterHandler
        );
    }

    eventListenersMap.clear();
}
