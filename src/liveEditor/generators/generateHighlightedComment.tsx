import { render } from "preact";
import HighlightedCommentIcon from "../HighlightedCommentIcon";
import React from "react";

export function highlightCommentIconOnCanvas(hasCommentPaths: string[]): void {
    hasCommentPaths.forEach((path) => {
        const element = document.querySelector(`[data-cslp="${path}"]`);
        if (element && element instanceof HTMLElement) {
            const { top, left } = element.getBoundingClientRect(); // Get right edge and width

            const iconContainer = document.createElement("div");
            iconContainer.setAttribute("path", path);

            // Position the icon at the top-right corner (right edge)
            iconContainer.style.position = "fixed"; // or "absolute" based on your need
            iconContainer.style.top = `${top - 12}px`; // Align with the top of the element
            iconContainer.style.left = `${left - 12}px`; // Align with the right edge of the element
            iconContainer.style.zIndex = "1000"
            iconContainer.className = "highlighted-comment"
            // Render the HighlightedCommentIcon into the container
            render(
                <HighlightedCommentIcon />, // Pass updated coordinates to the icon
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
      // Get the path attribute from the icon container
      const path = icon.getAttribute("path");
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
