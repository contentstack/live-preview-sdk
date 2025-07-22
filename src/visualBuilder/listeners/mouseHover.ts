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
import { getEntryPermissionsCached } from "../utils/getEntryPermissionsCached";
import { EntryPermissions } from "../utils/getEntryPermissions";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { HandleBuilderInteractionParams } from "./mouseClick";
import { appendFieldPathDropdown, removeFieldToolbar } from "../generators/generateToolbar";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { CslpData } from "../../cslp/types/cslp.types";

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

function addOutline(params?: AddOutlineParams): void {
    if(!params) {
        return;
    }
    const { editableElement, eventDetails, content_type_uid, fieldPath, fieldMetadata, fieldDisabled } = params;
    if (!editableElement) return;
    addHoverOutline(editableElement as HTMLElement, fieldDisabled);
    FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath).then(
        (fieldSchema) => {
            let entryAcl: EntryPermissions | undefined;
            if (!fieldSchema) return;
            getEntryPermissionsCached({
                entryUid: fieldMetadata.entry_uid,
                contentTypeUid: fieldMetadata.content_type_uid,
                locale: fieldMetadata.locale,
            })
            .then((data) => {
                entryAcl = data;
            })
            .catch((error) => {
                console.error(
                    "[Visual Builder] Error retrieving entry permissions:",
                    error
                );
            })
            .finally(() => {
                const { isDisabled: fieldDisabled } =
                    isFieldDisabled(
                        fieldSchema,
                        eventDetails,
                        entryAcl
                    );
                addHoverOutline(editableElement, fieldDisabled);
            });
        }
    );
}

const debouncedAddOutline = debounce(addOutline, 50, { trailing: true });
const showOutline = (params?: AddOutlineParams): void => debouncedAddOutline(params);

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
        if(
            eventTarget &&
            (isFieldPathDropdown(eventTarget) || isFieldPathParent(eventTarget))
        ) {
            params.customCursor && hideCustomCursor(params.customCursor);
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
        const elementUnderCursor = document.elementFromPoint(
            params.event.clientX,
            params.event.clientY
        );
        if (elementUnderCursor) {
            if (
                elementUnderCursor.nodeName === "A" ||
                elementUnderCursor.nodeName === "BUTTON"
            ) {
                elementUnderCursor.classList.add(
                    visualBuilderStyles()["visual-builder__no-cursor-style"]
                );
            }
        }

        if (config?.collab.enable && config?.collab.isFeedbackMode) {
            collabCustomCursor(params.customCursor);
            handleCursorPosition(params.event, params.customCursor);
            showCustomCursor(params.customCursor);
            return;
        } else if (
            config?.collab.enable &&
            !config?.collab.isFeedbackMode
        ) {
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

        /**
         * We called it seperately inside the code block to ensure that
         * the code will not wait for the promise to resolve.
         * If we get a cache miss, we will send a message to the iframe
         * without blocking the code.
         */
        FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath).then(
            (fieldSchema) => {
                if (!fieldSchema) return;

                let entryAcl: EntryPermissions | undefined;
                getEntryPermissionsCached({
                    entryUid: fieldMetadata.entry_uid,
                    contentTypeUid: fieldMetadata.content_type_uid,
                    locale: fieldMetadata.locale,
                })
                    .then((data) => {
                        entryAcl = data;
                    })
                    .catch((error) => {
                        console.error(
                            "[Visual Builder] Error retrieving entry permissions:",
                            error
                        );
                    })
                    .finally(() => {
                        if (!params.customCursor) return;
                        const { isDisabled: fieldDisabled } =
                            isFieldDisabled(
                                fieldSchema,
                                eventDetails,
                                entryAcl
                            );
                        const fieldType = getFieldType(fieldSchema);
                        generateCustomCursor({
                            fieldType,
                            customCursor: params.customCursor,
                            fieldDisabled,
                        });
                    });
            }
        );

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
            });
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

const handleMouseHover = async (params: HandleMouseHoverParams): Promise<void> => await throttledMouseHover(params);

export default handleMouseHover;
