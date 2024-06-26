import { throttle } from "lodash-es";

// To account for animation(transition) delay
const makeHoverOutlineClickable = 
  throttle((hoverOutline: HTMLElement, cslpValue: string) => {
      hoverOutline.setAttribute('data-cslp', cslpValue);
      hoverOutline.classList.remove('visual-editor__hover-outline--unclickable');
    }, 200, { trailing: true, leading: false }
  );

/**
 * Adds a hover outline to the target element.
 * @param targetElement - The element to add the hover outline to.
 * @param isAnchorElement - Boolean to check for anchor elements.
 * @returns void
 */
export function addHoverOutline(
  targetElement: Element,
  isAnchorElement: boolean
): void {

  const targetElementDimension = targetElement.getBoundingClientRect();

  const hoverOutline = document.querySelector<HTMLDivElement>(".visual-editor__hover-outline");

  if (hoverOutline) {

    if(isAnchorElement){
      const cslpValue = targetElement.getAttribute('data-cslp') || '';
      makeHoverOutlineClickable(hoverOutline, cslpValue);
    }
    else if(!targetElement.isSameNode(hoverOutline)) {
      makeHoverOutlineClickable.cancel();
      hoverOutline.removeAttribute('data-cslp');
      hoverOutline.classList.add('visual-editor__hover-outline--unclickable');
    }

    hoverOutline.style.top = `${targetElementDimension.top + window.scrollY}px`;
    hoverOutline.style.left = `${targetElementDimension.left}px`;
    hoverOutline.style.width = `${targetElementDimension.width}px`;
    hoverOutline.style.height = `${targetElementDimension.height}px`;
  }
}