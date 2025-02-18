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
import { getFieldVariantStatus } from "../components/FieldRevert/FieldRevertComponent";
import getXPath from "get-xpath";
import Config from "../../configManager/configManager";
import { generateThread } from "../generators/generateThread";
import { isCollabThread } from "../generators/generateThread";

type HandleBuilderInteractionParams = Omit<
    EventListenerHandlerParams,
    "eventDetails" | "customCursor"
> & { reEvaluate?: boolean };

type AddFocusOverlayParams = Pick<
    EventListenerHandlerParams,
    "overlayWrapper" | "resizeObserver"
> & { editableElement: Element; isFieldDisabled?: boolean };

type AddFocusedToolbarParams = Pick<
    EventListenerHandlerParams,
    "eventDetails" | "focusedToolbar"
> & { hideOverlay: () => void; isVariant: boolean };

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
        params.hideOverlay,
        params.isVariant
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

    // if the target element is a studio-ui element, return
    // this is currently used for the "Edit in Studio" button
    if (eventTarget?.getAttribute("data-studio-ui") === "true") {
        return;
    }
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
                document.dispatchEvent(
                    new CustomEvent("toggleCollabPopup", {
                        detail: { action: "close" },
                    })
                );
                Config.set("collab.isFeedbackMode", true);
            }
        }
        return;
    }

    const eventDetails = getCsDataOfElement(params.event);

    // Send mouse click post message
    sendMouseClickPostMessage(eventDetails);

    if (
        !eventDetails ||
        !params.overlayWrapper ||
        !params.visualBuilderContainer
    ) {
        return;
    }

    const { editableElement, fieldMetadata } = eventDetails;
    const variantStatus = await getFieldVariantStatus(fieldMetadata);
    const isVariant = variantStatus
        ? Object.values(variantStatus).some((value) => value === true)
        : false;

    // Clean residuals if necessary
    cleanResidualsIfNeeded(params, editableElement);

    // Return if the selected element is an empty block
    if (isEmptyBlockElement(editableElement)) {
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
        isSameSelectedElement(previousSelectedElement, editableElement, params)
    ) {
        return;
    }

    VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
        editableElement;

    // Add overlay and focused toolbar
    addOverlayAndToolbar(params, eventDetails, editableElement, isVariant);

    const { cslpValue } = fieldMetadata;

    toggleHighlightedCommentIconDisplay(cslpValue, false);

    // Handle field schema and individual fields
    await handleFieldSchemaAndIndividualFields(
        params,
        eventDetails,
        fieldMetadata,
        editableElement,
        previousSelectedElement
    );

    // Observe changes to the editable element
    observeEditableElementChanges(params, editableElement);
}

function sendMouseClickPostMessage(eventDetails: any) {
    visualBuilderPostMessage
        ?.send(VisualBuilderPostMessageEvents.MOUSE_CLICK, {
            cslpData: eventDetails?.cslpData,
            fieldMetadata: eventDetails?.fieldMetadata,
        })
        .catch((err) => {
            console.warn("Error while sending post message", err);
        });
}
function cleanResidualsIfNeeded(
    params: HandleBuilderInteractionParams,
    editableElement: Element
) {
    const previousSelectedElement =
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM;
    if (
        (previousSelectedElement &&
            previousSelectedElement !== editableElement) ||
        params.reEvaluate
    ) {
        cleanIndividualFieldResidual({
            overlayWrapper: params.overlayWrapper!,
            visualBuilderContainer: params.visualBuilderContainer,
            focusedToolbar: params.focusedToolbar,
            resizeObserver: params.resizeObserver,
        });
    }
}
function isEmptyBlockElement(editableElement: Element): boolean {
    return (
        editableElement.classList.contains(VB_EmptyBlockParentClass) ||
        editableElement.classList.contains("visual-builder__empty-block")
    );
}

function isSameSelectedElement(
    previousSelectedElement: Element | null,
    editableElement: Element,
    params: HandleBuilderInteractionParams
): boolean {
    return !!(
        previousSelectedElement &&
        previousSelectedElement === editableElement &&
        !params.reEvaluate
    );
}

function addOverlayAndToolbar(
    params: HandleBuilderInteractionParams,
    eventDetails: any,
    editableElement: Element,
    isVariant: boolean
) {
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
        isVariant,
    });
}
async function handleFieldSchemaAndIndividualFields(
    params: HandleBuilderInteractionParams,
    eventDetails: any,
    fieldMetadata: any,
    editableElement: Element,
    previousSelectedElement: Element | null
) {
    const { content_type_uid, fieldPath } = fieldMetadata;
    const fieldSchema = await FieldSchemaMap.getFieldSchema(
        content_type_uid,
        fieldPath
    );

    if (fieldSchema) {
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

    visualBuilderPostMessage?.send(VisualBuilderPostMessageEvents.FOCUS_FIELD, {
        DOMEditStack: getDOMEditStack(editableElement),
    });

    await handleIndividualFields(eventDetails, {
        visualBuilderContainer: params.visualBuilderContainer!,
        resizeObserver: params.resizeObserver,
        lastEditedField: previousSelectedElement,
    });
}
function observeEditableElementChanges(
    params: HandleBuilderInteractionParams,
    editableElement: Element
) {
    const focusElementObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "data-cslp"
            ) {
                focusElementObserver?.disconnect();
                VisualBuilder.VisualBuilderGlobalState.value.focusElementObserver =
                    null;
                handleBuilderInteraction({ ...params, reEvaluate: true });
            }
        });
    });

    VisualBuilder.VisualBuilderGlobalState.value.focusElementObserver =
        focusElementObserver;
    focusElementObserver.observe(editableElement, { attributes: true });
}

export default handleBuilderInteraction;
