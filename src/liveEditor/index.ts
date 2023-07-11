import _ from "lodash";

import mockData from "./ctmap";
import { IConfig, IStackSdk } from "../utils/types";
import { generateStartEditingButton } from "./utils/generateStartEditingButton";

const RESET =
    "overflow: hidden !important; width: 0 !important; height: 0 !important; padding: 0 !important; border: 0 !important;";

const allowedInlineEditable = ["singleline", "multiline"];

const addButton = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">\n<path d="M10.4688 4.375C10.4688 4.11612 10.259 3.90625 10.0001 3.90625C9.74121 3.90625 9.53135 4.11612 9.53135 4.375V9.27307H4.37402C4.11514 9.27307 3.90527 9.48294 3.90527 9.74182C3.90527 10.0007 4.11514 10.2106 4.37402 10.2106H9.53135V15.625C9.53135 15.8839 9.74121 16.0937 10.0001 16.0937C10.259 16.0937 10.4688 15.8839 10.4688 15.625V10.2106H15.6259C15.8847 10.2106 16.0946 10.0007 16.0946 9.74182C16.0946 9.48294 15.8847 9.27307 15.6259 9.27307H10.4688V4.375Z" fill="#475161"/>\n</svg>`;

export class VisualEditor {
    private fieldSchemaMap: { [key: string]: any } = {};
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private previousSelectedEditableDOM: Element | null = null;
    private replaceButtonAsset: HTMLButtonElement | null = null;
    private visualEditorWrapper: HTMLDivElement | null = null;
    private previousButton: HTMLButtonElement | null = null;
    private nextButton: HTMLButtonElement | null = null;
    private previousHoveredTargetDOM: Element | null = null;
    private startEditingButton: HTMLButtonElement | null = null;

    constructor(config: IConfig, stackSdk: IStackSdk) {
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

        window.addEventListener(
            "mousedown",
            this.handleMouseDownForVisualEditing
        );
        window.addEventListener("mousemove", this.handleMouseHover);

        this.appendVisualEditorDOM(config, stackSdk);
    }
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
    private getChildrenDirection = (
        eventDetails: ReturnType<typeof this.handleCSLPMouseEvent>
    ) => {
        let dir = "none";

        if (!eventDetails) {
            return dir;
        }
        dir = "none";
        const { editableElement } = eventDetails;

        const parentCSLPValue = editableElement.getAttribute(
            "data-cslp-container"
        );
        const parentElement = editableElement.closest(
            `[data-cslp="${parentCSLPValue}"]`
        );

        if (!parentElement) {
            return dir;
        }

        const children = parentElement.querySelectorAll(
            `[data-cslp-container="${parentCSLPValue}"]`
        );
        const firstChildElement = children[0];
        let secondChildElement = children[1];
        let clonedElement;

        if (!firstChildElement) {
            return dir;
        }
        if (!secondChildElement) {
            clonedElement = document.createElement("div");
            clonedElement.setAttribute(
                "class",
                firstChildElement.getAttribute("class") ?? ""
            );
            clonedElement.setAttribute("style", RESET);
            parentElement.appendChild(clonedElement);
            secondChildElement = clonedElement;
        }
        // get horizontal and vertical position differences
        const firstChildBounds = firstChildElement.getBoundingClientRect();
        const siblingBounding = secondChildElement.getBoundingClientRect();
        const deltaX = Math.abs(firstChildBounds.left - siblingBounding.left);
        const deltaY = Math.abs(firstChildBounds.top - siblingBounding.top);

        // if
        dir = deltaX > deltaY ? "horizontal" : "vertical";

        if (clonedElement) {
            parentElement.parentElement?.removeChild(clonedElement);
        }

        return dir;
    };
    private handleAddButtonsForMultiple = (
        eventDetails: ReturnType<typeof this.handleCSLPMouseEvent>
    ) => {
        if (!eventDetails) {
            return;
        }
        const { cslpData, editableElement, fieldSchema } = eventDetails;

        if (!editableElement.getAttribute("data-cslp-container")) {
            return;
        }

        const direction = this.getChildrenDirection(eventDetails);

        if (direction === "none" || !this.visualEditorWrapper) {
            return;
        }

        const targetDOMDimension = editableElement.getBoundingClientRect();

        if (!this.previousButton) {
            const previousButtonDOM = document.createElement("button");
            this.previousButton = previousButtonDOM;
            this.previousButton.innerHTML = addButton;
            previousButtonDOM.classList.add("visual-editor__add-button");
            this.visualEditorWrapper.appendChild(previousButtonDOM);
        }

        if (!this.nextButton) {
            const nextButtonDOM = document.createElement("button");
            this.nextButton = nextButtonDOM;
            this.nextButton.innerHTML = addButton;
            nextButtonDOM.classList.add("visual-editor__add-button");
            this.visualEditorWrapper.appendChild(nextButtonDOM);
        }

        if (direction === "horizontal") {
            const middleHeight =
                targetDOMDimension.top +
                (targetDOMDimension.bottom - targetDOMDimension.top) / 2 +
                window.scrollY;
            this.previousButton.style.left = `${targetDOMDimension.left}px`;
            this.previousButton.style.top = `${middleHeight}px`;

            this.nextButton.style.left = `${targetDOMDimension.right}px`;
            this.nextButton.style.top = `${middleHeight}px`;
        } else {
            const middleWidth =
                targetDOMDimension.left +
                (targetDOMDimension.right - targetDOMDimension.left) / 2;
            this.previousButton.style.left = `${middleWidth}px`;
            this.previousButton.style.top = `${
                targetDOMDimension.top + window.scrollY
            }px`;

            this.nextButton.style.left = `${middleWidth}px`;
            this.nextButton.style.top = `${
                targetDOMDimension.bottom + window.scrollY
            }px`;
        }
    };

    private IsInstanceOfMultiple = (path: string) => {
        const arrayPath = path.split(".");
        if (!arrayPath.length) {
            return false;
        }
        const fieldPath = arrayPath.at(-1);
        if (!fieldPath) {
            return false;
        }

        return _.isFinite(+fieldPath);
    };

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
        if (this.replaceButtonAsset && this.overlayWrapper) {
            this.overlayWrapper.removeChild(this.replaceButtonAsset);
            this.replaceButtonAsset = null;
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
            this.replaceButtonAsset = replaceButton;
            this.overlayWrapper?.appendChild(replaceButton);

            this.replaceButtonAsset.style.top = `${
                targetDOMDimension.bottom + window.scrollY - 30
            }px`;
            this.replaceButtonAsset.style.right = `${
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
        // handle throttle

        const eventDetails = this.handleCSLPMouseEvent(event);
        if (!eventDetails) {
            this.hideCustomCursor();
            this.hideAddInstanceButtons(event.target);
            return;
        }
        const { fieldSchema, editableElement } = eventDetails;
        if (this.previousHoveredTargetDOM !== editableElement) {
            this.hideAddInstanceButtons(event.target);
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
            this.handleAddButtonsForMultiple(eventDetails);
        } else {
            this.hideAddInstanceButtons(event.target);
        }
        this.previousHoveredTargetDOM = editableElement;
    }, 10);
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
    appendVisualEditorDOM = (config: IConfig, stack: IStackSdk): void => {
        const visualEditorDOM = document.querySelector(
            ".visual-editor__container"
        );
        if (!visualEditorDOM) {
            const visualEditorDOM = document.createElement("div");
            this.visualEditorWrapper = visualEditorDOM;
            visualEditorDOM.classList.add("visual-editor__container");

            const customVisualCursor = document.createElement("div");
            customVisualCursor.classList.add("visual-editor__cursor");
            this.customCursor = customVisualCursor;
            window.document.body.appendChild(visualEditorDOM);
            visualEditorDOM.appendChild(customVisualCursor);

            const visualEditorOverlayWrapper = document.createElement("div");
            visualEditorOverlayWrapper.classList.add(
                "visual-editor__overlay__wrapper"
            );

            visualEditorOverlayWrapper.innerHTML = `
                <div class="visual-editor__overlay visual-editor__overlay--top"></div>
                <div class="visual-editor__overlay visual-editor__overlay--left"></div>
                <div class="visual-editor__overlay visual-editor__overlay--right"></div>
                <div class="visual-editor__overlay visual-editor__overlay--bottom"></div>
                <div class="visual-editor__overlay--outline"></div>
            `;
            this.overlayWrapper = visualEditorOverlayWrapper;
            visualEditorDOM.appendChild(visualEditorOverlayWrapper);

            visualEditorOverlayWrapper.addEventListener(
                "mousedown",
                this.hideOverlayDOM
            );
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
            this.handleAddButtonsForMultiple(eventDetails);
        }
    };
    hideOverlayDOM = (event: MouseEvent): void => {
        const targetElement = event.target as Element;

        if (targetElement.classList.contains("visual-editor__overlay")) {
            this.overlayWrapper?.classList.remove("visible");

            this.hideAddInstanceButtons(null);
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
    hideAddInstanceButtons = (eventTarget: EventTarget | null): void => {
        if (
            !this.visualEditorWrapper ||
            !this.previousButton ||
            !this.nextButton
        ) {
            return;
        }
        if (
            eventTarget &&
            (this.previousButton.contains(eventTarget as Node) ||
                this.nextButton.contains(eventTarget as Node))
        ) {
            return;
        }
        if (this?.overlayWrapper?.classList.contains("visible")) {
            return;
        }
        if (this.previousButton) {
            this.visualEditorWrapper.removeChild(this.previousButton);
            this.previousButton = null;
        }
        if (this.nextButton) {
            this.visualEditorWrapper.removeChild(this.nextButton);
            this.nextButton = null;
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

export const generateFieldSchemaMap = (ctUID: string) => {
    const pageCT = mockData[ctUID];
    const getFieldSchemaMap: ITraverseSchemaVisitor = {
        fieldMap: {},
        should_visit: (_fieldSchema, _path) => {
            return true;
        },
        visit: function (fieldSchema, path) {
            this.fieldMap[path] = fieldSchema;
            if (fieldSchema.data_type === "link") {
                //handle special key for special fields
                this.fieldMap[`${path}.title`] = fieldSchema;
                this.fieldMap[`${path}.url`] = fieldSchema;
            }
            if (fieldSchema.data_type === "file") {
                this.fieldMap[`${path}.url`] = fieldSchema;
            }
            if (fieldSchema.data_type === "blocks") {
                if (!fieldSchema.blocks) {
                    return;
                }
                fieldSchema.blocks.map((block: any) => {
                    this.fieldMap[`${path}.${block.uid}`] = {
                        ...block,
                        data_type: "block",
                        display_name: block.title,
                    };
                });
            }
        },
    };
    traverseSchema(pageCT.schema, [getFieldSchemaMap]);
    return getFieldSchemaMap.fieldMap;
};

export interface ITraverseSchemaVisitor {
    should_visit: (fieldSchema: any, path: string) => boolean;
    visit: (fieldSchema: any, path: string) => void;
    [key: string]: any;
}
export const traverseSchema = (
    schema: any,
    visitors: Array<ITraverseSchemaVisitor>
) => {
    function genPath(prefix: string, path: string) {
        return _.isEmpty(prefix) ? path : [prefix, path].join(".");
    }

    function traverse(fields: any, path: string) {
        path = path || "";
        for (const element of fields) {
            const field = element;
            const currPath = genPath(path, field.uid);

            visitors.forEach((visitor) => {
                if (visitor.should_visit(field, currPath)) {
                    visitor.visit(field, currPath);
                }
            });

            if (field.data_type === "group") traverse(field.schema, currPath);

            if (
                field.data_type === "global_field" &&
                _.isUndefined(field.schema) === false &&
                _.isEmpty(field.schema) === false
            )
                traverse(field.schema, currPath);
            if (field.data_type === "blocks") {
                field.blocks.forEach(function (block: any) {
                    if (block.schema)
                        traverse(block.schema, currPath + "." + block.uid);
                });
            }
            if (field.data_type === "experience_container") {
                field.variations.forEach(function (variation: any) {
                    if (variation.schema)
                        traverse(
                            variation.schema,
                            currPath + "." + variation.uid
                        );
                });
            }
        }
    }
    traverse(schema, "");
};
