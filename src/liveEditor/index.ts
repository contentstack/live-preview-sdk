import _ from "lodash";

import { generateStartEditingButton } from "./utils/generateStartEditingButton";
import {
    generateFocusedToolbar,
    generateVisualEditorCursor,
    generateVisualEditorOverlay,
    generateVisualEditorWrapper,
} from "./utils/generateVisualEditorDom";
import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "./utils/handleIndividualFields";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "./utils/multipleElementAddButton";

import { FieldSchemaMap } from "./utils/fieldSchemaMap";
import {
    addFocusOverlay,
    appendFocusedToolbar,
    hideFocusOverlay,
} from "./utils/focusOverlayWrapper";
import {
    getCsDataOfElement,
    getDOMEditStack,
} from "./utils/getCsDataOfElement";
import liveEditorPostMessage from "./utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./utils/types/postMessage.types";
import { addCslpOutline, extractDetailsFromCslp } from "../utils/cslpdata";
import Config from "../utils/configHandler";
import { ILivePreviewWindowType } from "../types/types";
import { inIframe } from "../utils/inIframe";
import { getFieldType } from "./utils/getFieldType";
import { generateCustomCursor } from "./utils/generateCustomCursor";
import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { getEntryUidFromCurrentPage } from "./utils/getEntryUidFromCurrentPage";

export class VisualEditor {
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private previousSelectedEditableDOM: Element | null = null;
    private visualEditorWrapper: HTMLDivElement | null = null;
    private previousHoveredTargetDOM: Element | null = null;
    private focusedToolbar: HTMLDivElement | null = null;

    private resizeObserver = new ResizeObserver(([entry]) => {
        if (!this.overlayWrapper || !this.previousSelectedEditableDOM) return;

        if (!entry.target.isSameNode(this.previousSelectedEditableDOM)) return;

        addFocusOverlay(this.previousSelectedEditableDOM, this.overlayWrapper);
    });

    private addOverlay(editableElement: Element | null) {
        if (!this.overlayWrapper || !editableElement) return;

        addFocusOverlay(editableElement, this.overlayWrapper);
        this.resizeObserver.observe(editableElement);
    }

    private hideOverlay = (
        visualEditorOverlayWrapper: HTMLDivElement | null = null
    ) => {
        hideFocusOverlay({
            previousSelectedEditableDOM: this.previousSelectedEditableDOM,
            visualEditorWrapper: this.visualEditorWrapper,
            visualEditorOverlayWrapper,
            focusedToolbar: this.focusedToolbar,
        });

        if (!this.previousSelectedEditableDOM) return;
        this.resizeObserver.unobserve(this.previousSelectedEditableDOM);
        this.previousSelectedEditableDOM = null;
    };

    private addFocusedToolbar(eventDetails: VisualEditorCslpEventDetails) {
        const { editableElement } = eventDetails;

        if (!editableElement || !this.focusedToolbar) return;

        // Don't append again if already present
        if (
            this.previousSelectedEditableDOM &&
            this.previousSelectedEditableDOM === editableElement
        ) {
            return;
        }

        appendFocusedToolbar(eventDetails, this.focusedToolbar);
    }

    constructor() {
        this.handleMouseHover = this.handleMouseHover.bind(this);
        this.hideCustomCursor = this.hideCustomCursor.bind(this);
        this.handleCursorPosition = this.handleCursorPosition.bind(this);
        this.resetCustomCursor = this.resetCustomCursor.bind(this);
        this.appendVisualEditorDOM = this.appendVisualEditorDOM.bind(this);
        this.removeVisualEditorDOM = this.removeVisualEditorDOM.bind(this);
        this.handleMouseDownForVisualEditing =
            this.handleMouseDownForVisualEditing.bind(this);

        this.appendVisualEditorDOM();
        this.addFocusedToolbar = this.addFocusedToolbar.bind(this);

        liveEditorPostMessage
            ?.send<{ windowType: ILivePreviewWindowType }>("init")
            .then((data) => {
                const { windowType = ILivePreviewWindowType.EDITOR } = data;
                Config.set("windowType", windowType);
                window.addEventListener(
                    "click",
                    this.handleMouseDownForVisualEditing
                );
                window.addEventListener("mousemove", this.handleMouseHover);
                window.addEventListener("mouseover", (event) => {
                    addCslpOutline(event);
                });

                liveEditorPostMessage?.on(
                    LiveEditorPostMessageEvents.GET_ENTRY_UID_IN_CURRENT_PAGE,
                    getEntryUidFromCurrentPage
                );
            })
            .catch(() => {
                if (!inIframe()) {
                    generateStartEditingButton(this.visualEditorWrapper);
                }
            });
    }

    private handleMouseDownForVisualEditing = async (
        event: MouseEvent
    ): Promise<void> => {
        event.preventDefault();
        const eventDetails = getCsDataOfElement(event);
        if (
            !eventDetails ||
            !this.overlayWrapper ||
            !this.visualEditorWrapper
        ) {
            return;
        }
        const { editableElement } = eventDetails;

        if (
            this.previousSelectedEditableDOM &&
            this.previousSelectedEditableDOM !== editableElement
        ) {
            cleanIndividualFieldResidual({
                overlayWrapper: this.overlayWrapper,
                previousSelectedEditableDOM: this.previousSelectedEditableDOM,
                visualEditorWrapper: this.visualEditorWrapper,
                focusedToolbar: this.focusedToolbar,
            });
        }

        this.addOverlay(editableElement);
        this.addFocusedToolbar(eventDetails);
        liveEditorPostMessage?.send(LiveEditorPostMessageEvents.FOCUS_FIELD, {
            DOMEditStack: getDOMEditStack(editableElement),
        });

        await handleIndividualFields(eventDetails, {
            visualEditorWrapper: this.visualEditorWrapper,
            lastEditedField: this.previousSelectedEditableDOM,
        });
        this.previousSelectedEditableDOM = editableElement;
    };

    handleMouseHover = _.throttle(async (event: MouseEvent) => {
        const eventDetails = getCsDataOfElement(event);
        if (!eventDetails) {
            this.resetCustomCursor();

            removeAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                overlayWrapper: this.overlayWrapper,
            });
            this.handleCursorPosition(event);
            return;
        }
        const { editableElement, fieldMetadata } = eventDetails;
        if (this.previousHoveredTargetDOM !== editableElement) {
            this.resetCustomCursor();
            removeAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                overlayWrapper: this.overlayWrapper,
            });
        }

        const { content_type_uid, fieldPath } = fieldMetadata;

        if (this.customCursor) {
            if (!FieldSchemaMap.hasFieldSchema(content_type_uid, fieldPath)) {
                generateCustomCursor({
                    fieldType: "loading",
                    customCursor: this.customCursor,
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
                    if (!this.customCursor) return;
                    const fieldType = getFieldType(fieldSchema);
                    generateCustomCursor({
                        fieldType,
                        customCursor: this.customCursor,
                    });
                }
            );

            this.customCursor.classList.add("visible");
            this.handleCursorPosition(event);
        }

        if (this.previousHoveredTargetDOM === editableElement) {
            return;
        }

        const fieldSchema = await FieldSchemaMap.getFieldSchema(
            content_type_uid,
            fieldPath
        );

        if (
            fieldSchema.data_type === "block" ||
            fieldSchema.multiple ||
            (fieldSchema.data_type === "reference" &&
                // @ts-ignore
                fieldSchema.field_metadata.ref_multiple)
        ) {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: editableElement,
                visualEditorWrapper: this.visualEditorWrapper,
            });
        } else {
            removeAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                overlayWrapper: this.overlayWrapper,
            });
        }
        this.previousHoveredTargetDOM = editableElement;
    }, 10);

    appendVisualEditorDOM = (): void => {
        const visualEditorDOM = document.querySelector(
            ".visual-editor__container"
        );
        if (!visualEditorDOM) {
            this.customCursor = generateVisualEditorCursor();
            this.overlayWrapper = generateVisualEditorOverlay(this.hideOverlay);
            this.focusedToolbar = generateFocusedToolbar();
            this.visualEditorWrapper = generateVisualEditorWrapper({
                cursor: this.customCursor,
                overlay: this.overlayWrapper,
                toolbar: this.focusedToolbar,
            });
        }
    };
    handleCursorPosition = (event: MouseEvent): void => {
        if (this.customCursor) {
            const mouseY = event.clientY;
            const mouseX = event.clientX;

            this.customCursor.style.left = `${mouseX}px`;
            this.customCursor.style.top = `${mouseY}px`;
        }
    };
    hideCustomCursor = (): void => {
        if (this.customCursor) {
            this.customCursor.classList.remove("visible");
        }
    };
    resetCustomCursor = (): void => {
        if (this.customCursor) {
            generateCustomCursor({
                fieldType: "empty",
                customCursor: this.customCursor,
            });
        }
    };
    removeVisualEditorDOM = (): void => {
        const visualEditorDOM = document.querySelector(
            ".visual-editor__container"
        );
        if (visualEditorDOM) {
            window.document.body.removeChild(visualEditorDOM);
        }
        this.customCursor = null;
    };

    // TODO: write test cases
    destroy = (): void => {
        window.removeEventListener(
            "click",
            this.handleMouseDownForVisualEditing
        );
        window.removeEventListener("mousemove", this.handleMouseHover);
        this.resizeObserver.disconnect();
        this.removeVisualEditorDOM();
    };
}
