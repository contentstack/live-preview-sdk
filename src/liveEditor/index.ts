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
import { getFieldType } from "./utils/getFieldType";
import {
    generateAddButton,
    handleAddButtonsForMultiple,
    hideAddInstanceButtons,
} from "./utils/multipleElementAddButton";
import {
    ISchemaFieldMap,
    ISchemaIndividualFieldMap,
} from "./utils/types/index.types";
import { handleFieldKeyDown } from "./utils/handleFieldMouseDown";
import { LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY } from "./utils/constants";

const allowedInlineEditable = ["singleline", "multiline", "number"];

export class VisualEditor {
    private fieldSchemaMap: Record<string, ISchemaIndividualFieldMap> = {};
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private previousSelectedEditableDOM: Element | null = null;
    private previousSelectedEditableDOMFieldSchema: ISchemaFieldMap | undefined;
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
        if (!eventDetails) {
            return;
        }
        if (this.replaceAssetButton && this.overlayWrapper) {
            this.overlayWrapper.removeChild(this.replaceAssetButton);
            this.replaceAssetButton = null;
        }
        const { editableElement, fieldSchema } = eventDetails;
        const fieldType = getFieldType(fieldSchema);

        if (
            allowedInlineEditable.includes(fieldType) &&
            // @ts-ignore
            !fieldSchema.multiple
        ) {
            // Add contentEditable property for Element
            editableElement.setAttribute("contenteditable", "true");
            editableElement.setAttribute(
                LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY,
                fieldType
            );
        }

        // Add input eventHandler to support
        editableElement.addEventListener("input", this.handleDOMEdit);
        editableElement.addEventListener("keydown", handleFieldKeyDown);

        // Set Overlay visible
        this.addOverlayOnDOM(editableElement, eventDetails);

        this.previousSelectedEditableDOM = editableElement;

        this.handleSpecialCaseForVariousFields(eventDetails);
    };
    private handleSpecialCaseForVariousFields = (
        eventDetails: VisualEditorCslpEventDetails
    ) => {
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
            // @ts-ignore
            fieldSchema?.field_metadata?.allow_json_rte
        ) {
            // Intentional
        }
    };

    handleDOMEdit = (e: Event): void => {
        const event = e as InputEvent;
        const targetElement = event.target as HTMLElement;

        if (event.type === "input") {
            if (
                this.previousSelectedEditableDOMFieldSchema?.data_type ===
                "number"
            ) {
                //
            }
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
        this.previousSelectedEditableDOMFieldSchema = fieldSchema;
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
    addOverlayOnDOM = (
        targetDOM: Element,
        eventDetails: VisualEditorCslpEventDetails
    ): void => {
        if (!targetDOM || !this.overlayWrapper) {
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
            fieldSchema?.data_type === "block" || // originally, this condition was not herer
            fieldSchema?.multiple ||
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
                console.log(
                    this.previousSelectedEditableDOM.getAttribute(
                        LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
                    )
                );
                this.previousSelectedEditableDOM.removeAttribute(
                    LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
                );

                this.previousSelectedEditableDOM.removeEventListener(
                    "input",
                    this.handleDOMEdit
                );

                this.previousSelectedEditableDOM.removeEventListener(
                    "keydown",
                    handleFieldKeyDown
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
