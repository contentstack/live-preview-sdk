const originalStyles = new WeakMap<
    HTMLElement,
    {
        visibility?: string;
        transition?: string;
        animation?: string;
    }
>();

export function clearVisibelityStyles(element: HTMLElement) {
    const originalStyleValues = {
        visibility: element.style.visibility,
        transition: element.style.transition,
        animation: element.style.animation,
    };

    originalStyles.set(element, originalStyleValues);

    element.style.visibility = "hidden";
    element.style.transition = "none";
    element.style.animation = "none";
}

export function restoreVisibelityStyles(element: HTMLElement) {
    const storedStyles = originalStyles.get(element);

    if (storedStyles) {
        element.style.visibility = storedStyles.visibility || "";
        element.style.transition = storedStyles.transition || "";
        element.style.animation = storedStyles.animation || "";

        originalStyles.delete(element);
    }
}
