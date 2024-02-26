interface VisualEditorGlobalUtilsImpl {
    // customCursor: HTMLDivElement | null;
    // overlayWrapper: HTMLDivElement | null;
    previousSelectedEditableDOM: HTMLElement | Element | null;
    // visualEditorWrapper: HTMLDivElement | null;
    previousHoveredTargetDOM: Element | null;
    // focusedToolbar: HTMLDivElement | null;
}

const VisualEditorGlobalUtils: VisualEditorGlobalUtilsImpl = {
    // customCursor: null,
    // overlayWrapper: null,
    previousSelectedEditableDOM: null,
    // visualEditorWrapper: null,
    previousHoveredTargetDOM: null,
    // focusedToolbar: null
};

export default VisualEditorGlobalUtils;