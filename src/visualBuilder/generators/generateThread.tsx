/** @jsxImportSource preact */
import { render } from "preact";
import CollabIndicator from "../components/Collab/CollabIndicator";
import Config from "../../configManager/configManager";
import { css } from "goober";

const highlighCommentOffset = 30;

// Define a hidden class in goober
const hiddenClass = css`
    display: none;
`;

export function generateThreadsFromData(payloads: any[], fromVB = false) {
    // Transform data function
    function transformData(payload: any) {
        return {
            api_key: "blt05d58ee84d13fd72",
            _content_type_uid: "page",
            entry_uid: "blt1bbd1c10058a089d",
            locale: payload.locale,
            status: 1,
            uid: payload._id,
            title: `Description-${Date.now()}`,
            field: {
                uid: "description",
                path: "sections.home.csdc2330a19d43171f.hero_section.description",
                og_path: "sections.home.hero_section.description",
            },
            org_uid: "blt739e38d90d4fc4e6",
            created_by: "blte26110c4ea641ed9",
            created_at: payload.createdAt,
        };
    }

    const renderThreads = () => {
        payloads.forEach((payload) => {
            const { position, elementXPath } = payload;
            const { x: relativeX, y: relativeY } = position;
            const element = getElementByXpath(elementXPath);

            if (!element) {
                console.error(
                    "Element not found for the given XPath:",
                    elementXPath
                );
                return;
            }

            // Calculate the positioning
            const rect = element.getBoundingClientRect();
            const top = rect.top + window.scrollY + relativeY * rect.height;
            const left = rect.left + window.scrollX + relativeX * rect.width;

            // Create container for the popup
            const popupContainer = document.createElement("div");
            popupContainer.setAttribute("field-path", elementXPath);
            popupContainer.setAttribute(
                "relative",
                `x: ${relativeX}, y: ${relativeY}`
            );
            popupContainer.style.position = "absolute";
            popupContainer.style.top = `${top - highlighCommentOffset}px`;
            popupContainer.style.left = `${left - highlighCommentOffset}px`;
            popupContainer.style.zIndex = "1000";
            popupContainer.style.cursor = "pointer";
            popupContainer.className = "collab-thread";

            // Transform the data and pass it as props
            const transformedData = transformData(payload);
            render(
                <CollabIndicator
                    activeDiscussion={transformedData}
                    newThread={false}
                />,
                popupContainer
            );

            // Append the container to the correct parent
            const visualBuilderContainer = document.querySelector(
                ".visual-builder__container"
            );
            if (visualBuilderContainer) {
                let highlightCommentWrapper =
                    visualBuilderContainer.querySelector(
                        ".visual-builder__collab-wrapper"
                    );
                if (!highlightCommentWrapper) {
                    highlightCommentWrapper = document.createElement("div");
                    highlightCommentWrapper.className =
                        "visual-builder__collab-wrapper";
                    visualBuilderContainer.appendChild(highlightCommentWrapper);
                }
                highlightCommentWrapper.appendChild(popupContainer);
            } else {
                document.body.appendChild(popupContainer);
            }
        });
    };

    if (fromVB) {
        renderThreads();
    } else {
        setTimeout(renderThreads, 5000);
    }
}

export function generateThread(payload: any): void {
    const config = Config.get();
    const { relativeX, relativeY, xpath } = payload;

    const element = getElementByXpath(xpath);
    if (!element) {
        console.error("Element not found for the given XPath:", xpath);
        return;
    }
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY + relativeY * rect.height;
    const left = rect.left + window.scrollX + relativeX * rect.width;

    const popupContainer = document.createElement("div");
    popupContainer.setAttribute("field-path", xpath);
    popupContainer.setAttribute("relative", `x: ${relativeX}, y: ${relativeY}`);
    popupContainer.style.position = "absolute";
    popupContainer.style.top = `${top - highlighCommentOffset}px`;
    popupContainer.style.left = `${left - highlighCommentOffset}px`;
    popupContainer.style.zIndex = "1000";
    popupContainer.style.cursor = "pointer";
    popupContainer.className = "collab-thread";

    if (config?.collab.enable) {
        if (config?.collab.state) {
            Config.set("collab.state", false);
        }
    }

    render(<CollabIndicator newThread={true} />, popupContainer);

    const visualBuilderContainer = document.querySelector(
        ".visual-builder__container"
    );
    if (visualBuilderContainer) {
        let highlightCommentWrapper = visualBuilderContainer.querySelector(
            ".visual-builder__collab-wrapper"
        );
        if (!highlightCommentWrapper) {
            highlightCommentWrapper = document.createElement("div");
            highlightCommentWrapper.className =
                "visual-builder__collab-wrapper";
            visualBuilderContainer.appendChild(highlightCommentWrapper);
        }
        highlightCommentWrapper.appendChild(popupContainer);
    } else {
        document.body.appendChild(popupContainer);
    }
}

export function updateCollabIconPosition() {
    const icons = document.querySelectorAll(".collab-thread");

    icons.forEach((icon) => {
        if (icon && icon instanceof HTMLElement) {
            const path = icon.getAttribute("field-path");
            const relative = icon.getAttribute("relative");

            if (!path || !relative) {
                console.error("Missing field-path or relative attribute.");
                return;
            }

            const match = relative.match(/x: ([\d.]+), y: ([\d.]+)/);
            if (!match) {
                console.error("Invalid relative attribute format.");
                return;
            }
            const relativeX = parseFloat(match[1]);
            const relativeY = parseFloat(match[2]);

            const targetElement = getElementByXpath(path);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const x = rect.left + rect.width * relativeX + window.scrollX;
                const y = rect.top + rect.height * relativeY + window.scrollY;

                icon.style.top = `${y - highlighCommentOffset}px`;
                icon.style.left = `${x - highlighCommentOffset}px`;
            }
        }
    });
}

export function updatePopupPositions() {
    // Select all collab-popup elements
    const popups = document.querySelectorAll(".collab-popup");

    popups.forEach((popup) => {
        if (popup && popup instanceof HTMLElement) {
            // Find the parent element containing the button and the popup
            const parent = popup.closest(".collab-thread");

            if (!parent) {
                console.error(
                    "Parent element with class 'collab-thread' not found."
                );
                return;
            }

            // Locate the button inside the parent element
            const button = parent.querySelector(".collab-indicator");

            if (!button || !(button instanceof HTMLElement)) {
                console.error(
                    "Button with class 'collab-indicator' not found."
                );
                return;
            }

            const buttonRect = button.getBoundingClientRect();
            const popupHeight = 422;
            const popupWidth = 334;
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            const spaceAbove = buttonRect.top;
            const spaceBelow = viewportHeight - buttonRect.bottom;

            let top, left;

            // Determine vertical positioning
            if (spaceAbove >= popupHeight) {
                top = buttonRect.top - popupHeight - 8; // Position above button
            } else {
                top = buttonRect.bottom + 8; // Position below button
            }

            // Determine horizontal positioning (centered relative to the button)
            left = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;

            // Clamp positions to viewport bounds
            top = Math.max(top, 0);
            left = Math.max(left, 0);
            left = Math.min(left, viewportWidth - popupWidth);

            // Update the popup's position
            popup.style.top = `${top}px`;
            popup.style.left = `${left}px`;
        }
    });
}

export function removeAllCollabIcons(): void {
    const icons = document.querySelectorAll(".collab-thread");
    icons?.forEach((icon) => icon?.remove());
}

/**
 * Show all .highlighted-comment icons that have the hiddenClass applied.
 */
export function showAllHiddenCollabIcons(): void {
    // Query all elements that have both .highlighted-comment and hiddenClass
    const hiddenIcons = document.querySelectorAll<HTMLElement>(
        `.collab-thread.${hiddenClass}`
    );

    // Loop through each hidden icon and remove the hiddenClass
    hiddenIcons.forEach((icon) => {
        icon.classList.remove(hiddenClass); // Remove the hiddenClass to show the icon
    });
}

function getElementByXpath(xpath: string): HTMLElement | null {
    const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue as HTMLElement | null;
}

// /**
//  * Removes the first highlighted comment icon based on an array of paths.
//  *
//  * @param pathsToRemove - Array of field-paths to remove.
//  */
// export function removeHighlightedCollabIcon(pathToRemove: string): void {
//     // Loop through each path in the array
//     const iconToRemove = document.querySelectorAll(
//         `.highlighted-comment[field-path="${pathToRemove}"]`
//     );
//     iconToRemove?.forEach((icon) => icon?.remove());
// }

// /**
//  * Toggle display style of a specific highlighted comment icon.
//  *
//  * @param path - The data-cslp attribute of the element whose corresponding highlighted comment icon should be toggled.
//  * @param shouldShow - Boolean value to determine whether to show or hide the icon.
//  * If true, the icon will be displayed. If false, the icon will be hidden.
//  */
// export function toggleHighlightedCommentIconDisplay(
//     path: string,
//     shouldShow: boolean
// ): void {
//     const icons = document.querySelectorAll<HTMLElement>(
//         `.highlighted-comment[field-path="${path}"]`
//     );

//     icons.forEach((icon) => {
//         if (shouldShow) {
//             icon.classList.remove(hiddenClass); // Show the element
//         } else {
//             icon.classList.add(hiddenClass); // Hide the element using goober's hidden class
//         }
//     });
// }
