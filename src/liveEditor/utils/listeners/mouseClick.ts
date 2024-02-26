import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "./../handleIndividualFields";

import { getCsDataOfElement, getDOMEditStack } from "./../getCsDataOfElement";

import {
    addFocusOverlay,
    appendFocusedToolbar,
} from "./../focusOverlayWrapper";

import liveEditorPostMessage from "./../liveEditorPostMessage"; 

import { LiveEditorPostMessageEvents } from "./../../utils/types/postMessage.types";

import EventListenerHandlerParams from "./params";
import VisualEditorGlobalUtils from "../../globals";

export interface HandleMouseClickParams
    extends Omit<
        EventListenerHandlerParams,
        "eventDetails" | "customCursor"
    > {
    }

interface AddFocusOverlayParams
    extends Pick<
        EventListenerHandlerParams,
        "overlayWrapper" | "resizeObserver"
    > {
    editableElement: Element;
}

interface AddFocusedToolbarParams
    extends Pick<
        EventListenerHandlerParams,
        "eventDetails" | "focusedToolbar"
    > {}

function addOverlay(params: AddFocusOverlayParams) {
    console.log('[IN SDK] : addOverlay', params);
    
    if (!params.overlayWrapper || !params.editableElement) return;

    addFocusOverlay(params.editableElement, params.overlayWrapper);
    params.resizeObserver.observe(params.editableElement);
}

function addFocusedToolbar(params: AddFocusedToolbarParams) {
    const { editableElement } = params.eventDetails;

    if (!editableElement || !params.focusedToolbar) return;

    console.log(
        "[IN SDK] : CHECK TOOLBAR : ",
        VisualEditorGlobalUtils.previousSelectedEditableDOM,
        editableElement
    );

    // Don"t append again if already present
    if (
        VisualEditorGlobalUtils.previousSelectedEditableDOM &&
        VisualEditorGlobalUtils.previousSelectedEditableDOM === editableElement
    ) {
        return;
    }

    appendFocusedToolbar(params.eventDetails, params.focusedToolbar);
}

async function handleMouseClick(params: HandleMouseClickParams): Promise<void> {
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
    console.log(
        "[IN SDK] : HANDLE CLICK : ",
        VisualEditorGlobalUtils.previousSelectedEditableDOM,
        eventDetails
    );

    if (
        VisualEditorGlobalUtils.previousSelectedEditableDOM &&
        VisualEditorGlobalUtils.previousSelectedEditableDOM !== editableElement
    ) {
        cleanIndividualFieldResidual({
            overlayWrapper: params.overlayWrapper,
            visualEditorWrapper: params.visualEditorWrapper,
            focusedToolbar: params.focusedToolbar,
        });
    }

    addOverlay({
        overlayWrapper: params.overlayWrapper,
        resizeObserver: params.resizeObserver,
        editableElement: editableElement
    });

    addFocusedToolbar({
        eventDetails: eventDetails,
        focusedToolbar: params.focusedToolbar,
    });

    liveEditorPostMessage?.send(LiveEditorPostMessageEvents.FOCUS_FIELD, {
        DOMEditStack: getDOMEditStack(editableElement),
    });

    await handleIndividualFields(eventDetails, {
        visualEditorWrapper: params.visualEditorWrapper,
        lastEditedField: VisualEditorGlobalUtils.previousSelectedEditableDOM,
    });

    VisualEditorGlobalUtils.previousSelectedEditableDOM = editableElement;
    console.log(
        "[IN SDK] : HANDLE CLICK 2 : ",
        VisualEditorGlobalUtils.previousSelectedEditableDOM,
        eventDetails
    );

}

export default handleMouseClick;
