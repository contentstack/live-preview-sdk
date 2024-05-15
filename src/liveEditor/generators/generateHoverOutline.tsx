
/**
 * Adds a hover outline to the target element.
 * @param targetElement - The element to add the hover outline to.
 * @returns void
 */
export function addHoverOutline(
  targetElement: Element
): void {

  const targetElementDimension = targetElement.getBoundingClientRect();

  const hoverOutline = document.querySelector<HTMLDivElement>(".visual-editor__hover-outline");

  if (hoverOutline) {
    hoverOutline.style.top = `${targetElementDimension.top + window.scrollY}px`;
    hoverOutline.style.left = `${targetElementDimension.left}px`;
    hoverOutline.style.width = `${targetElementDimension.width}px`;
    hoverOutline.style.height = `${targetElementDimension.height}px`;
  }
}