import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "../utils/handleIndividualFields";

import {
    getCsDataOfElement,
    getDOMEditStack,
} from "../utils/getCsDataOfElement";
import { isValidCslp } from "../../cslp";
import { extractDetailsFromCslp } from "../../cslp/cslpdata";

import { appendFocusedToolbar } from "../generators/generateToolbar";

import { addFocusOverlay, hideOverlay } from "../generators/generateOverlay";

import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";

import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

import { VisualBuilder } from "..";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import { getPeerLockForField } from "../utils/fieldLockIndicator";
import EventListenerHandlerParams from "./types";
import { toggleHighlightedCommentIconDisplay } from "../generators/generateHighlightedComment";
import { VB_EmptyBlockParentClass } from "../..";
import { getFieldVariantStatus } from "../components/FieldRevert/FieldRevertComponent";
import getXPath from "get-xpath";
import Config from "../../configManager/configManager";
import { generateThread } from "../generators/generateThread";
import { isCollabThread } from "../generators/generateThread";
import { toggleCollabPopup } from "../generators/generateThread";
import { fixSvgXPath } from "../utils/collabUtils";
import { v4 as uuidV4 } from "uuid";
import { CslpData } from "../../cslp/types/cslp.types";
import { fetchEntryPermissionsAndStageDetails } from "../utils/fetchEntryPermissionsAndStageDetails";
import { isCustomFieldMultipleInstance } from "../utils/isCustomFieldMultipleInstance";
import { getParentCslp, getWholeFieldElement } from "../utils/getWholeFieldElement";

const SAFE_URL_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

export type HandleBuilderInteractionParams = Omit<
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
> & {
    hideOverlay: () => void;
    isVariant: boolean;
    options?: { isHover?: boolean };
};

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
        params.isVariant,
        params.options
    );
}

export async function handleBuilderInteraction(
    params: HandleBuilderInteractionParams
): Promise<void> {
    const eventTarget = params.event.target as HTMLElement | null;
    // resolve nearest anchor ancestor, not just an exact tag match
    const anchorElement = eventTarget?.closest("a") ?? null;
    const isAnchorElement = anchorElement !== null;
    const elementHasCslp =
        eventTarget &&
        (eventTarget.hasAttribute("data-cslp") ||
            eventTarget.closest("[data-cslp]"));

    // if multiple elements with the same cslp element are found,
    // assign a unique ID to each element which we can use to identify
    // them in updateFocussedState and other places where we
    // would have queried the element by data-cslp
    const eventTargetCslp = eventTarget?.getAttribute("data-cslp");
    if (isValidCslp(eventTargetCslp)) {
        const duplicates = document.querySelectorAll(
            `[data-cslp="${eventTargetCslp}"]`
        );
        if (duplicates.length > 1) {
            duplicates.forEach((ele) => {
                if (!ele.hasAttribute("data-cslp-unique-id")) {
                    const uniqueId = `cslp-${uuidV4()}`;
                    ele.setAttribute("data-cslp-unique-id", uniqueId);
                }
            });
        }
    }

    // if the target element is a studio-ui element, return
    // this is currently used for the "Edit in Studio" button
    if (eventTarget?.getAttribute("data-studio-ui") === "true") {
        return;
    }

    // Alt+click on a link: navigate explicitly, don't rely on the native
    // click (browsers alt-click anchors as a download, not a navigation)
    if (params.event.altKey) {
        if (anchorElement) {
            const { href, target, protocol } = anchorElement;
            params.event.preventDefault();
            params.event.stopPropagation();
            if (href && SAFE_URL_SCHEMES.has(protocol)) {
                if (target === "_blank") {
                    window.open(href, "_blank", "noopener,noreferrer");
                } else {
                    window.location.href = href;
                }
            }
        }
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
        if (config?.collab.pauseFeedback) return;
        const xpath = fixSvgXPath(getXPath(eventTarget));
        if (!eventTarget) return;

        const rect = eventTarget.getBoundingClientRect();
        const relativeX = (params.event.clientX - rect.left) / rect.width;
        const relativeY = (params.event.clientY - rect.top) / rect.height;

        if (!isCollabThread(eventTarget)) {
            params.event.preventDefault();
            params.event.stopPropagation();
        }

        if (isCollabThread(eventTarget)) {
            Config.set("collab.isFeedbackMode", false);
        } else if (config?.collab.isFeedbackMode) {
            generateThread(
                { xpath, relativeX, relativeY },
                {
                    isNewThread: true,
                    updateConfig: true,
                }
            );
        } else {
            toggleCollabPopup({ threadUid: "", action: "close" });
            Config.set("collab.isFeedbackMode", true);
        }
        return;
    }

    const eventDetails = getCsDataOfElement(params.event);

    // A field locked by another user is not editable — block entering edit mode
    // (the hover state already shows it disabled with the author avatar). This
    // gate runs before the post message so a click on a peer-locked field is a
    // true no-op: posting MOUSE_CLICK with its fieldMetadata makes the host read
    // it as a fresh selection and cancel the current user's own pending lock
    // release.
    if (eventDetails && getPeerLockForField(eventDetails.fieldMetadata)) {
        return;
    }

    // Send mouse click post message. A click inside the active inline editor (the
    // pseudo-editable overlay) resolves to no data-cslp — the overlay lives in the
    // SDK container, not the content DOM — but it is NOT a deselect: the user is
    // just repositioning the cursor within the focused field. Carry the focused
    // field's metadata so the host keeps the field lock instead of reading an
    // empty-space click as a deselect and releasing it.
    sendMouseClickPostMessage(
        eventDetails ?? getInlineEditFieldDetails(eventTarget)
    );

    if (
        !eventDetails ||
        !params.overlayWrapper ||
        !params.visualBuilderContainer
    ) {
        return;
    }

    const { editableElement, fieldMetadata } = eventDetails;

    // Redirect click on multiple custom field instance to its whole-field parent (cached schema only)
    const { content_type_uid, fieldPath } = fieldMetadata;
    if (FieldSchemaMap.hasFieldSchema(content_type_uid, fieldPath)) {
        const fieldSchemaForCheck = await FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath);
        if (fieldSchemaForCheck && isCustomFieldMultipleInstance(fieldSchemaForCheck, fieldMetadata)) {
            const parentCslp = getParentCslp(fieldMetadata.cslpValue);
            const wholeFieldElement = getWholeFieldElement(editableElement, parentCslp);
            if (wholeFieldElement) {
                wholeFieldElement.dispatchEvent(
                    new MouseEvent("click", {
                        bubbles: true,
                        cancelable: true,
                        clientX: params.event.clientX,
                        clientY: params.event.clientY,
                    })
                );
            } else if (config.debug) {
                console.debug(
                    "[Visual Builder] Custom field multiple instance: whole-field parent not found in DOM for CSLP",
                    parentCslp
                );
            }
            return;
        }
    }

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

/** SDK-owned chrome for the focused field (its toolbar + action buttons like
 * Replace / Edit / move / revert). These live in the SDK container, not the
 * content DOM, so they carry no data-cslp — but clicking them acts ON the focused
 * field, so it must not be read as a deselect. */
const FOCUSED_FIELD_CHROME_SELECTOR =
    ".visual-builder__pseudo-editable-element," +
    ".visual-builder__focused-toolbar," +
    ".visual-builder__field-toolbar-container";

/**
 * When a no-cslp click is still an interaction with the currently focused field —
 * inside its inline-edit overlay, inside the field element itself (cursor
 * reposition / text selection), or on its SDK toolbar chrome (Replace, Edit,
 * move, revert, field-path dropdown) — resolve the focused field's cslp so
 * MOUSE_CLICK still carries fieldMetadata and the host keeps the lock. Returns
 * undefined for any other empty click (a genuine deselect).
 */
function getInlineEditFieldDetails(
    eventTarget: HTMLElement | null
): { cslpData: string; fieldMetadata: CslpData } | undefined {
    const focusedElement =
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM;
    if (!focusedElement) {
        return undefined;
    }
    const insideFieldChrome = !!eventTarget?.closest?.(
        FOCUSED_FIELD_CHROME_SELECTOR
    );
    const insideFocusedField = !!eventTarget && focusedElement.contains(eventTarget);
    if (!insideFieldChrome && !insideFocusedField) {
        return undefined;
    }
    const cslpData = focusedElement.getAttribute?.("data-cslp") ?? null;
    if (!isValidCslp(cslpData)) {
        return undefined;
    }
    return { cslpData, fieldMetadata: extractDetailsFromCslp(cslpData) };
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
    VisualBuilder.VisualBuilderGlobalState.value.isFocussed = true;
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
    fieldMetadata: CslpData,
    editableElement: Element,
    previousSelectedElement: Element | null
) {
    const {
        content_type_uid,
        entry_uid,
        fieldPath,
        locale,
        variant: variantUid,
        fieldPathWithIndex,
    } = fieldMetadata;
    const fieldSchema = await FieldSchemaMap.getFieldSchema(
        content_type_uid,
        fieldPath
    );
    const { acl: entryAcl, workflowStage: entryWorkflowStageDetails, resolvedVariantPermissions } =
        await fetchEntryPermissionsAndStageDetails({
            entryUid: entry_uid,
            contentTypeUid: content_type_uid,
            locale,
            variantUid,
            fieldPathWithIndex,
        });

    if (fieldSchema) {
        const { isDisabled } = isFieldDisabled(
            fieldSchema,
            eventDetails,
            resolvedVariantPermissions,
            entryAcl,
            entryWorkflowStageDetails
        );
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
