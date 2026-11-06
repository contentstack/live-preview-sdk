import { css } from "goober";

/** Styles for the docked panel, kept beside it so they load only on sites that dock. */
export function dockStyles() {
    return {
        // Docked Visual Editor panel. Its width, and the page margin that makes room for it, are set inline.
        "visual-builder__panel": css`
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            border: none;
            border-left: 1px solid #dde3ee;
            /* The border counts inside the width, or the panel overlaps the page by 1px. */
            box-sizing: border-box;
            z-index: 2147483646;
            /* The edge has to stay under the pointer while dragging. */
            transition: none;
        `,
        // An invisible strip straddling the panel's left edge, above it so its half over the border still takes the pointer.
        "visual-builder__panel-resize-handle": css`
            position: fixed;
            top: 0;
            width: 8px;
            height: 100vh;
            cursor: col-resize;
            background: transparent;
            z-index: 2147483647;
            touch-action: none;
            &:hover .visual-builder__panel-resize-grip,
            &.visual-builder__panel-resize-handle--dragging
                .visual-builder__panel-resize-grip {
                opacity: 1;
            }
        `,
        // A <button>, unlike Start Editing's link, so it needs the pointer set.
        "visual-builder__panel-toggle": css`
            cursor: pointer;
        `,
        // The framed editor's side form resize bar: a full-height 2px line in venus lavender-purple P-500.
        "visual-builder__panel-resize-grip": css`
            position: absolute;
            top: 0;
            left: 4px;
            height: 100%;
            border-left: 2px solid #5d50be;
            opacity: 0;
            pointer-events: none;
        `,
    };
}
