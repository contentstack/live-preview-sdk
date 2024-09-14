import React, { useEffect } from "react";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

// Define the event data for handling comments
 interface IHighlightComments {
    paths: string[]; // Array of paths where comments exist
}

 interface IHighlightCommentsEvent {
    data: IHighlightComments;
}

// Utility function to add comment icons to elements
function highlightCommentsOnCanvas(hasCommentPaths:string[]) {
  hasCommentPaths?.forEach((path) => {
      const element = document.querySelector(`[data-cslp="${path}"]`);
      if (element && element instanceof HTMLElement) {
          const iconWrapper = document.createElement("div");
          iconWrapper.className = "highlighted-comment";
          iconWrapper.style.position = "absolute";
          iconWrapper.style.top = "0"; // Top-left corner
          iconWrapper.style.left = "0"; // Adjust positioning
          iconWrapper.style.transform = "translate(-50%, -50%)";
          iconWrapper.style.zIndex = "1000";

          // Create the read icon
          const readIcon = document.createElement("span");
          readIcon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.4375 9C8.4375 8.68934 8.68934 8.4375 9 8.4375H15C15.3107 8.4375 15.5625 8.68934 15.5625 9C15.5625 9.31066 15.3107 9.5625 15 9.5625H9C8.68934 9.5625 8.4375 9.31066 8.4375 9Z" fill="#475161"/>
              <path d="M8.4375 12C8.4375 11.6893 8.68934 11.4375 9 11.4375H15C15.3107 11.4375 15.5625 11.6893 15.5625 12C15.5625 12.3107 15.3107 12.5625 15 12.5625H9C8.68934 12.5625 8.4375 12.3107 8.4375 12Z" fill="#475161"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M3 5.25C3 4.83579 3.33579 4.5 3.75 4.5H20.25C20.6642 4.5 21 4.83579 21 5.25V16.4423C21 16.8565 20.6642 17.1923 20.25 17.1923H14.9804C14.853 17.1923 14.7343 17.257 14.6652 17.3641L12.9633 20.0042C12.6651 20.4669 11.9866 20.4613 11.696 19.9938L10.1746 17.5464C10.0378 17.3262 9.79691 17.1923 9.53766 17.1923H3.75C3.33579 17.1923 3 16.8565 3 16.4423V5.25ZM4.125 16.0673V5.625H19.875V16.0673H14.9804C14.4707 16.0673 13.9958 16.3262 13.7197 16.7546L12.3387 18.8968L11.1301 16.9524C10.7879 16.402 10.1858 16.0673 9.53766 16.0673H4.125Z" fill="#475161"/>
            </svg>
          `;
          readIcon.style.position = "relative";

          // Create the red dot
          const redDot = document.createElement("span");
          redDot.innerHTML = `
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="4" fill="#EB5646" />
              <circle cx="5" cy="5" r="4.5" stroke="white" stroke-opacity="0.6" />
            </svg>
          `;
          redDot.style.position = "absolute";
          redDot.style.top = "-4px";
          redDot.style.right = "-4px";

          // Append both the read icon and the red dot to the wrapper
          iconWrapper.appendChild(readIcon);
          iconWrapper.appendChild(redDot);

          // Append the combined icon to the queried element
          element.style.position = "relative";
          element.appendChild(iconWrapper);
      }
  });
}


// Function to remove all comment icons
function removeAllCommentIcons() {
    document
        .querySelectorAll(".highlighted-comment")
        .forEach((icon) => icon.remove());
}

// Handler for adding comment icons
const handleAddCommentIcons = (event: IHighlightCommentsEvent) => {
    const { paths } = event.data; // Get the array of paths with comments
    highlightCommentsOnCanvas(paths); // Add icons to the elements
};

// Handler for removing all comment icons
const handleRemoveCommentIcons = () => {
    removeAllCommentIcons(); // Remove all comment icons
};

// Custom hook for handling highlight comment actions
 const useHighlightComment = () => {
    // Add event listeners for adding and removing comment icons
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.HIGHLIGHT_ACTIVE_COMMENTS,
        handleAddCommentIcons
    );
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.REMOVE_HIGHLIGHTED_COMMENTS,
        handleRemoveCommentIcons
    );
};
