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

import { addFocusOverlay, hideOverlay } from "./generators/generateOverlay";
import { getEntryIdentifiersInCurrentPage } from "./utils/getEntryIdentifiersInCurrentPage";
import liveEditorPostMessage from "./utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./utils/types/postMessage.types";

import initUI from "./components";
import { addEventListeners, removeEventListeners } from "./listeners";
import {
    generateEmptyBlocks,
    removeEmptyBlocks,
} from "./generators/generateEmptyBlock";
import { debounce, isEqual } from "lodash-es";
import { addKeyboardShortcuts } from "./listeners/keyboardShortcuts";

interface VisualEditorGlobalStateImpl {
    previousSelectedEditableDOM: HTMLElement | Element | null;
    previousHoveredTargetDOM: Element | null;
    previousEmptyBlockParents: Element[] | [];
}

export class VisualEditor {
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private visualEditorContainer: HTMLDivElement | null = null;
    private focusedToolbar: HTMLDivElement | null = null;

    static VisualEditorGlobalState: Signal<VisualEditorGlobalStateImpl> =
        signal({
            previousSelectedEditableDOM: null,
            previousHoveredTargetDOM: null,
            previousEmptyBlockParents: [],
        });

    /**
     * This array is used to store the cleanup functions for the fields that get unfocused.
     * This allows us to clean up the field-specific event listeners and other things when a field is unfocused.
     */
    static VisualEditorUnfocusFieldCleanups: (() => void)[] = [];

    private resizeObserver = new ResizeObserver(([entry]) => {
        if (
            !this.overlayWrapper ||
            !VisualEditor.VisualEditorGlobalState.value
                .previousSelectedEditableDOM
        )
            return;

        if (
            !entry.target.isSameNode(
                VisualEditor.VisualEditorGlobalState.value
                    .previousSelectedEditableDOM
            )
        )
            return;

        addFocusOverlay(
            VisualEditor.VisualEditorGlobalState.value
                .previousSelectedEditableDOM,
            this.overlayWrapper
        );
    });

    private mutationObserver = new MutationObserver(
        debounce(
            async () => {
                const emptyBlockParents = Array.from(
                    document.querySelectorAll(
                        ".visual-editor__empty-block-parent"
                    )
                );

                const previousEmptyBlockParents = VisualEditor
                    .VisualEditorGlobalState.value
                    .previousEmptyBlockParents as Element[];

                if (!isEqual(emptyBlockParents, previousEmptyBlockParents)) {
                    const noMoreEmptyBlockParent =
                        previousEmptyBlockParents.filter(
                            (x) => !emptyBlockParents.includes(x)
                        );
                    const newEmptyBlockParent = emptyBlockParents.filter(
                        (x) => !previousEmptyBlockParents.includes(x)
                    );

                    removeEmptyBlocks(noMoreEmptyBlockParent);
                    await generateEmptyBlocks(newEmptyBlockParent);

                    VisualEditor.VisualEditorGlobalState.value = {
                        ...VisualEditor.VisualEditorGlobalState.value,
                        previousEmptyBlockParents: emptyBlockParents,
                    };
                }
            },
            100,
            { trailing: true }
        )
    );

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
                isSSR: config.ssr,
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

                addKeyboardShortcuts({
                    overlayWrapper: this.overlayWrapper,
                    visualEditorContainer: this.visualEditorContainer,
                    focusedToolbar: this.focusedToolbar,
                    resizeObserver: this.resizeObserver,
                });

                this.mutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                });

                liveEditorPostMessage?.on(
                    LiveEditorPostMessageEvents.GET_ALL_ENTRIES_IN_CURRENT_PAGE,
                    getEntryIdentifiersInCurrentPage
                );

                // These events are used to sync the data when we made some changes in the entry without invoking live preview module.
                useHistoryPostMessageEvent();
                useOnEntryUpdatePostMessageEvent();
            })
            .catch(() => {
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
                VisualEditor.VisualEditorGlobalState.value
                    .previousSelectedEditableDOM,
            focusedToolbar: this.focusedToolbar,
            resizeObserver: this.resizeObserver,
            customCursor: this.customCursor,
        });
        this.resizeObserver.disconnect();
        this.mutationObserver.disconnect();

        if (this.visualEditorContainer) {
            window.document.body.removeChild(this.visualEditorContainer);
        }
        this.customCursor = null;
    };
}
