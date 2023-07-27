const cssReset =
    "overflow: hidden !important; width: 0 !important; height: 0 !important; padding: 0 !important; border: 0 !important;";

const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">\n<path d="M10.4688 4.375C10.4688 4.11612 10.259 3.90625 10.0001 3.90625C9.74121 3.90625 9.53135 4.11612 9.53135 4.375V9.27307H4.37402C4.11514 9.27307 3.90527 9.48294 3.90527 9.74182C3.90527 10.0007 4.11514 10.2106 4.37402 10.2106H9.53135V15.625C9.53135 15.8839 9.74121 16.0937 10.0001 16.0937C10.259 16.0937 10.4688 15.8839 10.4688 15.625V10.2106H15.6259C15.8847 10.2106 16.0946 10.0007 16.0946 9.74182C16.0946 9.48294 15.8847 9.27307 15.6259 9.27307H10.4688V4.375Z" fill="#475161"/>\n</svg>`;

export function getChildrenDirection(
    editableElement: Element
): "none" | "horizontal" | "vertical" {
    if (!editableElement) {
        return "none";
    }

    const parentCSLPValue = editableElement.getAttribute("data-cslp-container");
    const parentElement = editableElement.closest(
        `[data-cslp="${parentCSLPValue}"]`
    );

    if (!parentElement) {
        return "none";
    }

    const children = parentElement.querySelectorAll(
        `[data-cslp-container="${parentCSLPValue}"]`
    );
    const firstChildElement = children[0];
    let secondChildElement = children[1];
    let firstChildClone: HTMLDivElement | undefined = undefined;

    // create a clone to check its position relative to first child
    if (!secondChildElement) {
        firstChildClone = document.createElement("div");
        firstChildClone.setAttribute(
            "class",
            firstChildElement.getAttribute("class") ?? ""
        );
        firstChildClone.setAttribute("style", cssReset);
        parentElement.appendChild(firstChildClone);
        secondChildElement = firstChildClone;
    }

    // get horizontal and vertical position differences
    const firstChildBounds = firstChildElement.getBoundingClientRect();
    const secondChildBounds = secondChildElement.getBoundingClientRect();

    const deltaX = Math.abs(firstChildBounds.left - secondChildBounds.left);
    const deltaY = Math.abs(firstChildBounds.top - secondChildBounds.top);

    const dir = deltaX > deltaY ? "horizontal" : "vertical";

    if (firstChildClone) {
        parentElement?.removeChild(firstChildClone);
    }

    return dir;
}

export function generateAddButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.innerHTML = plusIcon;
    button.classList.add("visual-editor__add-button");
    return button;
}

export function handleAddButtonsForMultiple(elements: {
    editableElement: Element | null;
    visualEditorWrapper: HTMLElement | null;
    previousButton: HTMLButtonElement;
    nextButton: HTMLButtonElement;
}): void {
    const { editableElement, visualEditorWrapper, previousButton, nextButton } =
        elements;

    if (
        !editableElement ||
        !editableElement.getAttribute("data-cslp-container")
    ) {
        return;
    }

    const direction = getChildrenDirection(editableElement);

    if (direction === "none" || !visualEditorWrapper) {
        return;
    }

    const targetDOMDimension = editableElement.getBoundingClientRect();

    if (!visualEditorWrapper.contains(previousButton)) {
        visualEditorWrapper.appendChild(previousButton);
    }

    if (!visualEditorWrapper.contains(nextButton)) {
        visualEditorWrapper.appendChild(nextButton);
    }

    if (direction === "horizontal") {
        const middleHeight =
            targetDOMDimension.top +
            (targetDOMDimension.bottom - targetDOMDimension.top) / 2 +
            window.scrollY;
        previousButton.style.left = `${targetDOMDimension.left}px`;
        previousButton.style.top = `${middleHeight}px`;

        nextButton.style.left = `${targetDOMDimension.right}px`;
        nextButton.style.top = `${middleHeight}px`;
    } else {
        const middleWidth =
            targetDOMDimension.left +
            (targetDOMDimension.right - targetDOMDimension.left) / 2;
        previousButton.style.left = `${middleWidth}px`;
        previousButton.style.top = `${
            targetDOMDimension.top + window.scrollY
        }px`;

        nextButton.style.left = `${middleWidth}px`;
        nextButton.style.top = `${
            targetDOMDimension.bottom + window.scrollY
        }px`;
    }
}

export function hideAddInstanceButtons(elements: {
    visualEditorWrapper: HTMLDivElement | null;
    previousButton: HTMLButtonElement | null;
    nextButton: HTMLButtonElement | null;
    overlayWrapper: HTMLDivElement | null;
    eventTarget: EventTarget | null;
}): void {
    const {
        visualEditorWrapper,
        nextButton,
        overlayWrapper,
        previousButton,
        eventTarget,
    } = elements;

    if (!visualEditorWrapper || !previousButton || !nextButton) {
        return;
    }
    if (
        eventTarget &&
        (previousButton.contains(eventTarget as Node) ||
            nextButton.contains(eventTarget as Node))
    ) {
        return;
    }
    if (overlayWrapper?.classList.contains("visible")) {
        return;
    }
    if (visualEditorWrapper.contains(previousButton)) {
        visualEditorWrapper.removeChild(previousButton);
    }

    if (visualEditorWrapper.contains(nextButton)) {
        visualEditorWrapper.removeChild(nextButton);
    }
}
