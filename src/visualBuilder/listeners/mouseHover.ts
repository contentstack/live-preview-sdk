import { debounce, throttle } from "lodash-es";
import { getCsDataOfElement } from "../utils/getCsDataOfElement";
import { removeAddInstanceButtons } from "../utils/multipleElementAddButton";
import { generateCustomCursor } from "../generators/generateCustomCursor";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import { getFieldType } from "../utils/getFieldType";

import EventListenerHandlerParams from "./types";
import { VisualBuilder } from "..";
import { addHoverOutline } from "../generators/generateHoverOutline";
import { visualBuilderStyles } from "../visualBuilder.style";
import { VB_EmptyBlockParentClass } from "../..";
import Config from "../../configManager/configManager";
import { isCollabThread } from "../generators/generateThread";
import { HandleBuilderInteractionParams } from "./mouseClick";
import { appendFieldPathDropdown } from "../generators/generateToolbar";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { CslpData } from "../../cslp/types/cslp.types";
import { fetchEntryPermissionsAndStageDetails } from "../utils/fetchEntryPermissionsAndStageDetails";
import { isCustomFieldMultipleInstance } from "../utils/isCustomFieldMultipleInstance";
import { getParentCslp, getWholeFieldElement } from "../utils/getWholeFieldElement";
import { getPeerLockForField } from "../utils/fieldLockIndicator";
import { subscribeEntryFieldLockInfo } from "../utils/fieldLockStore";
import {
    showLockAvatar,
    hideLockAvatar,
} from "../generators/generateLockAvatar";

const config = Config.get();
export interface HandleMouseHoverParams
    extends Pick<
        EventListenerHandlerParams,
        "event" | "overlayWrapper" | "visualBuilderContainer" | "focusedToolbar" | "resizeObserver"
    > {
    customCursor: HTMLDivElement | null;
}

interface AddOutlineParams {
    editableElement: Element;
    eventDetails: VisualBuilderCslpEventDetails;
    content_type_uid: string;
    fieldPath: string;
    fieldDisabled?: boolean;
    fieldMetadata: CslpData;
}

function resetCustomCursor(customCursor: HTMLDivElement | null): void {
    if (customCursor) {
        generateCustomCursor({
            fieldType: "empty",
            customCursor: customCursor,
        });
    }
}

function collabCustomCursor(customCursor: HTMLDivElement | null): void {
    if (!customCursor) return;

    generateCustomCursor({
        fieldType: "discussion",
        customCursor: customCursor,
    });
}

function handleCursorPosition(
    event: MouseEvent,
    customCursor: HTMLDivElement | null
): void {
    if (customCursor) {
        const mouseY = event.clientY;
        const mouseX = event.clientX;

        customCursor.style.left = `${mouseX}px`;
        customCursor.style.top = `${mouseY}px`;
    }
}

async function addOutline(params?: AddOutlineParams): Promise<void> {
    if (!params) {
        return;
    }
    const {
        editableElement,
        eventDetails,
        content_type_uid,
        fieldPath,
        fieldMetadata,
        fieldDisabled,
    } = params;
    if (!editableElement) return;
    const isVariant = !!fieldMetadata.variant;
    // Peer-lock is a hover-only affordance: if this field is locked by another
    // user, show the disabled hover state + the author avatar (top-left, outside
    // the border). Read the mirror synchronously for an instant paint on cached
    // entries; it is re-read after the async fetch below in case the snapshot
    // only just arrived for a first-time-hovered entry.
    let peerLock = getPeerLockForField(fieldMetadata);
    if (peerLock) {
        showLockAvatar(editableElement, peerLock);
    } else {
        hideLockAvatar();
    }
    addHoverOutline(
        editableElement as HTMLElement,
        fieldDisabled || Boolean(peerLock),
        isVariant
    );
    const fieldSchema = await FieldSchemaMap.getFieldSchema(
        content_type_uid,
        fieldPath
    );
    if (!fieldSchema) return;
    const { acl: entryAcl, workflowStage: entryWorkflowStageDetails, resolvedVariantPermissions } =
        await fetchEntryPermissionsAndStageDetails({
            entryUid: fieldMetadata.entry_uid,
            contentTypeUid: fieldMetadata.content_type_uid,
            locale: fieldMetadata.locale,
            variantUid: fieldMetadata.variant,
            fieldPathWithIndex: fieldMetadata.fieldPathWithIndex,
        });
    const { isDisabled } = isFieldDisabled(
        fieldSchema,
        eventDetails,
        resolvedVariantPermissions,
        entryAcl,
        entryWorkflowStageDetails
    );
    peerLock = getPeerLockForField(fieldMetadata);
    if (peerLock) {
        showLockAvatar(editableElement, peerLock);
    } else {
        hideLockAvatar();
    }
    addHoverOutline(
        editableElement,
        fieldDisabled || isDisabled || Boolean(peerLock),
        isVariant
    );
}

const debouncedAddOutline = debounce(addOutline, 50, { trailing: true });
export const cancelPendingAddOutline = () => debouncedAddOutline.cancel();
// Remember the last painted hover so a lock change can repaint the same element
// (see the subscription below) without waiting for the next mouse move.
let lastAddOutlineParams: AddOutlineParams | undefined;
const showOutline = (params?: AddOutlineParams): Promise<void> | undefined => {
    if (params) {
        lastAddOutlineParams = params;
    }
    return debouncedAddOutline(params);
};

// Repaint the hover affordance when the lock mirror changes, so a lock acquired
// or released while the pointer sits on a field updates immediately. Guarded to
// the element still under the pointer with a visible outline, so a stale paint
// never resurrects a hidden outline.
subscribeEntryFieldLockInfo(() => {
    const params = lastAddOutlineParams;
    if (!params) return;
    if (
        VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM !==
        params.editableElement
    ) {
        return;
    }
    const outline = document.querySelector(".visual-builder__hover-outline");
    if (
        !outline ||
        outline.classList.contains(
            visualBuilderStyles()["visual-builder__hover-outline--hidden"]
        )
    ) {
        return;
    }
    void addOutline(params);
});

function hideDefaultCursor(): void {
    if (
        document?.body &&
        !document.body.classList.contains(
            visualBuilderStyles()["visual-builder__default-cursor--disabled"]
        )
    )
        document.body.classList.add(
            visualBuilderStyles()["visual-builder__default-cursor--disabled"]
        );
}

function showDefaultCursor(): void {
    if (
        document?.body &&
        document.body.classList.contains(
            visualBuilderStyles()["visual-builder__default-cursor--disabled"]
        )
    )
        document.body.classList.remove(
            visualBuilderStyles()["visual-builder__default-cursor--disabled"]
        );
}

export function hideHoverOutline(
    visualBuilderContainer: HTMLDivElement | null
): void {
    if (!visualBuilderContainer) {
        return;
    }
    const hoverOutline = visualBuilderContainer.querySelector(
        ".visual-builder__hover-outline"
    );
    if (!hoverOutline) {
        return;
    }
    hoverOutline.classList.add(
        visualBuilderStyles()["visual-builder__hover-outline--hidden"]
    );
    hideLockAvatar();
}

export function hideCustomCursor(customCursor: HTMLDivElement | null): void {
    showDefaultCursor();
    customCursor?.classList.remove("visible");
}

export function showCustomCursor(customCursor: HTMLDivElement | null): void {
    hideDefaultCursor();
    if (
        config.collab.enable &&
        (!config.collab.isFeedbackMode || config.collab.pauseFeedback)
    )
        return;
    customCursor?.classList.add("visible");
}

const debouncedRenderHoverToolbar = debounce(async (params: HandleBuilderInteractionParams) => {
    const eventDetails = getCsDataOfElement(params.event);
    if (
        !eventDetails ||
        !params.overlayWrapper ||
        !params.visualBuilderContainer ||
        !params.focusedToolbar
    ) {
        return;
    }

    appendFieldPathDropdown(eventDetails, params.focusedToolbar, {
        isHover: true
    });
}, 50, { trailing: true });

export const showHoverToolbar = async (params: HandleBuilderInteractionParams) => await debouncedRenderHoverToolbar(params);

export const cancelPendingHoverToolbar = () => debouncedRenderHoverToolbar.cancel();

function isOverlay(target: HTMLElement): boolean {
    return target.classList.contains("visual-builder__overlay");
}

function isContentEditable(target: HTMLElement): boolean {
    if (target.hasAttribute("contenteditable"))
        return target.getAttribute("contenteditable") === "true";
    return false;
}

function isFieldPathDropdown(target: HTMLElement): boolean {
    return target.classList.contains("visual-builder__focused-toolbar__field-label-wrapper") || target.classList.contains("visual-builder__focused-toolbar__field-label-wrapper__current-field");
}

function isFieldPathParent(target: HTMLElement): boolean {
    return target.classList.contains("visual-builder__focused-toolbar__field-label-wrapper__parent-field");
}

const throttledMouseHover = throttle(async (params: HandleMouseHoverParams) => {
    const eventDetails = getCsDataOfElement(params.event);
    const eventTarget = params.event.target as HTMLElement | null;

    if (config?.collab.enable && config?.collab.pauseFeedback) {
        hideCustomCursor(params.customCursor);
        return;
    }
    if (!eventDetails) {
        if (
            eventTarget &&
            (isOverlay(eventTarget) ||
                isContentEditable(eventTarget) ||
                isCollabThread(eventTarget))
        ) {
            handleCursorPosition(params.event, params.customCursor);
            hideCustomCursor(params.customCursor);
            return;
        }
        if (
            eventTarget &&
            (isFieldPathDropdown(eventTarget) || isFieldPathParent(eventTarget))
        ) {
            if (params.customCursor) {
                hideCustomCursor(params.customCursor);
            }
            showOutline();
            showHoverToolbar({
                event: params.event,
                overlayWrapper: params.overlayWrapper,
                visualBuilderContainer: params.visualBuilderContainer,
                previousSelectedEditableDOM:
                    VisualBuilder.VisualBuilderGlobalState.value
                        .previousSelectedEditableDOM,
                focusedToolbar: params.focusedToolbar,
                resizeObserver: params.resizeObserver,
            });
        }
        if (!config?.collab.enable) {
            resetCustomCursor(params.customCursor);
            // Empty space: drop any peer-lock avatar left over from a prior
            // field hover so it does not ghost over the blank canvas.
            hideLockAvatar();
        }
        removeAddInstanceButtons({
            eventTarget: params.event.target,
            visualBuilderContainer: params.visualBuilderContainer,
            overlayWrapper: params.overlayWrapper,
        });
        handleCursorPosition(params.event, params.customCursor);
        if (config?.collab.enable && config?.collab.isFeedbackMode) {
            showCustomCursor(params.customCursor);
            collabCustomCursor(params.customCursor);
        }
        return;
    }

    const { editableElement, fieldMetadata } = eventDetails;
    const { content_type_uid, fieldPath } = fieldMetadata;

    if (FieldSchemaMap.hasFieldSchema(content_type_uid, fieldPath)) {
        const fieldSchema = await FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath);
        if (fieldSchema && isCustomFieldMultipleInstance(fieldSchema, fieldMetadata)) {
            const parentCslp = getParentCslp(fieldMetadata.cslpValue);
            const wholeFieldElement = getWholeFieldElement(editableElement, parentCslp);
            if (wholeFieldElement) {
                wholeFieldElement.dispatchEvent(
                    new MouseEvent("mousemove", {
                        bubbles: true,
                        cancelable: true,
                        clientX: params.event.clientX,
                        clientY: params.event.clientY,
                    })
                );
            } else {
                if (config.debug) {
                    console.debug(
                        "[Visual Builder] Custom field multiple instance: whole-field parent not found in DOM for CSLP",
                        parentCslp
                    );
                }
                resetCustomCursor(params.customCursor);
                handleCursorPosition(params.event, params.customCursor);
            }
            return;
        }
    }

    if (
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM &&
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM.isSameNode(
            editableElement
        )
    ) {
        hideCustomCursor(params.customCursor);
        return;
    }

    if (params.customCursor) {
        if (config?.collab.enable && config?.collab.isFeedbackMode) {
            collabCustomCursor(params.customCursor);
            handleCursorPosition(params.event, params.customCursor);
            showCustomCursor(params.customCursor);
            return;
        } else if (config?.collab.enable && !config?.collab.isFeedbackMode) {
            hideCustomCursor(params.customCursor);
            return;
        }

        if (
            VisualBuilder.VisualBuilderGlobalState.value
                .previousHoveredTargetDOM !== editableElement
        ) {
            resetCustomCursor(params.customCursor);
            removeAddInstanceButtons({
                eventTarget: params.event.target,
                visualBuilderContainer: params.visualBuilderContainer,
                overlayWrapper: params.overlayWrapper,
            });
        }

        if (!FieldSchemaMap.hasFieldSchema(content_type_uid, fieldPath)) {
            generateCustomCursor({
                fieldType: "loading",
                customCursor: params.customCursor,
            });
        }

        // only re-generate cursor when moving onto a new element — avoids
        // firing fetchEntryPermissionsAndStageDetails on every 10ms tick
        if (
            VisualBuilder.VisualBuilderGlobalState.value
                .previousHoveredTargetDOM !== editableElement
        ) {
            generateCursor({
                eventDetails,
                customCursor: params.customCursor,
            });
        }

        handleCursorPosition(params.event, params.customCursor);
        showCustomCursor(params.customCursor);
    }

    if (
        !editableElement.classList.contains(VB_EmptyBlockParentClass) &&
        !editableElement.classList.contains("visual-builder__empty-block")
    ) {
        showOutline({
            editableElement,
            eventDetails,
            content_type_uid,
            fieldPath,
            fieldMetadata,
        });
        const isFocussed= VisualBuilder.VisualBuilderGlobalState.value.isFocussed;
        if(!isFocussed) {
            showHoverToolbar({
                event: params.event,
                overlayWrapper: params.overlayWrapper,
                visualBuilderContainer: params.visualBuilderContainer,
                previousSelectedEditableDOM:
                    VisualBuilder.VisualBuilderGlobalState.value
                        .previousSelectedEditableDOM,
                    focusedToolbar: params.focusedToolbar,
                    resizeObserver: params.resizeObserver,
                }
            );
        }
    }

    if (
        VisualBuilder.VisualBuilderGlobalState.value
            .previousHoveredTargetDOM === editableElement
    ) {
        return;
    }

    VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
        editableElement;
}, 10);

async function generateCursor({
    eventDetails,
    customCursor,
}: {
    eventDetails: VisualBuilderCslpEventDetails;
    customCursor: HTMLDivElement | null;
}) {
    if (!customCursor) return;
    const { fieldMetadata } = eventDetails;
    const fieldSchema = await FieldSchemaMap.getFieldSchema(
        fieldMetadata.content_type_uid,
        fieldMetadata.fieldPath
    );
    if (!fieldSchema) {
        return;
    }
    const { acl: entryAcl, workflowStage: entryWorkflowStageDetails, resolvedVariantPermissions } =
        await fetchEntryPermissionsAndStageDetails({
            entryUid: fieldMetadata.entry_uid,
            contentTypeUid: fieldMetadata.content_type_uid,
            locale: fieldMetadata.locale,
            variantUid: fieldMetadata.variant,
            fieldPathWithIndex: fieldMetadata.fieldPathWithIndex,
        });
    const { isDisabled: fieldDisabled } = isFieldDisabled(
        fieldSchema,
        eventDetails,
        resolvedVariantPermissions,
        entryAcl,
        entryWorkflowStageDetails
    );
    const fieldType = getFieldType(fieldSchema);
    // A peer-locked field reads as disabled on hover (same grey outline), so gray
    // the cursor info too for a consistent disabled affordance.
    generateCustomCursor({
        fieldType,
        customCursor,
        fieldDisabled: fieldDisabled || Boolean(getPeerLockForField(fieldMetadata)),
    });
}

const handleMouseHover = async (
    params: HandleMouseHoverParams
): Promise<void> => await throttledMouseHover(params);

export const cancelPendingMouseHover = () => throttledMouseHover.cancel();

export default handleMouseHover;
