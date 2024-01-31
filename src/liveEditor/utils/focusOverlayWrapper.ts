import { CslpData } from "../../types/cslp.types";
import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";
import { extractDetailsFromCslp } from "../../utils/cslpdata";
import {
    DATA_CSLP_ATTR_SELECTOR,
    LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX,
} from "./constants";
import { FieldSchemaMap } from "./fieldSchemaMap";
import { cleanIndividualFieldResidual } from "./handleIndividualFields";
import { caretSVG, deleteSVG, moveLeft, moveRight } from "./icon";
import liveEditorPostMessage from "./liveEditorPostMessage";
import { getChildrenDirection } from "./multipleElementAddButton";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

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
    }
}

/**
 * Hides the focus overlay and performs necessary cleanup actions when the user clicks outside of the focused element.
 * @param event - The mouse event that triggered the function.
 * @param elements - An object containing references to the focus overlay wrapper, the previously selected editable DOM element, and the visual editor wrapper.
 */
export function hideFocusOverlay(elements: {
    previousSelectedEditableDOM: Element | null;
    visualEditorWrapper: HTMLDivElement | null;
    visualEditorOverlayWrapper: HTMLDivElement | null;
    focusedToolbar: HTMLDivElement | null;
}): void {
    const {
        previousSelectedEditableDOM,
        visualEditorWrapper,
        visualEditorOverlayWrapper,
        focusedToolbar,
    } = elements;

    if (visualEditorOverlayWrapper) {
        visualEditorOverlayWrapper.classList.remove("visible");

        if (previousSelectedEditableDOM) {
            const pseudoEditableElement = visualEditorWrapper?.querySelector(
                "div.visual-editor__pseudo-editable-element"
            );

            if (
                previousSelectedEditableDOM.hasAttribute("contenteditable") ||
                pseudoEditableElement
            ) {
                const actualEditedElement =
                    pseudoEditableElement ||
                    (previousSelectedEditableDOM as HTMLElement);

                liveEditorPostMessage?.send(
                    LiveEditorPostMessageEvents.UPDATE_FIELD,
                    {
                        data:
                            "innerText" in actualEditedElement
                                ? actualEditedElement.innerText
                                : actualEditedElement.textContent,
                        fieldMetadata: extractDetailsFromCslp(
                            previousSelectedEditableDOM.getAttribute(
                                "data-cslp"
                            ) as string
                        ),
                    }
                );
            }

            cleanIndividualFieldResidual({
                overlayWrapper: visualEditorOverlayWrapper,
                previousSelectedEditableDOM: previousSelectedEditableDOM,
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
    appendFieldPathDropdown(eventDetails, focusedToolbarElement);
    appendMultipleFieldToolbar(eventDetails, focusedToolbarElement);
}
function closeOverlay() {
    document
        .querySelector<HTMLDivElement>(".visual-editor__overlay--top")
        ?.click();
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
        //@ts-ignore
        if (fieldSchema?.multiple) {
            const multipleFieldToolbar = document.createElement("div");
            multipleFieldToolbar.classList.add(
                "visual-editor__focused-toolbar__multiple-field-toolbar"
            );

            const buttonGroup = document.createElement("div");
            buttonGroup.classList.add(
                "visual-editor__focused-toolbar__button-group"
            );

            const deleteSVGButton = document.createElement("button");
            deleteSVGButton.classList.add(
                "visual-editor__button",
                "visual-editor__button--secondary"
            );
            deleteSVGButton.innerHTML = deleteSVG;
            deleteSVGButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteInstance(fieldMetadata);
            });

            const parentPath =
                fieldMetadata?.multipleFieldMetadata?.parentDetails
                    ?.parentCslpValue || "";

            const addDirection = getChildrenDirection(
                targetElement,
                parentPath
            );

            const movePreviousButton = document.createElement("button");
            movePreviousButton.classList.add(
                "visual-editor__button",
                "visual-editor__button--secondary"
            );
            movePreviousButton.innerHTML = moveLeft;
            movePreviousButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMoveInstance(fieldMetadata, "previous");
            });

            const moveNextButton = document.createElement("button");
            moveNextButton.classList.add(
                "visual-editor__button",
                "visual-editor__button--secondary"
            );
            moveNextButton.innerHTML = moveRight;
            moveNextButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMoveInstance(fieldMetadata, "next");
            });

            if (addDirection === "vertical") {
                movePreviousButton.classList.add("visual-editor__rotate--90");
                moveNextButton.classList.add("visual-editor__rotate--90");
            }

            buttonGroup.append(
                movePreviousButton,
                moveNextButton,
                deleteSVGButton
            );
            multipleFieldToolbar.append(buttonGroup);

            focusedToolbarElement.append(multipleFieldToolbar);
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

    const caretIcon = document.createElement("div");
    caretIcon.classList.add(
        "visual-editor__focused-toolbar__field-label-wrapper__caret"
    );
    caretIcon.innerHTML = caretSVG;

    currentFieldItem.append(textDiv, caretIcon);
    focusedToolbarElement.addEventListener("click", (e) => {
        e.preventDefault();

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
        textDiv.innerText = fieldSchema.display_name;
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

function handleDeleteInstance(fieldMetadata: CslpData) {
    liveEditorPostMessage
        ?.send(LiveEditorPostMessageEvents.DELETE_INSTANCE, {
            data:
                fieldMetadata.fieldPathWithIndex +
                "." +
                fieldMetadata.multipleFieldMetadata.index,
            fieldMetadata: fieldMetadata,
        })
        .finally(closeOverlay);
}
function handleMoveInstance(
    fieldMetadata: CslpData,
    direction: "previous" | "next"
) {
    //TODO: Disable first and last instance move
    liveEditorPostMessage
        ?.send(LiveEditorPostMessageEvents.MOVE_INSTANCE, {
            data:
                fieldMetadata.fieldPathWithIndex +
                "." +
                fieldMetadata.multipleFieldMetadata.index,
            direction: direction,
            fieldMetadata: fieldMetadata,
        })
        .finally(closeOverlay);
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
