const elementStyles = new WeakMap<
    HTMLElement,
    {
        visibility?: string;
        transition?: string;
        animation?: string;
    }
>();
/**
 * Clears the visibility, transition, and animation styles of an element and stores the original values
 * @param element - The element to clear the styles from
 * VB-277 Fix: Clear visibility, transition, and animation styles of an element
 */

export function clearVisibilityStyles(element: HTMLElement) {
    // Only store original values if not already stored
    if (!elementStyles.has(element)) {
        const originalStyleValues = {
            visibility: element.style.visibility,
            transition: element.style.transition,
            animation: element.style.animation,
        };

        elementStyles.set(element, originalStyleValues);
    }

    element.style.visibility = "hidden";
    element.style.transition = "none";
    element.style.animation = "none";
}

export function restoreVisibilityStyles(element: HTMLElement) {
    const storedStyles = elementStyles.get(element);

    if (storedStyles) {
        element.style.visibility = storedStyles.visibility || "";
        element.style.transition = storedStyles.transition || "";
        element.style.animation = storedStyles.animation || "";

        elementStyles.delete(element);
    }
}
