/**
 * Adds a hover outline to the target element.
 * @param targetElement - The element to add the hover outline to.
 * @param isAnchorElement - Boolean to check for anchor elements.
 * @returns void
 */
export function addHoverOutline(
  targetElement: Element,
  isAnchorElement: boolean,
  disabled?: boolean,
): void {

  const targetElementDimension = targetElement.getBoundingClientRect();

  const hoverOutline = document.querySelector<HTMLDivElement>(".visual-editor__hover-outline");

  if (hoverOutline) {
    hoverOutline.classList.remove("visual-editor__hover-outline--hidden");

    if (disabled) {
      hoverOutline.classList.add("visual-editor__hover-outline--disabled");
    }
    else {
      hoverOutline.classList.remove("visual-editor__hover-outline--disabled");
    }

    hoverOutline.style.top = `${targetElementDimension.top + window.scrollY}px`;
    hoverOutline.style.left = `${targetElementDimension.left}px`;
    hoverOutline.style.width = `${targetElementDimension.width}px`;
    hoverOutline.style.height = `${targetElementDimension.height}px`;
  }
}