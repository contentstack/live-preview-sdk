import _ from "lodash";

import { IConfig } from "../types/types";
import { generateStartEditingButton } from "./utils/generateStartEditingButton";
import {
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

import { extractDetailsFromCslp } from "../utils/cslpdata";
import { FieldSchemaMap } from "./utils/fieldSchemaMap";
import { addFocusOverlay, hideFocusOverlay } from "./utils/focusOverlayWrapper";
import { getCsDataOfElement } from "./utils/getCsDataOfElement";
import liveEditorPostMessage from "./utils/liveEditorPostMessage";

export class VisualEditor {
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private previousSelectedEditableDOM: Element | null = null;
    private visualEditorWrapper: HTMLDivElement | null = null;
    private previousHoveredTargetDOM: Element | null = null;

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
        });

        if (!this.previousSelectedEditableDOM) return;
        this.resizeObserver.unobserve(this.previousSelectedEditableDOM);
    };

    constructor(config: IConfig) {
        this.handleMouseHover = this.handleMouseHover.bind(this);
        this.hideCustomCursor = this.hideCustomCursor.bind(this);
        this.appendVisualEditorDOM = this.appendVisualEditorDOM.bind(this);
        this.removeVisualEditorDOM = this.removeVisualEditorDOM.bind(this);
        this.handleMouseDownForVisualEditing =
            this.handleMouseDownForVisualEditing.bind(this);

        this.appendVisualEditorDOM();

        liveEditorPostMessage
            ?.send("init")
            .then(() => {
                window.addEventListener(
                    "click",
                    this.handleMouseDownForVisualEditing
                );
                window.addEventListener("mousemove", this.handleMouseHover);
            })
            .catch(() => {
                generateStartEditingButton(
                    config,
                    this.visualEditorWrapper,
                    this.handleStartEditing
                );
            });
    }

    private handleStartEditing = (event: MouseEvent): void => {
        const startEditingButton = event.currentTarget as HTMLButtonElement;

        const stack = startEditingButton.getAttribute("data-cslp-stack");
        const environment = startEditingButton.getAttribute(
            "data-cslp-environment"
        );
        const branch = startEditingButton.getAttribute(
            "data-cslp-branch"
        ) as string;
        const app_url = startEditingButton.getAttribute(
            "data-cslp-app-host"
        ) as string;

        const completeURL = new URL(
            `/live-editor/stack/${stack}/environment/${environment}/target_url/${encodeURIComponent(
                window.location.href
            )}`,
            app_url
        );

        completeURL.searchParams.set("branch", branch);

        // get the locale from the data cslp attribute
        const elementWithDataCslp = document.querySelector(`[data-cslp]`);

        if (elementWithDataCslp) {
            const cslpData = elementWithDataCslp.getAttribute(
                "data-cslp"
            ) as string;
            const { locale } = extractDetailsFromCslp(cslpData);

            completeURL.searchParams.set("locale", locale);
        } else {
            const locale = startEditingButton.getAttribute(
                "data-cslp-locale"
            ) as string;

            completeURL.searchParams.set("locale", locale);
        }

        startEditingButton.setAttribute("href", completeURL.toString());
    };

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
            });
        }

        this.addOverlay(editableElement);

        await handleIndividualFields(eventDetails, {
            visualEditorWrapper: this.visualEditorWrapper,
            lastEditedField: this.previousSelectedEditableDOM,
        });
        this.previousSelectedEditableDOM = editableElement;
    };

    handleMouseHover = _.throttle(async (event: MouseEvent) => {
        const eventDetails = getCsDataOfElement(event);
        if (!eventDetails) {
            this.hideCustomCursor();

            removeAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                overlayWrapper: this.overlayWrapper,
            });
            return;
        }
        const { editableElement, fieldMetadata } = eventDetails;
        if (this.previousHoveredTargetDOM !== editableElement) {
            this.hideCustomCursor();
            removeAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                overlayWrapper: this.overlayWrapper,
            });
        }

        const { content_type_uid, fieldPath } = fieldMetadata;

        if (this.customCursor) {
            if (!FieldSchemaMap.hasFieldSchema(content_type_uid, fieldPath)) {
                this.customCursor.innerText = "Loading...";
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
                    this.customCursor.innerText = fieldSchema.display_name;
                }
            );

            this.customCursor.classList.add("visible");
            const mouseY = event.clientY;
            const mouseX = event.clientX;

            this.customCursor.style.left = `${mouseX}px`;
            this.customCursor.style.top = `${mouseY}px`;
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

            this.visualEditorWrapper = generateVisualEditorWrapper({
                cursor: this.customCursor,
                overlay: this.overlayWrapper,
            });
        }
    };
    hideCustomCursor = (): void => {
        if (this.customCursor) {
            this.customCursor.classList.remove("visible");
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
