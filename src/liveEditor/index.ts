import _ from "lodash";

import mockData from "./ctmap";
import { IConfig } from "../types/types";
import { generateStartEditingButton } from "./utils/generateStartEditingButton";
import { generateFieldSchemaMap } from "./utils/generateFieldSchemaMap";
import {
    generateVisualEditorCursor,
    generateVisualEditorOverlay,
    generateVisualEditorWrapper,
} from "./utils/generateVisualEditorDom";
import { shouldHideInstanceButton } from "./utils/instanceButtons";
import {
    generateAddButton,
    getChildrenDirection,
    handleAddButtonsForMultiple,
    hideAddInstanceButtons,
} from "./utils/multipleElementAddButton";

const allowedInlineEditable = ["singleline", "multiline"];

export class VisualEditor {
    private fieldSchemaMap: { [key: string]: any } = {};
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private previousSelectedEditableDOM: Element | null = null;
    private replaceAssetButton: HTMLButtonElement | null = null;
    private visualEditorWrapper: HTMLDivElement | null = null;
    private previousButton: HTMLButtonElement = generateAddButton();
    private nextButton: HTMLButtonElement = generateAddButton();
    private previousHoveredTargetDOM: Element | null = null;
    private startEditingButton: HTMLButtonElement | null = null;

    constructor(config: IConfig) {
        Object.keys(mockData).forEach((ctUID: string) => {
            this.fieldSchemaMap[ctUID] = generateFieldSchemaMap(ctUID);
        });

        this.handleDOMEdit = this.handleDOMEdit.bind(this);
        this.handleMouseHover = this.handleMouseHover.bind(this);
        this.hideCustomCursor = this.hideCustomCursor.bind(this);
        this.hideOverlayDOM = this.hideOverlayDOM.bind(this);
        this.appendVisualEditorDOM = this.appendVisualEditorDOM.bind(this);
        this.removeVisualEditorDOM = this.removeVisualEditorDOM.bind(this);
        this.handleMouseDownForVisualEditing =
            this.handleMouseDownForVisualEditing.bind(this);
        this.handleSpecialCaseForVariousFields =
            this.handleSpecialCaseForVariousFields.bind(this);

        window.addEventListener("click", this.handleMouseDownForVisualEditing);
        window.addEventListener("mousemove", this.handleMouseHover);

        this.appendVisualEditorDOM(config);
    }

    // remaining
    getFieldType = (fieldSchema: any) => {
        //TODO: get value for contants

        if (
            fieldSchema.data_type === "text" &&
            fieldSchema?.field_metadata?.multiline
        ) {
            return "multiline";
        }
        if (
            fieldSchema.data_type === "text" &&
            fieldSchema?.field_metadata?.allow_rich_text
        ) {
            return "html_rte";
        }
        if (
            fieldSchema.data_type === "text" &&
            fieldSchema?.field_metadata?.markdown
        ) {
            return "markdown_rte";
        }
        if (fieldSchema.enum) {
            return "select";
        }
        if (fieldSchema.data_type === "text") {
            return "singleline";
        }
    };

    // ! ready for test
    // private handleAddButtonsForMultiple = (editableElement?: Element) => {

    // };

    private handleStartEditing = (_event: any): void => {
        if (!this.startEditingButton) {
            return;
        }

        const stack = this.startEditingButton.getAttribute("data-cslp-stack");
        const environment = this.startEditingButton.getAttribute(
            "data-cslp-environment"
        );
        const branch = this.startEditingButton.getAttribute(
            "data-cslp-branch"
        ) as string;
        const app_url = this.startEditingButton.getAttribute(
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
        if (!eventDetails) {
            return;
        }
        if (this.replaceAssetButton && this.overlayWrapper) {
            this.overlayWrapper.removeChild(this.replaceAssetButton);
            this.replaceAssetButton = null;
        }
        const { editableElement, fieldSchema } = eventDetails;
        const fieldType = this.getFieldType(fieldSchema) || "";

        if (allowedInlineEditable.includes(fieldType)) {
            // Add contentEditable property for Element
            editableElement.setAttribute("contenteditable", "true");
        }

        // Add input eventHandler to support
        editableElement.addEventListener("input", this.handleDOMEdit);

        // Set Overlay visible
        this.addOverlayOnDOM(editableElement, eventDetails);

        this.previousSelectedEditableDOM = editableElement;

        this.handleSpecialCaseForVariousFields(eventDetails);
    };
    private handleSpecialCaseForVariousFields = (
        eventDetails: ReturnType<typeof this.handleCSLPMouseEvent>
    ) => {
        if (!eventDetails) {
            return;
        }
        const { fieldSchema, editableElement } = eventDetails;

        const targetDOMDimension = editableElement.getBoundingClientRect();

        if (fieldSchema.data_type === "file") {
            // Append Replace button for File
            const replaceButton = document.createElement("button");
            replaceButton.classList.add("visual-editor__replace-button");
            replaceButton.innerHTML = `Replace Asset`;
            this.replaceAssetButton = replaceButton;
            this.overlayWrapper?.appendChild(replaceButton);

            this.replaceAssetButton.style.top = `${
                targetDOMDimension.bottom + window.scrollY - 30
            }px`;
            this.replaceAssetButton.style.right = `${
                window.innerWidth - targetDOMDimension.right
            }px`;
        }
        // Handle All RTE Click
        if (
            fieldSchema.data_type === "json" &&
            fieldSchema?.field_metadata?.allow_json_rte
        ) {
            // Intentional
        }
    };

    private getMetadataFromCSLP = (cslpValue: string) => {
        const [content_type_uid, entry_uid, locale, ...fieldPath] =
            cslpValue.split(".");

        const calculatedPath = fieldPath.filter((path) => {
            const isEmpty = _.isNil(path);
            const isNumber = _.isFinite(+path);
            return (!isEmpty && !isNumber) || false;
        });
        return {
            entry_uid,
            content_type_uid,
            locale,
            fieldPath: calculatedPath.join("."),
        };
    };

    handleDOMEdit = (event: any): void => {
        const targetElement = event.target as HTMLElement;
        if (!targetElement) {
            return;
        }
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
            hideAddInstanceButtons({
                eventTarget: event.target,
                visualEditorWrapper: this.visualEditorWrapper,
                nextButton: this.nextButton,
                previousButton: this.previousButton,
                overlayWrapper: this.overlayWrapper,
            });
        }

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
            fieldSchema?.multiple ||
            fieldSchema?.field_metadata?.ref_multiple ||
            fieldSchema?.data_type === "block"
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
    handleCSLPMouseEvent = (event: MouseEvent) => {
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
        const fieldMetadata = this.getMetadataFromCSLP(cslpData);

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
    addOverlayOnDOM = (
        targetDOM: Element,
        eventDetails: ReturnType<typeof this.handleCSLPMouseEvent>
    ): void => {
        if (!targetDOM || !this.overlayWrapper || !eventDetails) {
            return;
        }
        const targetDOMDimension = targetDOM.getBoundingClientRect();

        const { fieldSchema } = eventDetails;

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
        if (
            fieldSchema?.multiple ||
            fieldSchema?.field_metadata?.ref_multiple
        ) {
            handleAddButtonsForMultiple({
                editableElement: eventDetails.editableElement,
                visualEditorWrapper: this.visualEditorWrapper,
                nextButton: this.nextButton,
                previousButton: this.previousButton,
            });
        }
    };
    hideOverlayDOM = (event: MouseEvent): void => {
        const targetElement = event.target as Element;

        if (targetElement.classList.contains("visual-editor__overlay")) {
            this.overlayWrapper?.classList.remove("visible");

            hideAddInstanceButtons({
                eventTarget: null,
                visualEditorWrapper: this.visualEditorWrapper,
                nextButton: this.nextButton,
                previousButton: this.previousButton,
                overlayWrapper: this.overlayWrapper,
            });
            // Remove contentEditable from previous element
            if (this.previousSelectedEditableDOM) {
                this.previousSelectedEditableDOM.removeAttribute(
                    "contenteditable"
                );
                this.previousSelectedEditableDOM.removeEventListener(
                    "input",
                    this.handleDOMEdit
                );
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
