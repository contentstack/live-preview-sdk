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
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "../utils/multipleElementAddButton";
import { isFieldDisabled } from "../utils/isFieldDisabled";

type HandleEditorInteractionParams = Omit<
    EventListenerHandlerParams,
    "eventDetails" | "customCursor"
>;

type AddFocusOverlayParams = Pick<
    EventListenerHandlerParams,
    "overlayWrapper" | "resizeObserver"
> & { editableElement: Element; isFieldDisabled?: boolean };

type AddFocusedToolbarParams = Pick<
    EventListenerHandlerParams,
    "eventDetails" | "focusedToolbar"
>;

function addOverlay(params: AddFocusOverlayParams) {
    if (!params.overlayWrapper || !params.editableElement) return;

    addFocusOverlay(
        params.editableElement,
        params.overlayWrapper,
        params.isFieldDisabled
    );
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
            resizeObserver: params.resizeObserver,
        });
    }

    // when previous and current selected element is same, return.
    // this also avoids inserting psuedo-editable field (field data is
    // not equal to text content in DOM) when performing mouse
    // selections in the content editable
    const previousSelectedElement =
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM;
    if (
        previousSelectedElement &&
        previousSelectedElement === editableElement
    ) {
        return;
    }

    if (
        !editableElement.classList.contains(
            "visual-editor__empty-block-parent"
        ) &&
        !editableElement.classList.contains("visual-editor__empty-block")
    ) {
        addOverlay({
            overlayWrapper: params.overlayWrapper,
            resizeObserver: params.resizeObserver,
            editableElement: editableElement,
        });

        addFocusedToolbar({
            eventDetails: eventDetails,
            focusedToolbar: params.focusedToolbar,
        });

        const { content_type_uid, fieldPath } = eventDetails.fieldMetadata;

        const fieldSchema = await FieldSchemaMap.getFieldSchema(
            content_type_uid,
            fieldPath
        );

        // after field schema is available re-add disabled overlay
        const { isDisabled } = isFieldDisabled(fieldSchema, eventDetails);
        if (isDisabled) {
            addOverlay({
                overlayWrapper: params.overlayWrapper,
                resizeObserver: params.resizeObserver,
                editableElement: editableElement,
                isFieldDisabled: true,
            });
        }

        if (
            fieldSchema.data_type === "block" ||
            fieldSchema.multiple ||
            (fieldSchema.data_type === "reference" &&
                // @ts-ignore
                fieldSchema.field_metadata.ref_multiple)
        ) {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: editableElement,
                visualEditorContainer: params.visualEditorContainer,
            });
        } else {
            removeAddInstanceButtons({
                eventTarget: params.event.target,
                visualEditorContainer: params.visualEditorContainer,
                overlayWrapper: params.overlayWrapper,
            });
        }
    }

    liveEditorPostMessage?.send(LiveEditorPostMessageEvents.FOCUS_FIELD, {
        DOMEditStack: getDOMEditStack(editableElement),
    });

    await handleIndividualFields(eventDetails, {
        visualEditorContainer: params.visualEditorContainer,
        resizeObserver: params.resizeObserver,
        lastEditedField:
            VisualEditor.VisualEditorGlobalState.value
                .previousSelectedEditableDOM,
    });

    VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
        editableElement;
}

export default handleEditorInteraction;
