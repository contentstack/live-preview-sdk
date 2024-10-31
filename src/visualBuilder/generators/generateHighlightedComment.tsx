import { h, VNode } from "preact"; // Explicitly import VNode from Preact
import { render } from "preact";
import HighlightedCommentIcon from "../components/HighlightedCommentIcon";
import { css } from "goober";
import React from "preact/compat";
import { IHighlightCommentData } from "../eventManager/useHighlightCommentIcon";

/**
 * Inserts highlighted comment icons based on an array of paths.
 *
 * This function locates elements in the DOM based on the `fieldMetadata.cslpValue`,
 * and appends a comment icon near each matching element.
 *
 * @param payload - Array of comment data with field metadata, schema, absolutePath and discussion ID.
 */
const highlighCommentOffset = 25;

export function highlightCommentIconOnCanvas(
    payload: IHighlightCommentData[]
): void {
    const uniquePaths: { [key: string]: boolean } = {}; // Using object for uniqueness

    payload.forEach((data) => {
        const cslpValue = data?.fieldMetadata?.cslpValue;

        // Check if the cslpValue is already in the Object
        if (!cslpValue || uniquePaths[cslpValue]) {
            return; // Skip if the value is not unique
        }

        uniquePaths[cslpValue] = true; // Mark it as processed

        const element = document.querySelector(`[data-cslp="${cslpValue}"]`);
        if (element && element instanceof HTMLElement) {
            const { top, left } = element.getBoundingClientRect();

            const iconContainer = document.createElement("div");
            iconContainer.setAttribute("field-path", cslpValue);

            iconContainer.style.position = "fixed";
            iconContainer.style.top = `${top - highlighCommentOffset}px`;
            iconContainer.style.left = `${left - highlighCommentOffset}px`;
            iconContainer.style.zIndex = "1000";
            iconContainer.style.cursor = "pointer"
            iconContainer.className = "highlighted-comment";

            // Render the HighlightedCommentIcon using Preact's render method
            render(
                h(HighlightedCommentIcon, { data }), // Use h directly with Preact
                iconContainer
            );

            const visualBuilderContainer = document.querySelector(
                ".visual-builder__container"
            );
            if (visualBuilderContainer) {
                let highlightCommentWrapper =
                    visualBuilderContainer.querySelector(
                        ".visual-builder__highlighted-comment-wrapper"
                    );
                if (!highlightCommentWrapper) {
                    highlightCommentWrapper = document.createElement("div");
                    highlightCommentWrapper.className =
                        "visual-builder__highlighted-comment-wrapper";
                    visualBuilderContainer.appendChild(highlightCommentWrapper);
                }
                highlightCommentWrapper.appendChild(iconContainer);
            }
        }
    });
}

/**
 * Update Highlighted comment position , whenever scroll or resize happen.
 */

export function updateHighlightedCommentIconPosition() {
    // Query all elements with the .highlighted-comment class
    const icons = document.querySelectorAll(".highlighted-comment");

    icons.forEach((icon) => {
        if (icon && icon instanceof HTMLElement) {
            // Get the field-path attribute from the icon container
            const path = icon.getAttribute("field-path");
            if (path) {
                // Query the target element using the path
                const targetElement = document.querySelector(
                    `[data-cslp="${path}"]`
                );
                if (targetElement && targetElement instanceof HTMLElement) {
                    // Get the target element's position relative to the viewport
                    const { top, left } = targetElement.getBoundingClientRect();

                    // Update the position of the icon container
                    icon.style.top = `${top - highlighCommentOffset}px`; // Adjust based on the target element's top
                    icon.style.left = `${left - highlighCommentOffset}px`; // Adjust based on the target element's left
                }
            }
        }
    });
}

/**
 * Removes the first highlighted comment icon based on an array of paths.
 *
 * @param pathsToRemove - Array of field-paths to remove.
 */
export function removeHighlightedCommentIcon(pathToRemove: string): void {
    // Loop through each path in the array
    const iconToRemove = document.querySelectorAll(
        `.highlighted-comment[field-path="${pathToRemove}"]`
    );
    iconToRemove?.forEach((icon) => icon?.remove());
}

export function removeAllHighlightedCommentIcons(): void {
    const icons = document.querySelectorAll(".highlighted-comment");
    icons?.forEach((icon) => icon?.remove());
}

// Define a hidden class in goober
const hiddenClass = css`
    display: none;
`;

/**
 * Toggle display style of a specific highlighted comment icon.
 *
 * @param path - The data-cslp attribute of the element whose corresponding highlighted comment icon should be toggled.
 * @param shouldShow - Boolean value to determine whether to show or hide the icon.
 * If true, the icon will be displayed. If false, the icon will be hidden.
 */
export function toggleHighlightedCommentIconDisplay(
    path: string,
    shouldShow: boolean
): void {
    const icons = document.querySelectorAll<HTMLElement>(
        `.highlighted-comment[field-path="${path}"]`
    );

    icons.forEach((icon) => {
        if (shouldShow) {
            icon.classList.remove(hiddenClass); // Show the element
        } else {
            icon.classList.add(hiddenClass); // Hide the element using goober's hidden class
        }
    });
}

/**
 * Show all .highlighted-comment icons that have the hiddenClass applied.
 */
export function showAllHiddenHighlightedCommentIcons(): void {
    // Query all elements that have both .highlighted-comment and hiddenClass
    const hiddenIcons = document.querySelectorAll<HTMLElement>(
        `.highlighted-comment.${hiddenClass}`
    );

    // Loop through each hidden icon and remove the hiddenClass
    hiddenIcons.forEach((icon) => {
        icon.classList.remove(hiddenClass); // Remove the hiddenClass to show the icon
    });
}
