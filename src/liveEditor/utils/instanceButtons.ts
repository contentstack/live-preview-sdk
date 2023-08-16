export function shouldHideInstanceButton(
    elements: {
        visualEditorWrapper: HTMLElement | null;
        overlay: HTMLElement | null;
        previousButton: HTMLElement | null;
        nextButton: HTMLElement | null;
    },
    eventTarget: EventTarget | null
): boolean {
    if (
        !elements.visualEditorWrapper ||
        !elements.previousButton ||
        !elements.nextButton
    ) {
        return false;
    }
    if (
        eventTarget &&
        (elements.previousButton.contains(eventTarget as Node) ||
            elements.nextButton.contains(eventTarget as Node))
    ) {
        return false;
    }
    if (elements.overlay?.classList.contains("visible")) {
        return false;
    }

    if (elements.previousButton) {
        elements.visualEditorWrapper?.removeChild(elements.previousButton);
        elements.previousButton = null;
    }
    if (elements.nextButton) {
        elements.visualEditorWrapper?.removeChild(elements.nextButton);
        elements.nextButton = null;
    }

    return true;
}
