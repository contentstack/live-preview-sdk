import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import {
    DATA_CSLP_ATTR_SELECTOR,
    LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX,
} from "./constants";
import { FieldSchemaMap } from "./fieldSchemaMap";
import { cleanIndividualFieldResidual } from "./handleIndividualFields";
import { isFieldDisabled } from "./isFieldDisabled";
import liveEditorPostMessage from "./liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

import MultipleFieldToolbarComponent from "../components/multipleFieldToolbar";
import { render } from "preact";
import VisualEditorGlobalUtils from "../globals";

const caretIcon = `
<svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2.73483 5.73483C2.88128 5.58839 3.11872 5.58839 3.26517 5.73483L8 10.4697L12.7348 5.73483C12.8813 5.58839 13.1187 5.58839 13.2652 5.73483C13.4116 5.88128 13.4116 6.11872 13.2652 6.26517L8.26516 11.2652C8.11872 11.4116 7.88128 11.4116 7.73484 11.2652L2.73483 6.26517C2.58839 6.11872 2.58839 5.88128 2.73483 5.73483Z"
        fill="white"
    />
</svg>
`;

const infoIcon = `
<svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    >
    <path
        d="M8 5.5C7.72386 5.5 7.5 5.72386 7.5 6C7.5 6.27614 7.72386 6.5 8 6.5C8.27614 6.5 8.5 6.27614 8.5 6C8.5 5.72386 8.27614 5.5 8 5.5Z"
        fill="white"
    />
    <path
        d="M8 10.875C7.79289 10.875 7.625 10.7071 7.625 10.5V7.5C7.625 7.29289 7.79289 7.125 8 7.125C8.20711 7.125 8.375 7.29289 8.375 7.5V10.5C8.375 10.7071 8.20711 10.875 8 10.875Z"
        fill="white"
    />
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8ZM13.25 8C13.25 10.8995 10.8995 13.25 8 13.25C5.10051 13.25 2.75 10.8995 2.75 8C2.75 5.10051 5.10051 2.75 8 2.75C10.8995 2.75 13.25 5.10051 13.25 8Z"
        fill="white"
    />
    </svg>
`;

/**
 * Adds a focus overlay to the target element.
 * @param targetElement - The element to add the focus overlay to.
 * @param focusOverlayWrapper - The HTMLDivElement that contains the focus overlay.
 * @returns void
 */
export function addFocusOverlay(
    targetElement: Element,
    focusOverlayWrapper: HTMLDivElement
): void {
    console.log("[IN SDK] : in addFocusOverlay");

    const targetElementDimension = targetElement.getBoundingClientRect();

    focusOverlayWrapper.classList.add("visible");

    const distanceFromTop = targetElementDimension.top + window.scrollY;
    const topOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--top"
    );

    if (topOverlayDOM) {
        topOverlayDOM.style.top = "0";
        topOverlayDOM.style.left = "0";
        topOverlayDOM.style.width = "100%";
        topOverlayDOM.style.height = `calc(${distanceFromTop}px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
    }

    const bottomOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--bottom"
    );
    if (bottomOverlayDOM) {
        bottomOverlayDOM.style.top = `calc(${
            targetElementDimension.bottom + window.scrollY
        }px + ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        bottomOverlayDOM.style.height = `calc(${
            window.document.body.scrollHeight -
            targetElementDimension.bottom -
            window.scrollY
        }px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        bottomOverlayDOM.style.left = "0";
        bottomOverlayDOM.style.width = "100%";
    }

    const leftOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--left"
    );
    if (leftOverlayDOM) {
        leftOverlayDOM.style.left = "0";
        leftOverlayDOM.style.top = `calc(${distanceFromTop}px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        leftOverlayDOM.style.height = `calc(${
            targetElementDimension.height
        }px + ${2 * LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        leftOverlayDOM.style.width = `calc(${targetElementDimension.left}px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
    }

    const rightOverlayDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--right"
    );
    if (rightOverlayDOM) {
        rightOverlayDOM.style.left = `calc(${targetElementDimension.right}px + ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        rightOverlayDOM.style.top = `calc(${distanceFromTop}px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        rightOverlayDOM.style.height = `calc(${
            targetElementDimension.height
        }px + ${2 * LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
        rightOverlayDOM.style.width = `calc(${
            window.innerWidth - targetElementDimension.right
        }px - ${LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px)`;
    }

    const outlineDOM = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-editor__overlay--outline"
    );
    if (outlineDOM) {
        outlineDOM.style.top = `${
            targetElementDimension.top + window.scrollY
        }px`;
        outlineDOM.style.height = `${targetElementDimension.height}px`;
        outlineDOM.style.width = `${targetElementDimension.width}px`;
        outlineDOM.style.left = `${targetElementDimension.left}px`;
        outlineDOM.style.outlineColor = "#715cdd";
    }
}

/**
 * Hides the focus overlay and performs necessary cleanup actions when the user clicks outside of the focused element.
 * @param event - The mouse event that triggered the function.
 * @param elements - An object containing references to the focus overlay wrapper, the previously selected editable DOM element, and the visual editor wrapper.
 */
export function hideFocusOverlay(elements: {
    visualEditorWrapper: HTMLDivElement | null;
    visualEditorOverlayWrapper: HTMLDivElement | null;
    focusedToolbar: HTMLDivElement | null;
}): void {
    
    const {

        visualEditorWrapper,
        visualEditorOverlayWrapper,
        focusedToolbar,
    } = elements;

    console.log("[IN SDK] : in hideFocusOverlay", VisualEditorGlobalUtils.previousSelectedEditableDOM);

    if (visualEditorOverlayWrapper) {
        console.log("[IN SDK] : in hideFocusOverlay 123", visualEditorOverlayWrapper, visualEditorOverlayWrapper.classList);
        visualEditorOverlayWrapper.classList.remove("visible");

        if (VisualEditorGlobalUtils.previousSelectedEditableDOM) {
            const pseudoEditableElement = visualEditorWrapper?.querySelector(
                "div.visual-editor__pseudo-editable-element"
            );

            console.log('[IN SDK] : in hideFocusOverlay 2 : pseudoEditableElement ',  pseudoEditableElement);
            
            if (
                VisualEditorGlobalUtils.previousSelectedEditableDOM.hasAttribute("contenteditable") ||
                pseudoEditableElement
            ) {
                const actualEditedElement =
                    pseudoEditableElement ||
                    (VisualEditorGlobalUtils.previousSelectedEditableDOM as HTMLElement);

                liveEditorPostMessage?.send(
                    LiveEditorPostMessageEvents.UPDATE_FIELD,
                    {
                        data:
                            "innerText" in actualEditedElement
                                ? actualEditedElement.innerText
                                : actualEditedElement.textContent,
                        fieldMetadata: extractDetailsFromCslp(
                            VisualEditorGlobalUtils.previousSelectedEditableDOM.getAttribute(
                                "data-cslp"
                            ) as string
                        ),
                    }
                );
            }

            cleanIndividualFieldResidual({
                overlayWrapper: visualEditorOverlayWrapper,
                visualEditorWrapper: visualEditorWrapper,
                focusedToolbar: focusedToolbar,
            });
        }
    }
}

export function appendFocusedToolbar(
    eventDetails: VisualEditorCslpEventDetails,
    focusedToolbarElement: HTMLDivElement
) {
    console.log("[IN SDK] : appendFocusedToolbar");
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

    const FieldLabelWrapper = document.createElement("div");
    FieldLabelWrapper.classList.add(
        "visual-editor__focused-toolbar__field-label-wrapper"
    );

    const currentFieldItem = document.createElement("button");
    currentFieldItem.classList.add(
        "visual-editor__focused-toolbar__field-label-wrapper__current-field",
        "visual-editor__button",
        "visual-editor__button--primary"
    );

    const textDiv = document.createElement("div");
    textDiv.classList.add("visual-editor__focused-toolbar__text");
    textDiv.innerText =
        fieldMetadata.fieldPath[fieldMetadata.fieldPath.length - 1];

    const icon = document.createElement("div");
    icon.classList.add(
        "visual-editor__focused-toolbar__field-label-wrapper__caret"
    );
    icon.innerHTML = caretIcon;

    currentFieldItem.append(textDiv, icon);
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

        if (FieldLabelWrapper.classList.contains("field-label-dropdown-open")) {
            FieldLabelWrapper.classList.remove("field-label-dropdown-open");
            return;
        }
        FieldLabelWrapper.classList.add("field-label-dropdown-open");
    });

    FieldSchemaMap.getFieldSchema(
        fieldMetadata.content_type_uid,
        fieldMetadata.fieldPath
    ).then((fieldSchema) => {
        const { isDisabled: fieldDisabled, reason } = isFieldDisabled(
            fieldSchema,
            eventDetails
        );
        if (fieldDisabled) {
            FieldLabelWrapper.classList.add(
                "visual-editor__focused-toolbar--field-disabled"
            );
        }
        textDiv.innerText = fieldSchema.display_name;

        if (fieldDisabled) {
            icon.innerHTML = "infoSVG";
            icon.classList.add("visual-editor__tooltip");
            icon.setAttribute("data-tooltip", reason);
        }
        const outlineDOM = document.querySelector<HTMLDivElement>(
            ".visual-editor__overlay--outline"
        );
        if (outlineDOM && fieldDisabled) {
            outlineDOM.style.outlineColor = "#909090";
        }
    });

    FieldLabelWrapper.appendChild(currentFieldItem);

    parentPaths.forEach((path, index) => {
        const parentFieldItem = document.createElement("button");
        parentFieldItem.classList.add(
            "visual-editor__focused-toolbar__field-label-wrapper__parent-field",
            "visual-editor__button",
            "visual-editor__button--secondary",
            "visual-editor__focused-toolbar__text"
        );

        parentFieldItem.setAttribute("data-target-cslp", path);
        parentFieldItem.style.top = `-${(index + 1) * 30}px`;
        const { content_type_uid, fieldPath } = extractDetailsFromCslp(path);
        parentFieldItem.innerText = fieldPath[fieldPath.length - 1];
        FieldLabelWrapper.appendChild(parentFieldItem);
        FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath).then(
            (fieldSchema) => {
                parentFieldItem.innerText = fieldSchema.display_name;
                return;
            }
        );
    });

    focusedToolbarElement.appendChild(FieldLabelWrapper);
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
