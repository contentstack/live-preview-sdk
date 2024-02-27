import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "../utils/handleIndividualFields";

import { getCsDataOfElement, getDOMEditStack } from "../utils/getCsDataOfElement";

import {
    appendFocusedToolbar,
} from "../generators/generateToolbar";

import { addFocusOverlay } from "../generators/generateOverlay";

import liveEditorPostMessage from "../utils/liveEditorPostMessage"; 

import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

import EventListenerHandlerParams from "./params";
import VisualEditorGlobalUtils from "../globals";

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
        !params.visualEditorContainer
    ) {
        return;
    }
    const { editableElement } = eventDetails;
    console.log(
        "[IN SDK] : HANDLE MOUSE CLICK : ",
        VisualEditorGlobalUtils.previousSelectedEditableDOM,
        editableElement, VisualEditorGlobalUtils.previousSelectedEditableDOM !== editableElement
    );

    if (
        VisualEditorGlobalUtils.previousSelectedEditableDOM &&
        VisualEditorGlobalUtils.previousSelectedEditableDOM !== editableElement
    ) {
        cleanIndividualFieldResidual({
            overlayWrapper: params.overlayWrapper,
            visualEditorContainer: params.visualEditorContainer,
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
        visualEditorContainer: params.visualEditorContainer,
        lastEditedField: VisualEditorGlobalUtils.previousSelectedEditableDOM,
    });

    VisualEditorGlobalUtils.previousSelectedEditableDOM = editableElement;
    console.log(
        "[IN SDK] : HANDLE MOUSE CLICK 2 : ",
        VisualEditorGlobalUtils.previousSelectedEditableDOM,
        editableElement, VisualEditorGlobalUtils.previousSelectedEditableDOM !== editableElement
    );
}

export default handleMouseClick;
