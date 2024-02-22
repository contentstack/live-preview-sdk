import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "./handleIndividualFields";

import {
    getCsDataOfElement,
    getDOMEditStack,
} from "./getCsDataOfElement";

import {
    addFocusOverlay,
    appendFocusedToolbar,
} from "./focusOverlayWrapper";

import liveEditorPostMessage from "./liveEditorPostMessage";

import { LiveEditorPostMessageEvents } from "./../utils/types/postMessage.types";
import { VisualEditorCslpEventDetails } from "./../types/liveEditor.types";

interface AllParams {
    event: MouseEvent;
    overlayWrapper: HTMLDivElement | null;
    visualEditorWrapper: HTMLDivElement | null;
    previousSelectedEditableDOM: Element | null;
    focusedToolbar: HTMLDivElement | null;
    resizeObserver: ResizeObserver;
    eventDetails: VisualEditorCslpEventDetails;
}

interface InitEventListenersParams extends Omit<AllParams, "event" | "eventDetails"> {}

interface HandleMouseClickParams extends Omit<AllParams, "eventDetails"> {}

interface AddFocusOverlayParams extends Pick<AllParams, | "overlayWrapper" | "resizeObserver"> {
    editableElement : Element | null;
}

interface AddFocusedToolbarParams extends Pick<AllParams, "eventDetails" | "focusedToolbar" | "previousSelectedEditableDOM"> {}


export default function initEventListeners(params: InitEventListenersParams) {
    window.addEventListener("click", (e) => {
        handleMouseClick({
            event: e as MouseEvent,
            overlayWrapper: params.overlayWrapper,
            visualEditorWrapper: params.visualEditorWrapper,
            previousSelectedEditableDOM: params.previousSelectedEditableDOM,
            focusedToolbar: params.focusedToolbar,
            resizeObserver: params.resizeObserver
        })
    })
}

function addOverlay(params: AddFocusOverlayParams) {
    if (!params.overlayWrapper || !params.editableElement) return;

    addFocusOverlay(params.editableElement, params.overlayWrapper);
    params.resizeObserver.observe(params.editableElement);
}

function addFocusedToolbar(params: AddFocusedToolbarParams) {
    const { editableElement } = params.eventDetails;

    if (!editableElement || !params.focusedToolbar) return;

    // Don"t append again if already present
    if (
        params.previousSelectedEditableDOM &&
        params.previousSelectedEditableDOM === editableElement
    ) {
        return;
    }

    appendFocusedToolbar(params.eventDetails, params.focusedToolbar);
}


async function handleMouseClick(params: HandleMouseClickParams): Promise<void>  {
    console.log("[IN SDK] : in handleMouseClick");
    
    params.event.preventDefault();
    const eventDetails = getCsDataOfElement(params.event);
    if (
        !eventDetails ||
        !params.overlayWrapper ||
        !params.visualEditorWrapper
    ) {
        return;
    }
    const { editableElement } = eventDetails;

    if (
        params.previousSelectedEditableDOM &&
        params.previousSelectedEditableDOM !== editableElement
    ) {
        cleanIndividualFieldResidual({
            overlayWrapper: params.overlayWrapper,
            previousSelectedEditableDOM: params.previousSelectedEditableDOM,
            visualEditorWrapper: params.visualEditorWrapper,
            focusedToolbar: params.focusedToolbar,
        });
    }

    addOverlay({
        overlayWrapper: params.overlayWrapper,
        resizeObserver: params.resizeObserver,
        editableElement: editableElement,

    });

    addFocusedToolbar({
        eventDetails: eventDetails,
        focusedToolbar: params.focusedToolbar,
        previousSelectedEditableDOM: params.previousSelectedEditableDOM
    });

    liveEditorPostMessage?.send(LiveEditorPostMessageEvents.FOCUS_FIELD, {
        DOMEditStack: getDOMEditStack(editableElement),
    });

    await handleIndividualFields(eventDetails, {
        visualEditorWrapper: params.visualEditorWrapper,
        lastEditedField: params.previousSelectedEditableDOM,
    });

    params.previousSelectedEditableDOM = editableElement;
};