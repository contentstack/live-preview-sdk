/**
 * Utility module for handling -webkit-line-clamp, overflow, and white-space properties
 * when elements are focused/unfocused in the visual builder
 */

interface LineClampStyles {
    webkitLineClamp?: string;
    overflow?: string;
    display?: string;
    webkitBoxOrient?: string;
    whiteSpace?: string;
}

// WeakMap to store original styles for each element
const originalStyles = new WeakMap<Element, LineClampStyles>();

/**
 * Removes truncate related styles from an element and stores the original values
 * @param element - The element to remove line-clamp and white-space styles from
 */
export function removeTruncateStyles(element: Element): void {
    if (!element || !(element instanceof HTMLElement)) return;

    const computedStyles = window.getComputedStyle(element);
    const styles: LineClampStyles = {};

    // Store original styles if they exist
    if (
        computedStyles.webkitLineClamp &&
        computedStyles.webkitLineClamp !== "none"
    ) {
        styles.webkitLineClamp = computedStyles.webkitLineClamp;
    }

    if (computedStyles.overflow && computedStyles.overflow !== "visible") {
        styles.overflow = computedStyles.overflow;
    }

    if (computedStyles.display && computedStyles.display.includes("box")) {
        styles.display = computedStyles.display;
    }

    if (
        computedStyles.webkitBoxOrient &&
        computedStyles.webkitBoxOrient !== "horizontal"
    ) {
        styles.webkitBoxOrient = computedStyles.webkitBoxOrient;
    }

    if (computedStyles.whiteSpace && computedStyles.whiteSpace === "nowrap") {
        styles.whiteSpace = computedStyles.whiteSpace;
    }

    // Only store if we found line-clamp related styles
    if (Object.keys(styles).length > 0) {
        originalStyles.set(element, styles);

        // Remove the styles
        element.style.webkitLineClamp = "none";
        element.style.overflow = "visible";
        // Reset display if it was -webkit-box
        if (styles.display?.includes("box")) {
            element.style.display = "block";
        }
        if (styles.webkitBoxOrient) {
            element.style.webkitBoxOrient = "horizontal";
        }
        if (styles.whiteSpace) {
            element.style.whiteSpace = "normal";
        }
    }
}

/**
 * Restores the original truncate related styles to an element
 * @param element - The element to restore line-clamp and white-space styles to
 */
export function restoreTruncateStyles(element: Element): void {
    if (!element || !(element instanceof HTMLElement)) return;

    const storedStyles = originalStyles.get(element);
    if (!storedStyles) return;

    // Restore original styles
    if (storedStyles.webkitLineClamp) {
        element.style.webkitLineClamp = storedStyles.webkitLineClamp;
    } else {
        element.style.removeProperty("-webkit-line-clamp");
    }

    if (storedStyles.overflow) {
        element.style.overflow = storedStyles.overflow;
    } else {
        element.style.removeProperty("overflow");
    }

    if (storedStyles.display) {
        element.style.display = storedStyles.display;
    } else {
        element.style.removeProperty("display");
    }

    if (storedStyles.webkitBoxOrient) {
        element.style.webkitBoxOrient = storedStyles.webkitBoxOrient;
    } else {
        element.style.removeProperty("-webkit-box-orient");
    }

    if (storedStyles.whiteSpace) {
        element.style.whiteSpace = storedStyles.whiteSpace;
    } else {
        element.style.removeProperty("white-space");
    }

    // Clean up stored styles
    originalStyles.delete(element);
}

/**
 * Checks if an element has truncate or white-space styles applied
 * @param element - The element to check
 * @returns boolean indicating if the element has line-clamp or white-space styles
 */
export function hasTruncateStyles(element: Element): boolean {
    if (!element || !(element instanceof HTMLElement)) return false;

    const computedStyles = window.getComputedStyle(element);
    return (
        computedStyles.webkitLineClamp !== "none" ||
        (computedStyles.overflow === "hidden" &&
            computedStyles.display?.includes("box") &&
            computedStyles.webkitBoxOrient === "vertical") ||
        computedStyles.whiteSpace === "nowrap"
    );
}

/**
 * Checks if an element currently has stored truncate styles
 * @param element - The element to check
 * @returns boolean indicating if the element has stored styles
 */
export function hasStoredLineClampStyles(element: Element): boolean {
    return originalStyles.has(element);
}
