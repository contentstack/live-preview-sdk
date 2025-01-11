import { throttle } from "lodash-es";
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
import Config from "../../configManager/configManager";
import { ILivePreviewWindowType } from "../../types/types";

export interface HandleMouseHoverParams
    extends Pick<
        EventListenerHandlerParams,
        "event" | "overlayWrapper" | "visualBuilderContainer"
    > {
    customCursor: HTMLDivElement | null;
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
    if (customCursor) {
        generateCustomCursor({
            fieldType: "discussion",
            customCursor: customCursor,
        });
    }
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

function addOutline(editableElement: Element, isFieldDisabled?: boolean): void {
    if (!editableElement) return;

    addHoverOutline(editableElement as HTMLElement, isFieldDisabled);
}

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
    customCursor?.classList.add("visible");
}

function isOverlay(target: HTMLElement): boolean {
    return target.classList.contains("visual-builder__overlay");
}

function isCollabThread(target: HTMLElement): boolean {
    return target.classList.contains("collab-indicator");
}

function isContentEditable(target: HTMLElement): boolean {
    if (target.hasAttribute("contenteditable"))
        return target.getAttribute("contenteditable") === "true";
    return false;
}

async function handleMouseHover(params: HandleMouseHoverParams): Promise<void> {
    throttle(async (params: HandleMouseHoverParams) => {
        const eventDetails = getCsDataOfElement(params.event);
        const eventTarget = params.event.target as HTMLElement | null;
        const config = Config.get();
        if (!eventDetails) {
            if (
                eventTarget &&
                (isOverlay(eventTarget) ||
                    isContentEditable(eventTarget) ||
                    isCollabThread(eventTarget))
            ) {
                hideCustomCursor(params.customCursor);
                return;
            }
            if (config?.windowType !== ILivePreviewWindowType.PREVIEW_SHARE) {
                resetCustomCursor(params.customCursor);
            }
            removeAddInstanceButtons({
                eventTarget: params.event.target,
                visualBuilderContainer: params.visualBuilderContainer,
                overlayWrapper: params.overlayWrapper,
            });
            handleCursorPosition(params.event, params.customCursor);
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

            if (config?.windowType === ILivePreviewWindowType.PREVIEW_SHARE) {
                if (!config?.isCollabActive) {
                    hideCustomCursor(params.customCursor);
                    return;
                }
                collabCustomCursor(params.customCursor);
                handleCursorPosition(params.event, params.customCursor);
                showCustomCursor(params.customCursor);
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
                    if (!params.customCursor) return;
                    const { isDisabled: fieldDisabled } = isFieldDisabled(
                        fieldSchema,
                        eventDetails
                    );
                    const fieldType = getFieldType(fieldSchema);
                    generateCustomCursor({
                        fieldType,
                        customCursor: params.customCursor,
                        fieldDisabled,
                    });
                }
            );

            handleCursorPosition(params.event, params.customCursor);
            showCustomCursor(params.customCursor);
        }

        if (
            !editableElement.classList.contains(
                "visual-builder__empty-block-parent"
            ) &&
            !editableElement.classList.contains("visual-builder__empty-block")
        ) {
            addOutline(editableElement);
            FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath).then(
                (fieldSchema) => {
                    if (!fieldSchema) return;
                    const { isDisabled: fieldDisabled, reason } =
                        isFieldDisabled(fieldSchema, eventDetails);
                    addOutline(editableElement, fieldDisabled);
                }
            );
        }

        if (
            VisualBuilder.VisualBuilderGlobalState.value
                .previousHoveredTargetDOM === editableElement
        ) {
            return;
        }

        VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
            editableElement;
    }, 10)(params);
}

export default handleMouseHover;
