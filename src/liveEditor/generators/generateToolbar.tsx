import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import {
    DATA_CSLP_ATTR_SELECTOR,
    LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX,
    TOOLBAR_EDGE_BUFFER,
    TOP_EDGE_BUFFER,
} from "../utils/constants";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";

import FieldToolbarComponent from "../components/FieldToolbar";
import { render } from "preact";
import FieldLabelWrapperComponent from "../components/fieldLabelWrapper";

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
    const { editableElement: targetElement, fieldMetadata } = eventDetails;
    FieldSchemaMap.getFieldSchema(
        fieldMetadata.content_type_uid,
        fieldMetadata.fieldPath
    ).then((fieldSchema) => {
        const { isDisabled: fieldDisabled } = isFieldDisabled(
            fieldSchema,
            eventDetails
        );
        const wrapper = document.createDocumentFragment();
        render(
            <FieldToolbarComponent
                fieldMetadata={fieldMetadata}
                fieldSchema={fieldSchema}
                targetElement={targetElement}
                isMultiple={fieldSchema.multiple || false}
                isDisabled={fieldDisabled}
            />,
            wrapper
        );

        focusedToolbarElement.append(wrapper);
    });
}

export function appendFieldPathDropdown(
    eventDetails: VisualEditorCslpEventDetails,
    focusedToolbarElement: HTMLDivElement
): void {
    const { editableElement: targetElement, fieldMetadata } = eventDetails;
    const targetElementDimension = targetElement.getBoundingClientRect();

    const distanceFromTop = targetElementDimension.top + window.scrollY - TOOLBAR_EDGE_BUFFER;
    const adjustedDistanceFromTop = targetElementDimension.top < TOP_EDGE_BUFFER
        ? distanceFromTop + targetElementDimension.height + TOP_EDGE_BUFFER
        : distanceFromTop;

    const distanceFromLeft =
        targetElementDimension.left - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX;
    const adjustedDistanceFromLeft = Math.max(distanceFromLeft, TOOLBAR_EDGE_BUFFER);

    focusedToolbarElement.style.top = `${adjustedDistanceFromTop}px`;
    focusedToolbarElement.style.left = `${adjustedDistanceFromLeft}px`;

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
