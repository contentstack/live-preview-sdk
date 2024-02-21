import { throttle } from "lodash-es";

import { generateStartEditingButton } from "./utils/generateStartEditingButton";
// import {
//     generateFocusedToolbar,
//     generateVisualEditorCursor,
//     generateVisualEditorOverlay,
//     generateVisualEditorWrapper,
// } from "./utils/generateVisualEditorDom";
import {
    cleanIndividualFieldResidual,
    handleIndividualFields,
} from "./utils/handleIndividualFields";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "./utils/multipleElementAddButton";

import { inIframe } from "../common/inIframe";
import Config from "../configManager/configManager";
import { addCslpOutline } from "../cslp/cslpdata";
import {
    ILivePreviewModeConfig,
    ILivePreviewWindowType,
    IVisualEditorInitEvent,
} from "../types/types";
import { VisualEditorCslpEventDetails } from "./types/liveEditor.types";
import { FieldSchemaMap } from "./utils/fieldSchemaMap";
import {
    addFocusOverlay,
    appendFocusedToolbar,
    hideFocusOverlay,
} from "./utils/focusOverlayWrapper";
import { generateCustomCursor } from "./utils/generateCustomCursor";
import {
    getCsDataOfElement,
    getDOMEditStack,
} from "./utils/getCsDataOfElement";
import { getEntryUidFromCurrentPage } from "./utils/getEntryUidFromCurrentPage";
import { getFieldType } from "./utils/getFieldType";
import { isFieldDisabled } from "./utils/isFieldDisabled";
import liveEditorPostMessage from "./utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./utils/types/postMessage.types";
import {
    useHistoryPostMessageEvent,
    useOnEntryUpdatePostMessageEvent,
} from "../livePreview/eventManager/postMessageEvent.hooks";
import initUI from "./components/initUI";

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
        // this.hideCustomCursor = this.hideCustomCursor.bind(this);
        this.handleCursorPosition = this.handleCursorPosition.bind(this);
        this.resetCustomCursor = this.resetCustomCursor.bind(this);
        // this.appendVisualEditorDOM = this.appendVisualEditorDOM.bind(this);
        this.removeVisualEditorDOM = this.removeVisualEditorDOM.bind(this);
        this.handleMouseClick =
            this.handleMouseClick.bind(this);

        // this.appendVisualEditorDOM();
        
        initUI();
        this.visualEditorWrapper = document.querySelector(".visual-editor__container");
        this.overlayWrapper = document.querySelector(".visual-editor__overlay__wrapper");
        this.customCursor = document.querySelector(".visual-editor__cursor");

        console.log('[IN SDK] : Wrappers', this.visualEditorWrapper, this.overlayWrapper, this.customCursor);
        console.log('[IN SDK] : Wrapper types', typeof this.visualEditorWrapper, typeof this.overlayWrapper, typeof this.customCursor);
        
        this.addFocusedToolbar = this.addFocusedToolbar.bind(this);

        console.log('[IN SDK] : INIT : VisualEditor');
        
        const config = Config.get();
        console.log('[IN SDK] : config object', config);
        if (!config.enable || config.mode < ILivePreviewModeConfig.EDITOR) {
            console.log('[IN SDK] : config RETURN', config);
            return;
        }
        liveEditorPostMessage
            ?.send<IVisualEditorInitEvent>("init", {
                isSSR: Config.get().ssr,
            })
            .then((data) => {
                console.log('[IN SDK] : adv-pos-message : WORKING');
                
                const {
                    windowType = ILivePreviewWindowType.EDITOR,
                    stackDetails,
                } = data;
                Config.set("windowType", windowType);
                Config.set(
                    "stackDetails.masterLocale",
                    stackDetails?.masterLocale || "en-us"
                );
                window.addEventListener(
                    "click",
                    this.handleMouseClick
                );
                window.addEventListener("mousemove", this.handleMouseHover);
                window.addEventListener("mouseover", (event) => {
                    addCslpOutline(event);
                });

                liveEditorPostMessage?.on(
                    LiveEditorPostMessageEvents.GET_ENTRY_UID_IN_CURRENT_PAGE,
                    getEntryUidFromCurrentPage
                );

                // These events are used to sync the data when we made some changes in the entry without invoking live preview module.
                useHistoryPostMessageEvent();
                useOnEntryUpdatePostMessageEvent()
                
            })
            .catch((e) => {
                console.log('[IN SDK] : ', e);
                
                if (!inIframe()) {
                    generateStartEditingButton(this.visualEditorWrapper);
                }
            });
    }

    private handleMouseClick = async (
        event: MouseEvent
    ): Promise<void> => {
        console.log('[IN SDK] : in handleMouseClick');
        
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

    handleMouseHover = throttle(async (event: MouseEvent) => {
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
                    const { isDisabled: fieldDisabled } = isFieldDisabled(
                        fieldSchema,
                        eventDetails
                    );
                    const fieldType = getFieldType(fieldSchema);
                    generateCustomCursor({
                        fieldType,
                        customCursor: this.customCursor,
                        fieldDisabled,
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

    // appendVisualEditorDOM = (): void => {
    //     const visualEditorDOM = document.querySelector(
    //         ".visual-editor__container"
    //     );
    //     if (!visualEditorDOM) {
    //         this.customCursor = generateVisualEditorCursor();
    //         this.overlayWrapper = generateVisualEditorOverlay(this.hideOverlay);
    //         this.focusedToolbar = generateFocusedToolbar();
    //         this.visualEditorWrapper = generateVisualEditorWrapper({
    //             cursor: this.customCursor,
    //             overlay: this.overlayWrapper,
    //             toolbar: this.focusedToolbar,
    //         });
    //     }
    // };

    handleCursorPosition = (event: MouseEvent): void => {
        if (this.customCursor) {
            const mouseY = event.clientY;
            const mouseX = event.clientX;

            this.customCursor.style.left = `${mouseX}px`;
            this.customCursor.style.top = `${mouseY}px`;
        }
    };
    
    // hideCustomCursor = (): void => {
    //     if (this.customCursor) {
    //         this.customCursor.classList.remove("visible");
    //     }
    // };

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
            this.handleMouseClick
        );
        window.removeEventListener("mousemove", this.handleMouseHover);
        this.resizeObserver.disconnect();
        this.removeVisualEditorDOM();
    };
}
