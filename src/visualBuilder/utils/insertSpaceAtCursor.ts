import { unicodeNonBreakingSpace } from "./constants";

export function insertSpaceAtCursor(element: HTMLElement) {
    // Check if the browser supports modern selection API
    const selection = window.getSelection();

    // Ensure there's a valid selection
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Create a text node with a space
        const spaceNode = document.createTextNode(unicodeNonBreakingSpace);

        // Delete any selected content first
        range.deleteContents();

        // Insert the space node
        range.insertNode(spaceNode);

        // Move cursor after the inserted space
        range.setStartAfter(spaceNode);
        range.setEndAfter(spaceNode);

        // Update the selection
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
