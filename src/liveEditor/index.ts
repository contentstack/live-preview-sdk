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
import { useHideFocusOverlayPostMessageEvent } from "./eventManager/useHideFocusOverlayPostMessageEvent";
import { extractDetailsFromCslp } from "../cslp";
import { FieldSchemaMap } from "./utils/fieldSchemaMap";
import { isFieldDisabled } from "./utils/isFieldDisabled";
import { updateFocussedState } from "./utils/updateFocussedState";
import { useDraftFieldsPostMessageEvent } from "./eventManager/useDraftFieldsPostMessageEvent";
import { h } from "preact";
import { setup } from "goober";
import { globalLiveEditorStyles } from "./liveEditor.style";

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

    private handlePositionChange(editableElement: HTMLElement) {
        updateFocussedState({
            editableElement,
            visualEditorContainer: this.visualEditorContainer,
            overlayWrapper: this.overlayWrapper,
            focusedToolbar: this.focusedToolbar,
            resizeObserver: this.resizeObserver,
        });
    }

    private resizeEventHandler = () => {
        const previousSelectedEditableDOM =
            VisualEditor.VisualEditorGlobalState.value
                .previousSelectedEditableDOM;
        if (previousSelectedEditableDOM) {
            this.handlePositionChange(
                previousSelectedEditableDOM as HTMLElement
            );
        }
    };

    private resizeObserver = new ResizeObserver(([entry]) => {
        const previousSelectedEditableDOM =
            VisualEditor.VisualEditorGlobalState.value
                .previousSelectedEditableDOM;

        if (!this.overlayWrapper || !previousSelectedEditableDOM) {
            return;
        }

        // if previous selected editable element is not same as the current
        // target and the target is also not psuedo-editable then return
        if (
            !entry.target.isSameNode(previousSelectedEditableDOM) &&
            !entry.target.classList.contains(
                "visual-builder__pseudo-editable-element"
            )
        ) {
            return;
        }

        const isPsuedoEditableElement = entry.target.classList.contains(
            "visual-builder__pseudo-editable-element"
        );

        // the "actual" editable element when the current target is psuedo-editable
        // is the previous selected editable element instead of the closest data-cslp element
        // (cant use closest because the psuedo editable is absolute positioned)
        // (Note - why do we even need the closest? we do an early exit if entry.target
        // is not the previous selected editable element, needs more investigation)
        const editableElement = (
            isPsuedoEditableElement
                ? previousSelectedEditableDOM
                : entry.target.closest("[data-cslp]")
        ) as HTMLElement | null;

        if (isPsuedoEditableElement) {
            // if the current target is psuedo-editable, then the resizing occurred by typing
            // into the psuedo editable, simply update the focus overlay
            addFocusOverlay(entry.target, this.overlayWrapper);

            // TODO check if we can now resize the actual editable element
            // when psuedo editable element is resized, avoid infinite loops
        } else if (editableElement) {
            this.handlePositionChange(editableElement);
        }

        // update the overlay if field is disabled
        const cslpData =
            editableElement && editableElement.getAttribute("data-cslp");

        if (!editableElement || !cslpData) {
            return;
        }

        const fieldMetadata = extractDetailsFromCslp(cslpData);

        FieldSchemaMap.getFieldSchema(
            fieldMetadata.content_type_uid,
            fieldMetadata.fieldPath
        ).then((fieldSchema) => {
            if (!fieldSchema) {
                return;
            }
            const { isDisabled } = isFieldDisabled(fieldSchema, {
                editableElement,
                fieldMetadata,
                cslpData,
            });
            if (isDisabled) {
                addFocusOverlay(
                    editableElement,
                    this.overlayWrapper as HTMLDivElement,
                    isDisabled
                );
            }
        });
    });

    private mutationObserver = new MutationObserver(
        debounce(
            async () => {
                const emptyBlockParents = Array.from(
                    document.querySelectorAll(
                        ".visual-builder__empty-block-parent"
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
        // Handles changes in element positions due to sidebar toggling or window resizing,
        // triggering a redraw of the visual editor
        window.addEventListener("resize", this.resizeEventHandler);

        initUI({
            resizeObserver: this.resizeObserver,
        });

        // Initializing goober for css-in-js
        setup(h);
        globalLiveEditorStyles();

        this.visualEditorContainer = document.querySelector(
            ".visual-builder__container"
        );
        this.overlayWrapper = document.querySelector(
            ".visual-builder__overlay__wrapper"
        );
        this.customCursor = document.querySelector(".visual-builder__cursor");
        this.focusedToolbar = document.querySelector(
            ".visual-builder__focused-toolbar"
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

                useHideFocusOverlayPostMessageEvent({
                    overlayWrapper: this.overlayWrapper,
                    visualEditorContainer: this.visualEditorContainer,
                    focusedToolbar: this.focusedToolbar,
                    resizeObserver: this.resizeObserver,
                });

                // These events are used to sync the data when we made some changes in the entry without invoking live preview module.
                useHistoryPostMessageEvent();
                useOnEntryUpdatePostMessageEvent();
                useDraftFieldsPostMessageEvent();
            })
            .catch(() => {
                if (!inIframe()) {
                    generateStartEditingButton(this.visualEditorContainer);
                }
            });
    }

    // TODO: write test cases
    destroy = (): void => {
        window.removeEventListener("resize", this.resizeEventHandler);
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
