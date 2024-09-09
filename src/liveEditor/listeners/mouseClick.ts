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
import { isFieldDisabled } from "../utils/isFieldDisabled";
import { liveEditorStyles } from "../liveEditor.style";

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

export function addFocusedToolbar(params: AddFocusedToolbarParams): void {
    const { editableElement } = params.eventDetails;

    if (!editableElement || !params.focusedToolbar) return;

    appendFocusedToolbar(params.eventDetails, params.focusedToolbar);
}

async function handleEditorInteraction(
    params: HandleEditorInteractionParams
): Promise<void> {
    const eventTarget = params.event.target as HTMLElement | null;
    const isAnchorElement = eventTarget instanceof HTMLAnchorElement;
    const elementHasCslp =
        eventTarget &&
        (eventTarget.hasAttribute("data-cslp") ||
            eventTarget.closest("[data-cslp]"));

    // prevent default behavior for anchor elements and elements with cslp attribute
    if (
        isAnchorElement ||
        (elementHasCslp && !eventTarget.closest(".visual-builder__empty-block"))
    ) {
        params.event.preventDefault();
        params.event.stopPropagation();
    }

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

    // if the selected element is our empty block element, return
    if (
        editableElement.classList.contains(
            "visual-builder__empty-block-parent"
        ) ||
        editableElement.classList.contains("visual-builder__empty-block")
    ) {
        return;
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

    VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
        editableElement;

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

    // This is most probably redundant code, as the handleIndividualFields function
    // takes care of this
    // TODO: Remove this
    // if (
    //     fieldSchema.data_type === "block" ||
    //     fieldSchema.multiple ||
    //     (fieldSchema.data_type === "reference" &&
    //         // @ts-ignore
    //         fieldSchema.field_metadata.ref_multiple)
    // ) {
    //     handleAddButtonsForMultiple(eventDetails, {
    //         editableElement: editableElement,
    //         visualEditorContainer: params.visualEditorContainer,
    //         resizeObserver: params.resizeObserver,
    //     });
    // } else {
    //     removeAddInstanceButtons({
    //         eventTarget: params.event.target,
    //         visualEditorContainer: params.visualEditorContainer,
    //         overlayWrapper: params.overlayWrapper,
    //     });
    // }
    liveEditorPostMessage?.send(LiveEditorPostMessageEvents.FOCUS_FIELD, {
        DOMEditStack: getDOMEditStack(editableElement),
    });

    await handleIndividualFields(eventDetails, {
        visualEditorContainer: params.visualEditorContainer,
        resizeObserver: params.resizeObserver,
        lastEditedField: previousSelectedElement,
    });
}

export default handleEditorInteraction;
