import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "./constants";

const EDITING_SELECTOR = `[${VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY}]`;

/**
 * Returns whether a field inside `element` is being edited in Visual Editor.
 * Pass the element wrapping your self-updating content to pause it while true.
 * Omit `element` to check the whole document. Returns `false` during SSR.
 */
export function isVisualEditorEditing(element?: HTMLElement | null): boolean {
    if (typeof document === "undefined") return false;

    if (element) {
        return (
            (typeof element.matches === "function" &&
                element.matches(EDITING_SELECTOR)) ||
            element.querySelector(EDITING_SELECTOR) !== null
        );
    }

    return document.querySelector(EDITING_SELECTOR) !== null;
}
