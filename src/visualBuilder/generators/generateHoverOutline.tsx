import { visualBuilderStyles } from "../visualBuilder.style";

/**
 * Adds a hover outline to the target element.
 * @param targetElement - The element to add the hover outline to.
 * @param isAnchorElement - Boolean to check for anchor elements.
 * @returns void
 */
export function addHoverOutline(
    targetElement: Element,
    disabled?: boolean,
    isVariant?: boolean,
    isLocked?: boolean
): void {
    const targetElementDimension = targetElement.getBoundingClientRect();

    const hoverOutline = document.querySelector<HTMLDivElement>(
        ".visual-builder__hover-outline"
    );

    if (hoverOutline) {
        hoverOutline.classList.remove(
            visualBuilderStyles()["visual-builder__hover-outline--hidden"]
        );

        if (isLocked) {
            hoverOutline.classList.add(
                visualBuilderStyles()["visual-builder__hover-outline--locked"]
            );
            hoverOutline.classList.remove(
                visualBuilderStyles()["visual-builder__hover-outline--disabled"]
            );
            hoverOutline.classList.remove(
                visualBuilderStyles()["visual-builder__hover-outline--variant"]
            );
        } else if (disabled) {
            hoverOutline.classList.add(
                visualBuilderStyles()["visual-builder__hover-outline--disabled"]
            );
            hoverOutline.classList.remove(
                visualBuilderStyles()["visual-builder__hover-outline--locked"]
            );
        } else {
            hoverOutline.classList.remove(
                visualBuilderStyles()["visual-builder__hover-outline--disabled"]
            );
            hoverOutline.classList.remove(
                visualBuilderStyles()["visual-builder__hover-outline--locked"]
            );
            if (isVariant) {
                hoverOutline.classList.add(
                    visualBuilderStyles()["visual-builder__hover-outline--variant"]
                );
            } else {
                hoverOutline.classList.remove(
                    visualBuilderStyles()["visual-builder__hover-outline--variant"]
                );
            }
        }

        hoverOutline.style.top = `${
            targetElementDimension.top + window.scrollY
        }px`;
        hoverOutline.style.left = `${targetElementDimension.left}px`;
        hoverOutline.style.width = `${targetElementDimension.width}px`;
        hoverOutline.style.height = `${targetElementDimension.height}px`;
    }
}
