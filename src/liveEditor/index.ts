import { throttle } from "lodash-es";

import { generateStartEditingButton } from "./utils/generateStartEditingButton";
// import {
//     generateFocusedToolbar,
//     generateVisualEditorCursor,
//     generateVisualEditorOverlay,
//     generateVisualEditorWrapper,
// } from "./utils/generateVisualEditorDom";
// import {
//     cleanIndividualFieldResidual,
//     handleIndividualFields,
// } from "./utils/handleIndividualFields";
// import {
//     handleAddButtonsForMultiple,
//     removeAddInstanceButtons,
// } from "./utils/multipleElementAddButton";

import { inIframe } from "../common/inIframe";
import Config from "../configManager/configManager";
// import { addCslpOutline } from "../cslp/cslpdata";
import {
    ILivePreviewModeConfig,
    ILivePreviewWindowType,
    IVisualEditorInitEvent,
} from "../types/types";
// import { VisualEditorCslpEventDetails } from "./types/liveEditor.types";
// import { FieldSchemaMap } from "./utils/fieldSchemaMap";
import {
    addFocusOverlay,
    // appendFocusedToolbar,
    hideFocusOverlay,
} from "./utils/focusOverlayWrapper";
// import { generateCustomCursor } from "./utils/generateCustomCursor";
// import {
//     getCsDataOfElement,
//     getDOMEditStack,
// } from "./utils/getCsDataOfElement";
import { getEntryUidFromCurrentPage } from "./utils/getEntryUidFromCurrentPage";
// import { getFieldType } from "./utils/getFieldType";
// import { isFieldDisabled } from "./utils/isFieldDisabled";
import liveEditorPostMessage from "./utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./utils/types/postMessage.types";
import {
    useHistoryPostMessageEvent,
    useOnEntryUpdatePostMessageEvent,
} from "../livePreview/eventManager/postMessageEvent.hooks";
import initUI from "./components/initUI";
import initEventListeners from "./utils/listeners/initEventListeners";

export class VisualEditor {
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private previousSelectedEditableDOM: HTMLDivElement | null = null;
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

    // private hideOverlay = (
    //     visualEditorOverlayWrapper: HTMLDivElement | null = null
    // ) => {
    //     hideFocusOverlay({
    //         previousSelectedEditableDOM: this.previousSelectedEditableDOM,
    //         visualEditorWrapper: this.visualEditorWrapper,
    //         visualEditorOverlayWrapper,
    //         focusedToolbar: this.focusedToolbar,
    //     });

    //     if (!this.previousSelectedEditableDOM) return;
    //     this.resizeObserver.unobserve(this.previousSelectedEditableDOM);
    //     this.previousSelectedEditableDOM = null;
    // };

    constructor() {
        this.removeVisualEditorDOM = this.removeVisualEditorDOM.bind(this);
        initUI({
            previousSelectedEditableDOM: this.previousSelectedEditableDOM,
            resizeObserver: this.resizeObserver
        });
        
        this.visualEditorWrapper = document.querySelector(".visual-editor__container");
        this.overlayWrapper = document.querySelector(".visual-editor__overlay__wrapper");
        this.customCursor = document.querySelector(".visual-editor__cursor");
        this.focusedToolbar = document.querySelector(".visual-editor__focused-toolbar");

        console.log('[IN SDK] : INIT : VisualEditor');
        
        const config = Config.get();
        if (!config.enable || config.mode < ILivePreviewModeConfig.EDITOR) {
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
                initEventListeners({
                    overlayWrapper: this.overlayWrapper,
                    visualEditorWrapper: this.visualEditorWrapper,
                    previousSelectedEditableDOM: this.previousSelectedEditableDOM,
                    focusedToolbar: this.focusedToolbar,
                    resizeObserver: this.resizeObserver,
                    customCursor: this.customCursor,
                    previousHoveredTargetDOM: this.previousHoveredTargetDOM
                })
           
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
        // window.removeEventListener(
        //     "click",
        //     this.handleMouseClick
        // );
        // window.removeEventListener("mousemove", this.handleMouseHover);
        this.resizeObserver.disconnect();
        this.removeVisualEditorDOM();
    };
}
