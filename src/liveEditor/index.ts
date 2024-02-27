import { render } from "preact";

import { generateStartEditingButton } from "./utils/generateStartEditingButton";
import { inIframe } from "../common/inIframe";
import Config from "../configManager/configManager";
import {
    useHistoryPostMessageEvent,
    useOnEntryUpdatePostMessageEvent,
} from "../livePreview/eventManager/postMessageEvent.hooks";
import {
    ILivePreviewModeConfig,
    ILivePreviewWindowType,
    IVisualEditorInitEvent,
} from "../types/types";

import {
    addFocusOverlay,
} from "./utils/focusOverlayWrapper";
import { getEntryUidFromCurrentPage } from "./utils/getEntryUidFromCurrentPage";
import liveEditorPostMessage from "./utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./utils/types/postMessage.types";

import initUI from "./components/initUI";
import initEventListeners from "./utils/listeners/initEventListeners";
import VisualEditorGlobalUtils from "./globals";


export class VisualEditor {
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    // private previousSelectedEditableDOM: HTMLElement | Element | null = null;
    private visualEditorWrapper: HTMLDivElement | null = null;
    // private previousHoveredTargetDOM: Element | null = null;
    private focusedToolbar: HTMLDivElement | null = null;

    private resizeObserver = new ResizeObserver(([entry]) => {
        if (!this.overlayWrapper || !VisualEditorGlobalUtils.previousSelectedEditableDOM) return;

        if (!entry.target.isSameNode(VisualEditorGlobalUtils.previousSelectedEditableDOM)) return;

        addFocusOverlay(VisualEditorGlobalUtils.previousSelectedEditableDOM, this.overlayWrapper);
    });

    constructor() {
        this.removeVisualEditorDOM = this.removeVisualEditorDOM.bind(this);
        
        initUI({
            resizeObserver: this.resizeObserver
        });

        this.visualEditorWrapper = document.querySelector(".visual-editor__container");
        this.overlayWrapper = document.querySelector(".visual-editor__overlay__wrapper");
        this.customCursor = document.querySelector(".visual-editor__cursor");
        this.focusedToolbar = document.querySelector(".visual-editor__focused-toolbar");
        console.log('[IN SDK] : INIT : VisualEditor');

        const config = Config.get();
        console.log('[IN SDK] : Config : ', config, ILivePreviewModeConfig.EDITOR);
        
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
                    previousSelectedEditableDOM: VisualEditorGlobalUtils.previousSelectedEditableDOM,
                    focusedToolbar: this.focusedToolbar,
                    resizeObserver: this.resizeObserver,
                    customCursor: this.customCursor,
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
                console.log('[IN SDK] : ERROR ', e);
                
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
