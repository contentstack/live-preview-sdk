/** @jsxImportSource preact */
import { render } from "preact";
import CollabIndicator from "../components/Collab/CollabIndicator";
import Config from "../../configManager/configManager";
import { IThreadDTO } from "../types/collab.types";

const highlighCommentOffset = 30;

export function generateThreadsFromData(payloads: IThreadDTO[]) {
    if (!payloads || payloads.length === 0) {
        return;
    }

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
        popupContainer.setAttribute("threaduid", payload._id);
        popupContainer.style.zIndex = "999";
        popupContainer.style.cursor = "pointer";
        popupContainer.className = "collab-thread";

        // Render the React component
        render(
            <CollabIndicator activeThread={payload} newThread={false} />,
            popupContainer
        );

        // Append the container to the correct parent
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
    });
}

export function generateThreadFromData(payload: IThreadDTO): void {
    const config = Config.get();
    const { position, elementXPath } = payload;
    const { x: relativeX, y: relativeY } = position;

    const element = getElementByXpath(elementXPath);
    if (!element) {
        console.error("Element not found for the given XPath:", elementXPath);
        return;
    }
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY + relativeY * rect.height;
    const left = rect.left + window.scrollX + relativeX * rect.width;

    const popupContainer = document.createElement("div");
    popupContainer.setAttribute("field-path", elementXPath);
    popupContainer.setAttribute("relative", `x: ${relativeX}, y: ${relativeY}`);
    popupContainer.setAttribute("threaduid", payload._id);
    popupContainer.style.position = "absolute";
    popupContainer.style.top = `${top - highlighCommentOffset}px`;
    popupContainer.style.left = `${left - highlighCommentOffset}px`;
    popupContainer.style.zIndex = "999";
    popupContainer.style.cursor = "pointer";
    popupContainer.className = "collab-thread";

    if (config?.collab.enable) {
        if (config?.collab.isFeedbackMode) {
            Config.set("collab.isFeedbackMode", false);
        }
    }

    render(<CollabIndicator activeThread={payload} />, popupContainer);

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
    popupContainer.style.zIndex = "999";
    popupContainer.style.cursor = "pointer";
    popupContainer.className = "collab-thread";

    if (config?.collab.enable) {
        if (config?.collab.isFeedbackMode) {
            Config.set("collab.isFeedbackMode", false);
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

export function removeCollabIcon(threadUid: string): void {
    const thread = document.querySelector(`div[threaduid='${threadUid}']`);
    thread?.remove();
}

export function isCollabThread(target: HTMLElement): boolean {
    return Array.from(target.classList).some((className) =>
        className.startsWith("collab")
    );
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
