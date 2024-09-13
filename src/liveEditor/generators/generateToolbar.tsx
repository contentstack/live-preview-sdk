import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import {
    DATA_CSLP_ATTR_SELECTOR,
    LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX,
    RIGHT_EDGE_BUFFER,
    TOOLBAR_EDGE_BUFFER,
    TOP_EDGE_BUFFER,
} from "../utils/constants";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";

import FieldToolbarComponent from "../components/FieldToolbar";
import { render } from "preact";
import FieldLabelWrapperComponent from "../components/fieldLabelWrapper";
import { getFieldType } from "../utils/getFieldType";
import { FieldDataType } from "../utils/types/index.types";
import { IReferenceContentTypeSchema } from "../../cms/types/contentTypeSchema.types";

export function appendFocusedToolbar(
    eventDetails: VisualEditorCslpEventDetails,
    focusedToolbarElement: HTMLDivElement
): void {
    appendFieldPathDropdown(eventDetails, focusedToolbarElement);
    appendFieldToolbar(eventDetails, focusedToolbarElement);
}

export function appendFieldToolbar(
    eventDetails: VisualEditorCslpEventDetails,
    focusedToolbarElement: HTMLDivElement
): void {
    if(focusedToolbarElement.querySelector(".visual-builder__focused-toolbar__multiple-field-toolbar"))
        return;
    const { editableElement, fieldMetadata } = eventDetails;
    const wrapper = document.createDocumentFragment();
    render(
        <FieldToolbarComponent
            fieldMetadata={fieldMetadata}
            editableElement={editableElement}
        />,
        wrapper
    );

    focusedToolbarElement.append(wrapper);
}

export function appendFieldPathDropdown(
    eventDetails: VisualEditorCslpEventDetails,
    focusedToolbarElement: HTMLDivElement
): void {
    const { editableElement: targetElement, fieldMetadata } = eventDetails;
    const targetElementDimension = targetElement.getBoundingClientRect();

    const distanceFromTop = targetElementDimension.top + window.scrollY - TOOLBAR_EDGE_BUFFER;
    // Position the toolbar at the top unless there's insufficient space or scrolling up is not possible (topmost element targetted).
    const adjustedDistanceFromTop = targetElementDimension.top + window.scrollY < TOP_EDGE_BUFFER
        ? distanceFromTop + targetElementDimension.height + TOP_EDGE_BUFFER
        : distanceFromTop;

    const distanceFromLeft =
        targetElementDimension.left - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX;
    const adjustedDistanceFromLeft = Math.max(distanceFromLeft, TOOLBAR_EDGE_BUFFER);

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
