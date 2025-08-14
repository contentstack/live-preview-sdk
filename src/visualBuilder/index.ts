import { Signal, signal } from "@preact/signals";

import { inIframe } from "../common/inIframe";
import Config from "../configManager/configManager";
import {
    useHistoryPostMessageEvent,
    useOnEntryUpdatePostMessageEvent,
} from "../livePreview/eventManager/postMessageEvent.hooks";
import {
    ILivePreviewModeConfig,
    ILivePreviewWindowType,
    IVisualBuilderInitEvent,
} from "../types/types";
import { generateStartEditingButton } from "./generators/generateStartEditingButton";

import { addFocusOverlay } from "./generators/generateOverlay";
import { getEntryIdentifiersInCurrentPage } from "./utils/getEntryIdentifiersInCurrentPage";
import visualBuilderPostMessage from "./utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "./utils/types/postMessage.types";

import { setup } from "goober";
import { debounce, isEqual } from "lodash-es";
import { h } from "preact";
import { extractDetailsFromCslp } from "../cslp";
import initUI from "./components";
import { useDraftFieldsPostMessageEvent } from "./eventManager/useDraftFieldsPostMessageEvent";
import { useHideFocusOverlayPostMessageEvent } from "./eventManager/useHideFocusOverlayPostMessageEvent";
import { useScrollToField } from "./eventManager/useScrollToField";
import { useVariantFieldsPostMessageEvent } from "./eventManager/useVariantsPostMessageEvent";
import {
    generateEmptyBlocks,
    removeEmptyBlocks,
} from "./generators/generateEmptyBlock";
import { addEventListeners, removeEventListeners } from "./listeners";
import { addKeyboardShortcuts } from "./listeners/keyboardShortcuts";
import { FieldSchemaMap } from "./utils/fieldSchemaMap";
import { isFieldDisabled } from "./utils/isFieldDisabled";
import {
    updateFocussedState,
    updateFocussedStateOnMutation,
} from "./utils/updateFocussedState";
import { useHighlightCommentIcon } from "./eventManager/useHighlightCommentIcon";
import { updateHighlightedCommentIconPosition } from "./generators/generateHighlightedComment";
import {
    updateCollabIconPosition,
    updatePopupPositions,
    updateSuggestionListPosition,
} from "./generators/generateThread";
import { useRecalculateVariantDataCSLPValues } from "./eventManager/useRecalculateVariantDataCSLPValues";
import { VB_EmptyBlockParentClass } from "..";
import { useCollab } from "./eventManager/useCollab";
import {
    handleMissingThreads,
    processThreadsBatch,
    filterUnrenderedThreads,
    clearThreadStatus,
} from "./generators/generateThread";
import { IThreadDTO } from "./types/collab.types";

interface VisualBuilderGlobalStateImpl {
    previousSelectedEditableDOM: HTMLElement | Element | null;
    previousHoveredTargetDOM: Element | null;
    previousEmptyBlockParents: Element[] | [];
    focusFieldValue: string | null;
    focusFieldReceivedInput: boolean;
    audienceMode: boolean;
    locale: string;
    variant: string | null;
    focusElementObserver: MutationObserver | null;
    referenceParentMap: Record<string, string>;
    isFocussed: boolean;
    isEditing: boolean;
}

let threadsPayload: IThreadDTO[] = [];

export class VisualBuilder {
    private customCursor: HTMLDivElement | null = null;
    private overlayWrapper: HTMLDivElement | null = null;
    private visualBuilderContainer: HTMLDivElement | null = null;
    private focusedToolbar: HTMLDivElement | null = null;

    static VisualBuilderGlobalState: Signal<VisualBuilderGlobalStateImpl> =
        signal({
            previousSelectedEditableDOM: null,
            previousHoveredTargetDOM: null,
            previousEmptyBlockParents: [],
            focusFieldValue: null,
            focusFieldReceivedInput: false,
            audienceMode: false,
            locale: Config.get().stackDetails.masterLocale || "en-us",
            variant: null,
            focusElementObserver: null,
            referenceParentMap: {},
            isFocussed: false,
            isEditing: false,
        });

    private handlePositionChange(editableElement: HTMLElement) {
        updateFocussedState({
            editableElement,
            visualBuilderContainer: this.visualBuilderContainer,
            overlayWrapper: this.overlayWrapper,
            focusedToolbar: this.focusedToolbar,
            resizeObserver: this.resizeObserver,
        });
    }

    private scrollEventHandler = () => {
        updateCollabIconPosition();
        updatePopupPositions();
        updateSuggestionListPosition();
        updateHighlightedCommentIconPosition(); // Update icons position
    };

    private resizeEventHandler = () => {
        const previousSelectedEditableDOM =
            VisualBuilder.VisualBuilderGlobalState.value
                .previousSelectedEditableDOM;
        updateHighlightedCommentIconPosition();
        updateCollabIconPosition();
        updatePopupPositions();
        updateSuggestionListPosition();
        if (previousSelectedEditableDOM) {
            this.handlePositionChange(
                previousSelectedEditableDOM as HTMLElement
            );
        }
    };

    private resizeObserver = new ResizeObserver(([entry]) => {
        const previousSelectedEditableDOM =
            VisualBuilder.VisualBuilderGlobalState.value
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
                updateFocussedStateOnMutation(
                    this.overlayWrapper,
                    this.focusedToolbar,
                    this.visualBuilderContainer,
                    this.resizeObserver
                );

                const emptyBlockParents = Array.from(
                    document.querySelectorAll(`.${VB_EmptyBlockParentClass}`)
                );

                const previousEmptyBlockParents = VisualBuilder
                    .VisualBuilderGlobalState.value
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

                    VisualBuilder.VisualBuilderGlobalState.value = {
                        ...VisualBuilder.VisualBuilderGlobalState.value,
                        previousEmptyBlockParents: emptyBlockParents,
                    };
                }
            },
            100,
            { trailing: true }
        )
    );

    private threadMutationObserver = new MutationObserver(
        debounce(() => {
            const container = document.querySelector(
                ".visual-builder__container"
            );
            if (container && threadsPayload) {
                const unrenderedThreads =
                    filterUnrenderedThreads(threadsPayload);

                if (unrenderedThreads.length > 0) {
                    processThreadsBatch(threadsPayload).then(
                        (missingThreadIds) => {
                            missingThreadIds.forEach(clearThreadStatus);
                            if (missingThreadIds.length > 0) {
                                handleMissingThreads({
                                    payload: { isElementPresent: false },
                                    threadUids: missingThreadIds,
                                });
                            }
                        }
                    );
                }

                threadsPayload = [];
            }
        }, 1000)
    );

    constructor() {
        // Handles changes in element positions due to sidebar toggling or window resizing,
        // triggering a redraw of the visual builder
        window.addEventListener("resize", this.resizeEventHandler);
        window.addEventListener("scroll", this.scrollEventHandler);
        initUI({
            resizeObserver: this.resizeObserver,
        });

        // Initializing goober for css-in-js
        setup(h);

        this.visualBuilderContainer = document.querySelector(
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

        if (!config.enable || config.mode < ILivePreviewModeConfig.BUILDER) {
            return;
        }

        visualBuilderPostMessage
            ?.send<IVisualBuilderInitEvent>("init", {
                isSSR: config.ssr,
                href: window.location.href,
            })
            .then((data) => {
                const {
                    windowType = ILivePreviewWindowType.BUILDER,
                    stackDetails,
                    collab,
                } = data || {};
                Config.set("windowType", windowType);
                Config.set(
                    "stackDetails.masterLocale",
                    stackDetails?.masterLocale || "en-us"
                );

                if (collab) {
                    Config.set("collab.enable", collab.enable);
                    Config.set("collab.isFeedbackMode", collab.isFeedbackMode);
                    Config.set("collab.inviteMetadata", collab.inviteMetadata);
                }

                if (collab?.payload) {
                    threadsPayload = collab?.payload;
                }

                addEventListeners({
                    overlayWrapper: this.overlayWrapper,
                    visualBuilderContainer: this.visualBuilderContainer,
                    previousSelectedEditableDOM:
                        VisualBuilder.VisualBuilderGlobalState.value
                            .previousSelectedEditableDOM,
                    focusedToolbar: this.focusedToolbar,
                    resizeObserver: this.resizeObserver,
                    customCursor: this.customCursor,
                });

                this.threadMutationObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: false,
                });

                useHistoryPostMessageEvent();
                useCollab();

                if (windowType === ILivePreviewWindowType.BUILDER) {
                    addKeyboardShortcuts({
                        overlayWrapper: this.overlayWrapper,
                        visualBuilderContainer: this.visualBuilderContainer,
                        focusedToolbar: this.focusedToolbar,
                        resizeObserver: this.resizeObserver,
                    });
                    useScrollToField();
                    useHighlightCommentIcon();

                    this.mutationObserver.observe(document.body, {
                        childList: true,
                        subtree: true,
                    });

                    visualBuilderPostMessage?.on(
                        VisualBuilderPostMessageEvents.GET_ALL_ENTRIES_IN_CURRENT_PAGE,
                        getEntryIdentifiersInCurrentPage
                    );
                    visualBuilderPostMessage?.send(
                        VisualBuilderPostMessageEvents.SEND_VARIANT_AND_LOCALE
                    );

                        visualBuilderPostMessage?.on<{
                            scroll: boolean
                        }>(
                            VisualBuilderPostMessageEvents.TOGGLE_SCROLL,
                            (event) => {
                                if (!event.data.scroll) {
                                    document.body.style.overflow = 'hidden'
                                } else {
                                    document.body.style.overflow = 'auto'
                                }
                            }
                        );
                    
                    
                    

                    useHideFocusOverlayPostMessageEvent({
                        overlayWrapper: this.overlayWrapper,
                        visualBuilderContainer: this.visualBuilderContainer,
                        focusedToolbar: this.focusedToolbar,
                        resizeObserver: this.resizeObserver,
                    });

                    // These events are used to sync the data when we made some changes in the entry without invoking live preview module.
                    useOnEntryUpdatePostMessageEvent();
                    useRecalculateVariantDataCSLPValues();
                    useDraftFieldsPostMessageEvent();
                    useVariantFieldsPostMessageEvent();
                }
            })
            .catch(() => {
                if (!inIframe()) {
                    generateStartEditingButton();
                }
            });
    }

    // TODO: write test cases
    destroy = (): void => {
        // Remove event listeners
        window.removeEventListener("resize", this.resizeEventHandler);
        window.removeEventListener("scroll", this.scrollEventHandler);

        // Remove custom event listeners
        removeEventListeners({
            overlayWrapper: this.overlayWrapper,
            visualBuilderContainer: this.visualBuilderContainer,
            previousSelectedEditableDOM:
                VisualBuilder.VisualBuilderGlobalState.value
                    .previousSelectedEditableDOM,
            focusedToolbar: this.focusedToolbar,
            resizeObserver: this.resizeObserver,
            customCursor: this.customCursor,
        });

        // Disconnect observers
        this.resizeObserver.disconnect();
        this.mutationObserver.disconnect();
        this.threadMutationObserver.disconnect();

        // Clear global state
        VisualBuilder.VisualBuilderGlobalState.value = {
            previousSelectedEditableDOM: null,
            previousHoveredTargetDOM: null,
            previousEmptyBlockParents: [],
            focusFieldValue: null,
            focusFieldReceivedInput: false,
            audienceMode: false,
            locale: "en-us",
            variant: null,
            focusElementObserver: null,
            referenceParentMap: {},
            isFocussed: false,
            isEditing: false,
        };

        // Remove DOM elements
        if (this.visualBuilderContainer) {
            window.document.body.removeChild(this.visualBuilderContainer);
        }
        if (this.customCursor) {
            this.customCursor.remove();
        }
        if (this.overlayWrapper) {
            this.overlayWrapper.remove();
        }
        if (this.focusedToolbar) {
            this.focusedToolbar.remove();
        }

        // Nullify references
        this.customCursor = null;
        this.overlayWrapper = null;
        this.visualBuilderContainer = null;
        this.focusedToolbar = null;
    };
}
