import _ from "lodash";

import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { IConfig } from "../types/types";
import { extractDetailsFromCslp } from "../utils/cslpdata";
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
    generateAddButton,
    handleAddButtonsForMultiple,
    hideAddInstanceButtons,
} from "./utils/multipleElementAddButton";
import {
    ISchemaFieldMap,
    ISchemaIndividualFieldMap,
} from "./utils/types/index.types";

export class VisualEditor {
    private fieldSchemaMap: Record<string, ISchemaIndividualFieldMap> = {};
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private previousSelectedEditableDOM: Element | null = null;
    private visualEditorWrapper: HTMLDivElement | null = null;
    private previousButton: HTMLButtonElement = generateAddButton();
    private nextButton: HTMLButtonElement = generateAddButton();
    private previousHoveredTargetDOM: Element | null = null;
    private startEditingButton: HTMLButtonElement | null = null;

    constructor(config: IConfig) {
        Object.keys(mockData).forEach((ctUID: string) => {
            this.fieldSchemaMap[ctUID] = generateFieldSchemaMap(ctUID);
        });

        this.handleMouseHover = this.handleMouseHover.bind(this);
        this.hideCustomCursor = this.hideCustomCursor.bind(this);
        this.hideOverlayDOM = this.hideOverlayDOM.bind(this);
        this.appendVisualEditorDOM = this.appendVisualEditorDOM.bind(this);
        this.removeVisualEditorDOM = this.removeVisualEditorDOM.bind(this);
        this.handleMouseDownForVisualEditing =
            this.handleMouseDownForVisualEditing.bind(this);

        window.addEventListener("click", this.handleMouseDownForVisualEditing);
        window.addEventListener("mousemove", this.handleMouseHover);

        this.appendVisualEditorDOM(config);
    }

    private handleStartEditing = (event: MouseEvent): void => {
        const startEditingButton = event.target as HTMLButtonElement;

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
        const eventDetails = this.handleCSLPMouseEvent(event);
        if (
            !eventDetails ||
            !this.overlayWrapper ||
            !this.visualEditorWrapper
        ) {
            return;
        }
        const { editableElement } = eventDetails;

        this.previousSelectedEditableDOM = editableElement;
        this.addOverlayOnDOM(editableElement);

        handleIndividualFields(eventDetails, {
            overlayWrapper: this.overlayWrapper,
            visualEditorWrapper: this.visualEditorWrapper,
            nextButton: this.nextButton,
            previousButton: this.previousButton,
        });
    };

    handleMouseHover = _.throttle((event: MouseEvent) => {
        const eventDetails = this.handleCSLPMouseEvent(event);
        if (!eventDetails) {
            this.hideCustomCursor();
            hideAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                nextButton: this.nextButton,
                previousButton: this.previousButton,
                overlayWrapper: this.overlayWrapper,
            });
            return;
        }
        const { fieldSchema, editableElement } = eventDetails;
        if (this.previousHoveredTargetDOM !== editableElement) {
            this.hideCustomCursor();
            hideAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                nextButton: this.nextButton,
                previousButton: this.previousButton,
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
            handleAddButtonsForMultiple({
                editableElement: eventDetails.editableElement,
                visualEditorWrapper: this.visualEditorWrapper,
                nextButton: this.nextButton,
                previousButton: this.previousButton,
            });
        } else {
            hideAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                nextButton: this.nextButton,
                previousButton: this.previousButton,
                overlayWrapper: this.overlayWrapper,
            });
        }
        this.previousHoveredTargetDOM = editableElement;
    }, 10);

    /**
     * Get the details of the CSLP tag of the target.
     * @param event Mouse event
     * @returns Details of the closest data cslp
     */
    handleCSLPMouseEvent = (
        event: MouseEvent
    ): VisualEditorCslpEventDetails | undefined => {
        const targetElement = event.target as HTMLElement;
        if (!targetElement) {
            return;
        }
        const editableElement = targetElement.closest("[data-cslp]");
        if (!editableElement) {
            return;
        }
        const cslpData = editableElement.getAttribute("data-cslp");
        if (!cslpData) {
            return;
        }
        const fieldMetadata = extractDetailsFromCslp(cslpData);

        const fieldSchema =
            this.fieldSchemaMap[fieldMetadata.content_type_uid][
                fieldMetadata.fieldPath
            ];

        return {
            editableElement: editableElement,
            cslpData,
            fieldMetadata,
            fieldSchema,
        };
    };

    appendVisualEditorDOM = (config: IConfig): void => {
        const visualEditorDOM = document.querySelector(
            ".visual-editor__container"
        );
        if (!visualEditorDOM) {
            this.customCursor = generateVisualEditorCursor();
            this.overlayWrapper = generateVisualEditorOverlay(
                this.hideOverlayDOM
            );

            this.visualEditorWrapper = generateVisualEditorWrapper({
                cursor: this.customCursor,
                overlay: this.overlayWrapper,
            });
        }

        const startEditingButton = generateStartEditingButton(
            config,
            this.visualEditorWrapper,
            this.handleStartEditing
        );

        if (startEditingButton) {
            this.startEditingButton = startEditingButton;
        }
    };

    // done
    addOverlayOnDOM = (targetDOM: Element): void => {
        if (!targetDOM || !this.overlayWrapper) {
            return;
        }
        const targetDOMDimension = targetDOM.getBoundingClientRect();

        this.overlayWrapper.classList.add("visible");

        const distanceFromTop = targetDOMDimension.top + window.scrollY;
        const topOverlayDOM = this.overlayWrapper.querySelector(
            ".visual-editor__overlay--top"
        ) as HTMLDivElement | null;

        if (topOverlayDOM) {
            topOverlayDOM.style.top = "0";
            topOverlayDOM.style.left = "0";
            topOverlayDOM.style.width = "100%";
            topOverlayDOM.style.height = `${distanceFromTop}px`;
        }

        const bottomOverlayDOM = this.overlayWrapper.querySelector(
            ".visual-editor__overlay--bottom"
        ) as HTMLDivElement | null;
        if (bottomOverlayDOM) {
            bottomOverlayDOM.style.top = `${
                targetDOMDimension.bottom + window.scrollY
            }px`;
            bottomOverlayDOM.style.height = `${
                window.document.body.scrollHeight -
                targetDOMDimension.bottom -
                window.scrollY
            }px`;
            bottomOverlayDOM.style.left = "0";
            bottomOverlayDOM.style.width = "100%";
        }

        const leftOverlayDOM = this.overlayWrapper.querySelector(
            ".visual-editor__overlay--left"
        ) as HTMLDivElement | null;
        if (leftOverlayDOM) {
            leftOverlayDOM.style.left = "0";
            leftOverlayDOM.style.top = `${distanceFromTop}px`;
            leftOverlayDOM.style.height = `${targetDOMDimension.height}px`;
            leftOverlayDOM.style.width = `${targetDOMDimension.left}px`;
        }

        const rightOverlayDOM = this.overlayWrapper.querySelector(
            ".visual-editor__overlay--right"
        ) as HTMLDivElement | null;
        if (rightOverlayDOM) {
            rightOverlayDOM.style.left = `${targetDOMDimension.right}px`;
            rightOverlayDOM.style.top = `${distanceFromTop}px`;
            rightOverlayDOM.style.height = `${targetDOMDimension.height}px`;
            rightOverlayDOM.style.width = `${
                window.innerWidth - targetDOMDimension.right
            }px`;
        }

        const outlineDOM = this.overlayWrapper.querySelector(
            ".visual-editor__overlay--outline"
        ) as HTMLDivElement | null;
        if (outlineDOM) {
            outlineDOM.style.top = `${
                targetDOMDimension.top + window.scrollY
            }px`;
            outlineDOM.style.height = `${targetDOMDimension.height}px`;
            outlineDOM.style.width = `${targetDOMDimension.width}px`;
            outlineDOM.style.left = `${targetDOMDimension.left}px`;
        }
    };
    hideOverlayDOM = (event: MouseEvent): void => {
        const targetElement = event.target as Element;

        if (!this.overlayWrapper) return;

        if (targetElement.classList.contains("visual-editor__overlay")) {
            this.overlayWrapper.classList.remove("visible");

            if (this.previousSelectedEditableDOM) {
                cleanIndividualFieldResidual({
                    overlayWrapper: this.overlayWrapper,
                    previousSelectedEditableDOM:
                        this.previousSelectedEditableDOM,
                    previousButton: this.previousButton,
                    nextButton: this.nextButton,
                    visualEditorWrapper: this.visualEditorWrapper,
                });
            }
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
}
