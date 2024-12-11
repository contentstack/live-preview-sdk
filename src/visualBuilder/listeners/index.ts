import EventListenerHandlerParams from "./types";
import { VisualBuilder } from "..";
import handleBuilderInteraction from "./mouseClick";
import handleMouseHover, {
    hideCustomCursor,
    hideHoverOutline,
    showCustomCursor,
} from "./mouseHover";
import { getCsDataOfElement } from "../utils/getCsDataOfElement";

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
    mousedown: (params: AddEventListenersParams) => (event: MouseEvent) => {
        // NOTE: these exit conditions are same as the one in mouse click
        // event above, if something changes there, the same must be done
        // here
        if (!params.overlayWrapper || !params.visualBuilderContainer) {
            return;
        }
        const eventDetails = getCsDataOfElement(event);
        if (!eventDetails) {
            return;
        }
        const { editableElement } = eventDetails;

        const previousSelectedElement =
            VisualBuilder.VisualBuilderGlobalState.value
                .previousSelectedEditableDOM;
        if (
            previousSelectedElement &&
            previousSelectedElement === editableElement
        ) {
            return;
        }
        // if the selected element is our empty block element, return
        if (
            editableElement.classList.contains(
                "visual-builder__empty-block-parent"
            ) ||
            editableElement.classList.contains("visual-builder__empty-block")
        ) {
            return;
        }
        // set contenteditable on button, so that it becomes editable without
        // requiring a second click after the click event completed, else
        // what happens is the button gets the focus on click and
        // another click is required to enable content editing
        if (editableElement.tagName === "BUTTON") {
            editableElement.setAttribute("contenteditable", "true");
        }
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
    const mousedownHandler = eventHandlers.mousedown(params);

    eventListenersMap.set("click", clickHandler as EventListener);
    eventListenersMap.set("mousemove", mousemoveHandler as EventListener);
    eventListenersMap.set("mouseleave", mouseleaveHandler);
    eventListenersMap.set("mouseenter", mouseenterHandler);
    eventListenersMap.set("mousedown", mousedownHandler as EventListener);

    window.addEventListener("click", clickHandler, { capture: true });
    window.addEventListener("mousemove", mousemoveHandler);
    window.addEventListener("mousedown", mousedownHandler, { capture: true });
    document.documentElement.addEventListener("mouseleave", mouseleaveHandler);
    document.documentElement.addEventListener("mouseenter", mouseenterHandler);
}

export function removeEventListeners(params: RemoveEventListenersParams): void {
    const clickHandler = eventListenersMap.get("click");
    const mousemoveHandler = eventListenersMap.get("mousemove");
    const mouseleaveHandler = eventListenersMap.get("mouseleave");
    const mouseenterHandler = eventListenersMap.get("mouseenter");
    const mousedownHandler = eventListenersMap.get("mousedown");

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
    if (mousedownHandler) {
        window.removeEventListener("mousedown", mousedownHandler);
    }

    eventListenersMap.clear();
}
