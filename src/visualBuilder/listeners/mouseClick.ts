import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "../utils/handleIndividualFields";

import {
    getCsDataOfElement,
    getDOMEditStack,
} from "../utils/getCsDataOfElement";

import { appendFocusedToolbar } from "../generators/generateToolbar";

import { addFocusOverlay, hideOverlay } from "../generators/generateOverlay";

import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";

import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

import { VisualBuilder } from "..";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import EventListenerHandlerParams from "./types";
import { toggleHighlightedCommentIconDisplay } from "../generators/generateHighlightedComment";
import { VB_EmptyBlockParentClass } from "../..";
import getXPath from "get-xpath";
import Config from "../../configManager/configManager";
import { generateThread } from "../generators/generateThread";
import { isCollabThread } from "../generators/generateThread";

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
> & { hideOverlay: () => void };

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

    appendFocusedToolbar(
        params.eventDetails,
        params.focusedToolbar,
        params.hideOverlay
    );
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

    const config = Config.get();

    if (config?.collab.enable === true) {
        const xpath = getXPath(eventTarget);
        if (!eventTarget) return;
        const rect = eventTarget.getBoundingClientRect();
        const relativeX = (params.event.clientX - rect.left) / rect.width;
        const relativeY = (params.event.clientY - rect.top) / rect.height;

        if (isCollabThread(eventTarget)) {
            Config.set("collab.isFeedbackMode", false);
        } else {
            if (config?.collab.isFeedbackMode) {
                generateThread(
                    { xpath, relativeX, relativeY },
                    {
                        isNewThread: true,
                        updateConfig: true,
                    }
                );
            } else {
                document.dispatchEvent(new CustomEvent("closeCollabPopup"));
                Config.set("collab.isFeedbackMode", true);
            }
        }
        return;
    }

    const eventDetails = getCsDataOfElement(params.event);
    visualBuilderPostMessage
        ?.send(VisualBuilderPostMessageEvents.MOUSE_CLICK, {
            cslpData: eventDetails?.cslpData,
            fieldMetadata: eventDetails?.fieldMetadata,
        })
        .catch((err) => {
            console.warn("Error while sending post message", err);
        });
    if (
        !eventDetails ||
        !params.overlayWrapper ||
        !params.visualBuilderContainer
    ) {
        return;
    }
    const { editableElement, fieldMetadata } = eventDetails;

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
        editableElement.classList.contains(VB_EmptyBlockParentClass) ||
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
        hideOverlay: () => {
            hideOverlay({
                visualBuilderContainer: params.visualBuilderContainer,
                visualBuilderOverlayWrapper: params.overlayWrapper,
                focusedToolbar: params.focusedToolbar,
                resizeObserver: params.resizeObserver,
            });
        },
    });

    const { content_type_uid, fieldPath, cslpValue } = fieldMetadata;

    toggleHighlightedCommentIconDisplay(cslpValue, false);

    const fieldSchema = await FieldSchemaMap.getFieldSchema(
        content_type_uid,
        fieldPath
    );

    if (fieldSchema) {
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
