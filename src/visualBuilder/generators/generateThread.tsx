/** @jsxImportSource preact */
import { render } from "preact";
import CollabIndicator from "../components/Collab/CollabIndicator";
import Config from "../../configManager/configManager";

const highlighCommentOffset = 30;

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

    if (config?.isCollabActive === true) {
        Config.set("isCollabActive", false);
    }
    render(<CollabIndicator />, popupContainer);

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
