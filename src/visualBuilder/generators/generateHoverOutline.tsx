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
    isVariant?: boolean
): void {
    const targetElementDimension = targetElement.getBoundingClientRect();

    const hoverOutline = document.querySelector<HTMLDivElement>(
        ".visual-builder__hover-outline"
    );

    if (hoverOutline) {
        hoverOutline.classList.remove(
            visualBuilderStyles()["visual-builder__hover-outline--hidden"]
        );

        if (disabled) {
            hoverOutline.classList.add(
                visualBuilderStyles()["visual-builder__hover-outline--disabled"]
            );
        } else {
            hoverOutline.classList.remove(
                visualBuilderStyles()["visual-builder__hover-outline--disabled"]
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
