import { h, VNode } from "preact"; // Explicitly import VNode from Preact
import { render } from "preact";
import HighlightedCommentIcon from "../components/HighlightedCommentIcon";

export function highlightCommentIconOnCanvas(hasCommentPaths: string[]): void {
    hasCommentPaths.forEach((path) => {
        const element = document.querySelector(`[data-cslp="${path}"]`);
        if (element && element instanceof HTMLElement) {
            const { top, left } = element.getBoundingClientRect();

            const iconContainer = document.createElement("div");
            iconContainer.setAttribute("field-path", path);

            iconContainer.style.position = "fixed"; 
            iconContainer.style.top = `${top - 12}px`;
            iconContainer.style.left = `${left - 12}px`; 
            iconContainer.style.zIndex = "1000";
            iconContainer.className = "highlighted-comment";

            // Render the HighlightedCommentIcon using Preact's render method
            render(
                h(HighlightedCommentIcon, {}),  // Use h directly with Preact
                iconContainer
            );

            document.body.appendChild(iconContainer); // Append to body
        }
    });
}



export function updateHighlightedCommentIconPosition() {
    // Query all elements with the .highlighted-comment class
    const icons = document.querySelectorAll(".highlighted-comment");
    
    icons.forEach((icon) => {
        if (icon && icon instanceof HTMLElement) {
      // Get the field-path attribute from the icon container
      const path = icon.getAttribute("field-path");
      if (path) {
          // Query the target element using the path
          const targetElement = document.querySelector(`[data-cslp="${path}"]`);
          if (targetElement && targetElement instanceof HTMLElement) {
              // Get the target element's position relative to the viewport
              const { top, left } = targetElement.getBoundingClientRect();

              // Update the position of the icon container
              icon.style.top = `${top - 12}px`;  // Adjust based on the target element's top
              icon.style.left = `${left - 12}px`;  // Adjust based on the target element's left
          }
      }
        }
    });
}
