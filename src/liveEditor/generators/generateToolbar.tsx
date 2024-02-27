import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import {
    DATA_CSLP_ATTR_SELECTOR,
    LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX,
} from "../utils/constants";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";

import MultipleFieldToolbarComponent from "../components/multipleFieldToolbar";
import { render } from "preact";
import FieldLabelWrapperComponent from "../components/fieldLabelWrapper";

export function appendFocusedToolbar(
    eventDetails: VisualEditorCslpEventDetails,
    focusedToolbarElement: HTMLDivElement
) {
    appendFieldPathDropdown(eventDetails, focusedToolbarElement);
    appendMultipleFieldToolbar(eventDetails, focusedToolbarElement);
}

export function appendMultipleFieldToolbar(
    eventDetails: VisualEditorCslpEventDetails,
    focusedToolbarElement: HTMLDivElement
) {
    const { editableElement: targetElement, fieldMetadata } = eventDetails;
    FieldSchemaMap.getFieldSchema(
        fieldMetadata.content_type_uid,
        fieldMetadata.fieldPath
    ).then((fieldSchema) => {
        const { isDisabled: fieldDisabled } = isFieldDisabled(
            fieldSchema,
            eventDetails
        );
        if (fieldSchema?.multiple && !fieldDisabled) {
            const wrapper = document.createDocumentFragment();
            render(
                <MultipleFieldToolbarComponent
                    fieldMetadata={fieldMetadata}
                    targetElement={targetElement}
                />,
                wrapper
            );

            focusedToolbarElement.append(wrapper);
        }
    });
}

export function appendFieldPathDropdown(
    eventDetails: VisualEditorCslpEventDetails,
    focusedToolbarElement: HTMLDivElement
) {
    const { editableElement: targetElement, fieldMetadata } = eventDetails;
    const targetElementDimension = targetElement.getBoundingClientRect();

    const distanceFromTop =
        targetElementDimension.top +
        window.scrollY -
        LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX -
        5;
    const distanceFromLeft =
        targetElementDimension.left - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX;

    focusedToolbarElement.style.top = `${distanceFromTop}px`;
    focusedToolbarElement.style.left = `${distanceFromLeft}px`;

    const parentPaths = collectParentCSLPPaths(targetElement, 2);

    const wrapper = document.createDocumentFragment();
    render(
        <FieldLabelWrapperComponent
            fieldMetadata={fieldMetadata}
            eventDetails={eventDetails}
            parentPaths={parentPaths}
        />,
        wrapper
    );

    focusedToolbarElement.appendChild(wrapper);

    const FieldLabelWrapper = document.querySelector(
        ".visual-editor__focused-toolbar__field-label-wrapper"
    );

    focusedToolbarElement.addEventListener("click", (e) => {
        e.preventDefault();

        if (
            (e.target as Element).classList.contains("visual-editor__tooltip")
        ) {
            return;
        }
        if (
            (e.target as Element).classList.contains(
                "visual-editor__focused-toolbar__field-label-wrapper__parent-field"
            )
        ) {
            const cslp = (e.target as Element).getAttribute(
                "data-target-cslp"
            ) as string;
            const parentElement = targetElement.closest(
                `[${DATA_CSLP_ATTR_SELECTOR}="${cslp}"]`
            ) as HTMLElement;
            if (parentElement) {
                parentElement.click();
            }
            return;
        }

        if (
            FieldLabelWrapper?.classList.contains("field-label-dropdown-open")
        ) {
            FieldLabelWrapper?.classList.remove("field-label-dropdown-open");
            return;
        }
        FieldLabelWrapper?.classList.add("field-label-dropdown-open");
    });
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
