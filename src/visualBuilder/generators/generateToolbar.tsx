import React from "preact/compat";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import {
    DATA_CSLP_ATTR_SELECTOR,
    LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX,
    RIGHT_EDGE_BUFFER,
    TOOLBAR_EDGE_BUFFER,
    TOP_EDGE_BUFFER,
} from "../utils/constants";
import FieldToolbarComponent from "../components/FieldToolbar";
import { render } from "preact";
import FieldLabelWrapperComponent from "../components/fieldLabelWrapper";
import { getEntryPermissionsCached } from "../utils/getEntryPermissionsCached";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";

export function appendFocusedToolbar(
    eventDetails: VisualBuilderCslpEventDetails,
    focusedToolbarElement: HTMLDivElement,
    hideOverlay: () => void,
    isVariant: boolean = false,
    options?: {
        isHover?: boolean;
    }
): void {
    appendFieldPathDropdown(eventDetails, focusedToolbarElement, options);
    if(options?.isHover) {
        return;
    }
    appendFieldToolbar(
        eventDetails,
        focusedToolbarElement,
        hideOverlay,
        isVariant
    );
}

export async function appendFieldToolbar(
    eventDetails: VisualBuilderCslpEventDetails,
    focusedToolbarElement: HTMLDivElement,
    hideOverlay: () => void,
    isVariant: boolean = false,
    options?: {
        isHover?: boolean;
    }
): Promise<void> {
    const { isHover } = options || {};
    if (
        focusedToolbarElement.querySelector(
            ".visual-builder__focused-toolbar__multiple-field-toolbar"
        ) && !isHover
    )
        return;
    const entryPermissions = await getEntryPermissionsCached({
        entryUid: eventDetails.fieldMetadata.entry_uid,
        contentTypeUid: eventDetails.fieldMetadata.content_type_uid,
        locale: eventDetails.fieldMetadata.locale,
    });
    const wrapper = document.createDocumentFragment();
    render(
        <FieldToolbarComponent
            eventDetails={eventDetails}
            hideOverlay={hideOverlay}
            isVariant={isVariant}
            entryPermissions={entryPermissions}
        />,
        wrapper
    );
    focusedToolbarElement.append(wrapper);
}

export function appendFieldPathDropdown(
    eventDetails: VisualBuilderCslpEventDetails,
    focusedToolbarElement: HTMLDivElement,
    options?: {
        isHover?: boolean;
    }
): void {
    const { isHover } = options || {};
    const fieldLabelWrapper = document.querySelector(
        ".visual-builder__focused-toolbar__field-label-wrapper"
    ) as HTMLDivElement | null;
    const { editableElement: targetElement, fieldMetadata } = eventDetails;

    if (fieldLabelWrapper) {
        if(isHover) {
            const fieldCslp = fieldLabelWrapper.getAttribute("data-hovered-cslp");
            if(fieldCslp === fieldMetadata.cslpValue) {
                return;
            } else {
                removeFieldToolbar(focusedToolbarElement);
            }
        } else {
            return;
        }
    }
    
    const targetElementDimension = targetElement.getBoundingClientRect();

    const distanceFromTop =
        targetElementDimension.top + window.scrollY - TOOLBAR_EDGE_BUFFER;
    // Position the toolbar at the top unless there's insufficient space or scrolling up is not possible (topmost element targetted).
    const adjustedDistanceFromTop =
        targetElementDimension.top + window.scrollY < TOP_EDGE_BUFFER
            ? distanceFromTop + targetElementDimension.height + TOP_EDGE_BUFFER
            : distanceFromTop;

    const distanceFromLeft =
        targetElementDimension.left - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX;
    const adjustedDistanceFromLeft = Math.max(
        distanceFromLeft,
        TOOLBAR_EDGE_BUFFER
    );

    const targetElementRightEdgeOffset =
        window.scrollX + window.innerWidth - targetElementDimension.left;

    if (targetElementRightEdgeOffset < RIGHT_EDGE_BUFFER) {
        // Overflow / Cutoff on right edge
        focusedToolbarElement.style.justifyContent = "flex-end";
        focusedToolbarElement.style.left = `${
            targetElementDimension.right + LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX
        }px`;
    } else {
        focusedToolbarElement.style.justifyContent = "flex-start"; // default
        focusedToolbarElement.style.left = `${adjustedDistanceFromLeft}px`;
    }

    focusedToolbarElement.style.top = `${adjustedDistanceFromTop}px`;

    const parentPaths = collectParentCSLPPaths(targetElement, 2);

    const wrapper = document.createDocumentFragment();
    render(
        <FieldLabelWrapperComponent
            fieldMetadata={fieldMetadata}
            eventDetails={eventDetails}
            parentPaths={parentPaths}
            getParentEditableElement={(cslp: string) => {
                const parentElement = targetElement.closest(
                    `[${DATA_CSLP_ATTR_SELECTOR}="${cslp}"]`
                ) as HTMLElement | null;
                return parentElement;
            }}
        />,
        wrapper
    );

    focusedToolbarElement.appendChild(wrapper);
}

function collectParentCSLPPaths(
    targetElement: Element,
    count: number
): Array<string> {
    const cslpPaths: Array<string> = [];
    let currentElement = targetElement.parentElement;

    while (count > 0 || currentElement === window.document.body) {
        if (!currentElement) {
            return cslpPaths;
        }

        if (currentElement.hasAttribute(DATA_CSLP_ATTR_SELECTOR)) {
            cslpPaths.push(
                currentElement.getAttribute(DATA_CSLP_ATTR_SELECTOR) as string
            );
            count--;
        }
        currentElement = currentElement.parentElement;
    }

    return cslpPaths;
}

export function removeFieldToolbar(toolbar: Element) {
    toolbar.innerHTML = "";
    const toolbarEvents = [
        VisualBuilderPostMessageEvents.DELETE_INSTANCE,
        VisualBuilderPostMessageEvents.UPDATE_DISCUSSION_ID,
    ];
    toolbarEvents.forEach((event) => {
        //@ts-expect-error - We are accessing private method here, but it is necessary to clean up the event listeners.
        if (visualBuilderPostMessage?.requestMessageHandlers?.has(event)) {
            //@ts-expect-error - We are accessing private method here, but it is necessary to clean up the event listeners.
            visualBuilderPostMessage?.unregisterEvent?.(event);
        }
    });
}
