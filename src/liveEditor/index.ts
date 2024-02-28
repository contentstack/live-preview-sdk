import { Signal, signal } from "@preact/signals";

import { generateStartEditingButton } from "./generators/generateStartEditingButton";
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

import { addFocusOverlay } from "./generators/generateOverlay";
import { getEntryUidFromCurrentPage } from "./utils/getEntryUidFromCurrentPage";
import liveEditorPostMessage from "./utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./utils/types/postMessage.types";

import initUI from "./components";
import { addEventListeners, removeEventListeners } from "./listeners";

interface VisualEditorGlobalStateImpl {
    previousSelectedEditableDOM: HTMLElement | Element | null;
    previousHoveredTargetDOM: Element | null;
}

export class VisualEditor {
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private visualEditorContainer: HTMLDivElement | null = null;
    private focusedToolbar: HTMLDivElement | null = null;

    static VisualEditorGlobalState: Signal<VisualEditorGlobalStateImpl> = signal({
        previousSelectedEditableDOM: null,
        previousHoveredTargetDOM: null,
    });


    private resizeObserver = new ResizeObserver(([entry]) => {
        if (
            !this.overlayWrapper ||
            !VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM
        )
            return;

        if (
            !entry.target.isSameNode(
                VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM
            )
        )
            return;

        addFocusOverlay(
            VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM,
            this.overlayWrapper
        );
    });

    constructor() {
        initUI({
            resizeObserver: this.resizeObserver,
        });

        this.visualEditorContainer = document.querySelector(
            ".visual-editor__container"
        );
        this.overlayWrapper = document.querySelector(
            ".visual-editor__overlay__wrapper"
        );
        this.customCursor = document.querySelector(".visual-editor__cursor");
        this.focusedToolbar = document.querySelector(
            ".visual-editor__focused-toolbar"
        );

        const config = Config.get();

        if (!config.enable || config.mode < ILivePreviewModeConfig.EDITOR) {
            return;
        }

        liveEditorPostMessage
            ?.send<IVisualEditorInitEvent>("init", {
                isSSR: Config.get().ssr,
            })
            .then((data) => {
                const {
                    windowType = ILivePreviewWindowType.EDITOR,
                    stackDetails,
                } = data;
                Config.set("windowType", windowType);
                Config.set(
                    "stackDetails.masterLocale",
                    stackDetails?.masterLocale || "en-us"
                );

                addEventListeners({
                    overlayWrapper: this.overlayWrapper,
                    visualEditorContainer: this.visualEditorContainer,
                    previousSelectedEditableDOM:
                        VisualEditor.VisualEditorGlobalState.value
                            .previousSelectedEditableDOM,
                    focusedToolbar: this.focusedToolbar,
                    resizeObserver: this.resizeObserver,
                    customCursor: this.customCursor,
                });

                liveEditorPostMessage?.on(
                    LiveEditorPostMessageEvents.GET_ENTRY_UID_IN_CURRENT_PAGE,
                    getEntryUidFromCurrentPage
                );

                // These events are used to sync the data when we made some changes in the entry without invoking live preview module.
                useHistoryPostMessageEvent();
                useOnEntryUpdatePostMessageEvent();
            })
            .catch((e) => {
                if (!inIframe()) {
                    generateStartEditingButton(this.visualEditorContainer);
                }
            });
    }

    // TODO: write test cases
    destroy = (): void => {
        removeEventListeners({
            overlayWrapper: this.overlayWrapper,
            visualEditorContainer: this.visualEditorContainer,
            previousSelectedEditableDOM:
                VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM,
            focusedToolbar: this.focusedToolbar,
            resizeObserver: this.resizeObserver,
            customCursor: this.customCursor,
        });
        this.resizeObserver.disconnect();

        if (this.visualEditorContainer) {
            window.document.body.removeChild(this.visualEditorContainer);
        }
        this.customCursor = null;
    };
}
