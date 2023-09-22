import _ from "lodash";

import { IConfig } from "../types/types";
import mockData from "./ctmap";
import { generateFieldSchemaMap } from "./utils/generateFieldSchemaMap";
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

import { addFocusOverlay, hideFocusOverlay } from "./utils/focusOverlayWrapper";
import { getCsDataOfElement } from "./utils/getCsDataOfElement";
import { ISchemaIndividualFieldMap } from "./utils/types/index.types";

export class VisualEditor {
    private fieldSchemaMap: Record<string, ISchemaIndividualFieldMap> = {};
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private previousSelectedEditableDOM: Element | null = null;
    private visualEditorWrapper: HTMLDivElement | null = null;
    private previousHoveredTargetDOM: Element | null = null;

    constructor(config: IConfig) {
        Object.keys(mockData).forEach((ctUID: string) => {
            this.fieldSchemaMap[ctUID] = generateFieldSchemaMap(ctUID);
        });

        this.handleMouseHover = this.handleMouseHover.bind(this);
        this.hideCustomCursor = this.hideCustomCursor.bind(this);
        this.appendVisualEditorDOM = this.appendVisualEditorDOM.bind(this);
        this.removeVisualEditorDOM = this.removeVisualEditorDOM.bind(this);
        this.handleMouseDownForVisualEditing =
            this.handleMouseDownForVisualEditing.bind(this);

        window.addEventListener("click", this.handleMouseDownForVisualEditing);
        window.addEventListener("mousemove", this.handleMouseHover);

        this.appendVisualEditorDOM(config);
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

        //TODO: Check if branch is mandatory
        const searchParams = new URLSearchParams({
            branch: branch,
        });
        const completeURL = new URL(
            `/#!/live-editor/stack/${stack}/environment/${environment}/target_url/${encodeURIComponent(
                window.location.href
            )}?${searchParams.toString()}`,
            app_url
        );

        window.location.replace(completeURL);
    };

    private handleMouseDownForVisualEditing = (event: MouseEvent): void => {
        event.preventDefault();
        const eventDetails = getCsDataOfElement(event, this.fieldSchemaMap);
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

        addFocusOverlay(editableElement, this.overlayWrapper);

        handleIndividualFields(eventDetails, {
            visualEditorWrapper: this.visualEditorWrapper,
            lastEditedField: this.previousSelectedEditableDOM,
        });
        this.previousSelectedEditableDOM = editableElement;
    };

    handleMouseHover = _.throttle((event: MouseEvent) => {
        const eventDetails = getCsDataOfElement(event, this.fieldSchemaMap);
        if (!eventDetails) {
            this.hideCustomCursor();

            removeAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                overlayWrapper: this.overlayWrapper,
            });
            return;
        }
        const { fieldSchema, editableElement } = eventDetails;
        if (this.previousHoveredTargetDOM !== editableElement) {
            this.hideCustomCursor();
            removeAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                overlayWrapper: this.overlayWrapper,
            });
        }

        if (!fieldSchema) return;

        if (this.customCursor) {
            this.customCursor.classList.add("visible");
            this.customCursor.innerText = fieldSchema.display_name;
            const mouseY = event.clientY;
            const mouseX = event.clientX;

            this.customCursor.style.left = `${mouseX}px`;
            this.customCursor.style.top = `${mouseY}px`;
        }

        if (this.previousHoveredTargetDOM === editableElement) {
            return;
        }
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

    appendVisualEditorDOM = (config: IConfig): void => {
        const visualEditorDOM = document.querySelector(
            ".visual-editor__container"
        );
        if (!visualEditorDOM) {
            this.customCursor = generateVisualEditorCursor();
            this.overlayWrapper = generateVisualEditorOverlay((event) =>
                hideFocusOverlay(event, {
                    previousSelectedEditableDOM:
                        this.previousSelectedEditableDOM,
                    visualEditorWrapper: this.visualEditorWrapper,
                })
            );

            this.visualEditorWrapper = generateVisualEditorWrapper({
                cursor: this.customCursor,
                overlay: this.overlayWrapper,
            });
        }

        generateStartEditingButton(
            config,
            this.visualEditorWrapper,
            this.handleStartEditing
        );
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
        this.removeVisualEditorDOM();
    };
}
