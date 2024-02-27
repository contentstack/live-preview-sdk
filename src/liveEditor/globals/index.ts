import { Signal, signal } from "@preact/signals";

interface VisualEditorGlobalStateImpl {
    // customCursor: HTMLDivElement | null;
    // overlayWrapper: HTMLDivElement | null;
    previousSelectedEditableDOM: HTMLElement | Element | null;
    // visualEditorContainer: HTMLDivElement | null;
    previousHoveredTargetDOM: Element | null;
    // focusedToolbar: HTMLDivElement | null;
}

// const VisualEditorGlobalState.value: VisualEditorGlobalState.valueImpl = {
//     // customCursor: null,
//     // overlayWrapper: null,
//     previousSelectedEditableDOM: null,
//     // visualEditorContainer: null,
//     previousHoveredTargetDOM: null,
//     // focusedToolbar: null
// };


const VisualEditorGlobalState: Signal<VisualEditorGlobalStateImpl> = signal({
    previousSelectedEditableDOM: null,
    previousHoveredTargetDOM: null
});

export default VisualEditorGlobalState;

