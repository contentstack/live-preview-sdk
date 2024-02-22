import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "./../handleIndividualFields";

import {
    getCsDataOfElement,
    getDOMEditStack,
} from "./../getCsDataOfElement";

import {
    addFocusOverlay,
    appendFocusedToolbar,
} from "./../focusOverlayWrapper";

import { addCslpOutline } from "./../../../cslp/cslpdata";

import liveEditorPostMessage from "./../liveEditorPostMessage";

import { LiveEditorPostMessageEvents } from "./../../utils/types/postMessage.types";

import EventListenerHandlerParams from "./params";

export interface HandleMouseClickParams extends Omit<EventListenerHandlerParams, "eventDetails" | "customCursor" | "previousHoveredTargetDOM"> {}


interface AddFocusOverlayParams extends Pick<EventListenerHandlerParams, | "overlayWrapper" | "resizeObserver"> {
    editableElement : Element | null;
}

interface AddFocusedToolbarParams extends Pick<EventListenerHandlerParams, "eventDetails" | "focusedToolbar" | "previousSelectedEditableDOM"> {}


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

export default handleMouseClick;