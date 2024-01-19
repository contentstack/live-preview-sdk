export function generateVisualEditorWrapper(elements: {
    cursor: HTMLDivElement;
    overlay: HTMLDivElement;
    toolbar: HTMLDivElement;
}): HTMLDivElement {
    const { cursor, overlay, toolbar } = elements;

    const visualEditorWrapper = document.createElement("div");
    visualEditorWrapper.classList.add("visual-editor__container");
    visualEditorWrapper.setAttribute("data-testid", "visual-editor__container");

    visualEditorWrapper.appendChild(cursor);
    visualEditorWrapper.appendChild(overlay);
    visualEditorWrapper.appendChild(toolbar);

    window.document.body.appendChild(visualEditorWrapper);

    return visualEditorWrapper;
}

export function generateVisualEditorCursor(): HTMLDivElement {
    const customVisualCursor = document.createElement("div");
    customVisualCursor.classList.add("visual-editor__cursor");
    customVisualCursor.setAttribute("data-testid", "visual-editor__cursor");

    return customVisualCursor;
}

export function generateFocusedToolbar(): HTMLDivElement {
    const focusedToolbar = document.createElement("div");
    focusedToolbar.classList.add("visual-editor__focused-toolbar");
    focusedToolbar.setAttribute(
        "data-testid",
        "visual-editor__focused-toolbar"
    );
    return focusedToolbar;
}
export function generateVisualEditorOverlay(
    onClick: (visualEditorOverlayWrapper: HTMLDivElement | null) => void
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

    visualEditorOverlayWrapper.addEventListener("click", (event) => {
        const targetElement = event.target as Element;

        if (targetElement.classList.contains("visual-editor__overlay")) {
            onClick(visualEditorOverlayWrapper);
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            onClick(visualEditorOverlayWrapper);
        }
    });

    return visualEditorOverlayWrapper;
}
