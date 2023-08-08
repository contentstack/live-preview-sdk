export function generateVisualEditorWrapper(elements: {
    cursor: HTMLDivElement;
    overlay: HTMLDivElement;
}): HTMLDivElement {
    const { cursor, overlay } = elements;

    const visualEditorWrapper = document.createElement("div");
    visualEditorWrapper.classList.add("visual-editor__container");
    visualEditorWrapper.setAttribute("data-testid", "visual-editor__container");

    visualEditorWrapper.appendChild(cursor);
    visualEditorWrapper.appendChild(overlay);

    window.document.body.appendChild(visualEditorWrapper);

    return visualEditorWrapper;
}

export function generateVisualEditorCursor(): HTMLDivElement {
    const customVisualCursor = document.createElement("div");
    customVisualCursor.classList.add("visual-editor__cursor");
    customVisualCursor.setAttribute("data-testid", "visual-editor__cursor");

    return customVisualCursor;
}

export function generateVisualEditorOverlay(
    onClick: (event: MouseEvent) => void
): HTMLDivElement {
    const visualEditorOverlayWrapper = document.createElement("div");

    visualEditorOverlayWrapper.setAttribute(
        "data-testid",
        "visual-editor__overlay__wrapper"
    );
    visualEditorOverlayWrapper.classList.add("visual-editor__overlay__wrapper");

    visualEditorOverlayWrapper.innerHTML = `
        <div data-testid="visual-editor__overlay--top" class="visual-editor__overlay visual-editor__overlay--top"></div>
        <div data-testid="visual-editor__overlay--left" class="visual-editor__overlay visual-editor__overlay--left"></div>
        <div data-testid="visual-editor__overlay--right" class="visual-editor__overlay visual-editor__overlay--right"></div>
        <div data-testid="visual-editor__overlay--bottom" class="visual-editor__overlay visual-editor__overlay--bottom"></div>
        <div data-testid="visual-editor__overlay--outline" class="visual-editor__overlay--outline"></div>
    `;

    visualEditorOverlayWrapper.addEventListener("click", onClick);

    return visualEditorOverlayWrapper;
}
