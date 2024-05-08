import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "../utils/handleIndividualFields";

import {
    getCsDataOfElement,
    getDOMEditStack,
} from "../utils/getCsDataOfElement";

import { appendFocusedToolbar } from "../generators/generateToolbar";

import { addFocusOverlay } from "../generators/generateOverlay";

import liveEditorPostMessage from "../utils/liveEditorPostMessage";

import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

import EventListenerHandlerParams from "./types";
import { VisualEditor } from "..";

type HandleEditorInteractionParams = Omit<
    EventListenerHandlerParams,
    "eventDetails" | "customCursor"
>;

type AddFocusOverlayParams = Pick<
    EventListenerHandlerParams,
    "overlayWrapper" | "resizeObserver"
> & { editableElement: Element };

type AddFocusedToolbarParams = Pick<
    EventListenerHandlerParams,
    "eventDetails" | "focusedToolbar"
>;

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
        VisualEditor.VisualEditorGlobalState.value
            .previousSelectedEditableDOM &&
        VisualEditor.VisualEditorGlobalState.value
            .previousSelectedEditableDOM === editableElement
    ) {
        return;
    }

    appendFocusedToolbar(params.eventDetails, params.focusedToolbar);
}

async function handleEditorInteraction(
    params: HandleEditorInteractionParams
): Promise<void> {
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

    if (
        VisualEditor.VisualEditorGlobalState.value
            .previousSelectedEditableDOM &&
        VisualEditor.VisualEditorGlobalState.value
            .previousSelectedEditableDOM !== editableElement
    ) {
        cleanIndividualFieldResidual({
            overlayWrapper: params.overlayWrapper,
            visualEditorContainer: params.visualEditorContainer,
            focusedToolbar: params.focusedToolbar,
        });
    }

    if(!editableElement.classList.contains('visual-editor__empty-block-parent') 
        && !editableElement.classList.contains('visual-editor__empty-block')){
        addOverlay({
            overlayWrapper: params.overlayWrapper,
            resizeObserver: params.resizeObserver,
            editableElement: editableElement,
        });
    
        addFocusedToolbar({
            eventDetails: eventDetails,
            focusedToolbar: params.focusedToolbar,
        });
    }
    
    liveEditorPostMessage?.send(LiveEditorPostMessageEvents.FOCUS_FIELD, {
        DOMEditStack: getDOMEditStack(editableElement),
    });

    await handleIndividualFields(eventDetails, {
        visualEditorContainer: params.visualEditorContainer,
        lastEditedField:
            VisualEditor.VisualEditorGlobalState.value
                .previousSelectedEditableDOM,
    });

    VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
        editableElement;
}

export default handleEditorInteraction;
