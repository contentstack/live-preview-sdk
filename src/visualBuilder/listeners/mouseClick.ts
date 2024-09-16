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

import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";

import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

import { VisualBuilder } from "..";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import EventListenerHandlerParams from "./types";
import { toggleHighlightedCommentIconDisplay } from "../generators/generateHighlightedComment";

type HandleBuilderInteractionParams = Omit<
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

async function handleBuilderInteraction(
    params: HandleBuilderInteractionParams
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
        !params.visualBuilderContainer
    ) {
        return;
    }
    const { editableElement } = eventDetails;

    if (
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM &&
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM !== editableElement
    ) {
        cleanIndividualFieldResidual({
            overlayWrapper: params.overlayWrapper,
            visualBuilderContainer: params.visualBuilderContainer,
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
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM;
    if (
        previousSelectedElement &&
        previousSelectedElement === editableElement
    ) {
        return;
    }

    VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
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

    const { content_type_uid, fieldPath ,cslpValue } = eventDetails.fieldMetadata;

    toggleHighlightedCommentIconDisplay(cslpValue,false)
    
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
    //         visualBuilderContainer: params.visualBuilderContainer,
    //         resizeObserver: params.resizeObserver,
    //     });
    // } else {
    //     removeAddInstanceButtons({
    //         eventTarget: params.event.target,
    //         visualBuilderContainer: params.visualBuilderContainer,
    //         overlayWrapper: params.overlayWrapper,
    //     });
    // }
    visualBuilderPostMessage?.send(VisualBuilderPostMessageEvents.FOCUS_FIELD, {
        DOMEditStack: getDOMEditStack(editableElement),
    });

    await handleIndividualFields(eventDetails, {
        visualBuilderContainer: params.visualBuilderContainer,
        resizeObserver: params.resizeObserver,
        lastEditedField: previousSelectedElement,
    });
}

export default handleBuilderInteraction;
