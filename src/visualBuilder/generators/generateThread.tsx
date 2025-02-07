/** @jsxImportSource preact */
import { render } from "preact";
import { css } from "goober";
import CollabIndicator from "../components/Collab/CollabIndicator";
import Config from "../../configManager/configManager";
import { IThreadDTO } from "../types/collab.types";
import { MissingThreadsInfo } from "../types/collab.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

const highlighCommentOffset = 20;

const hiddenClass = css`
    display: none;
`;

export function generateThread(
    payload: IThreadDTO | any,
    options: { isNewThread?: boolean; updateConfig?: boolean } = {}
): string | undefined {
    const { isNewThread = false, updateConfig = false } = options;
    const config = Config.get?.();

    let relativeX: number, relativeY: number, resolvedXPath: string;

    if (isNewThread) {
        ({ relativeX, relativeY, xpath: resolvedXPath } = payload);
    } else {
        const { position, elementXPath } = payload;
        ({ x: relativeX, y: relativeY } = position);
        resolvedXPath = elementXPath;
    }

    const element = getElementByXpath(resolvedXPath);
    if (!element) {
        console.error("Element not found for the given XPath:", resolvedXPath);
        return payload._id;
    }

    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY + relativeY * rect.height;
    const left = rect.left + window.scrollX + relativeX * rect.width;

    const popupContainer = document.createElement("div");
    popupContainer.setAttribute("field-path", resolvedXPath);
    popupContainer.setAttribute("relative", `x: ${relativeX}, y: ${relativeY}`);
    popupContainer.style.position = "absolute";
    popupContainer.style.top = `${top - highlighCommentOffset}px`;
    popupContainer.style.left = `${left - highlighCommentOffset}px`;
    if (updateConfig) {
        popupContainer.style.zIndex = "1000";
    } else {
        popupContainer.style.zIndex = "999";
    }
    popupContainer.style.cursor = "pointer";
    popupContainer.className = "collab-thread";
    if (payload?._id) popupContainer.setAttribute("threaduid", payload._id);

    if (updateConfig && config?.collab.enable) {
        if (config?.collab.isFeedbackMode) {
            Config.set("collab.isFeedbackMode", false);
        }
    }

    render(
        <CollabIndicator
            activeThread={!isNewThread ? payload : undefined}
            newThread={isNewThread}
        />,
        popupContainer
    );

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

    return undefined;
}

export function updateCollabIconPosition() {
    const icons = document.querySelectorAll(
        ".visual-builder__collab-wrapper .collab-thread"
    );

    icons.forEach((icon) => {
        if (!(icon instanceof HTMLElement)) return;

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

        if (!targetElement) {
            icon.classList.add(hiddenClass);
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const x = rect.left + rect.width * relativeX + window.scrollX;
        const y = rect.top + rect.height * relativeY + window.scrollY;

        icon.style.top = `${y - highlighCommentOffset}px`;
        icon.style.left = `${x - highlighCommentOffset}px`;
        icon.classList.remove(hiddenClass);
    });
}
export function updatePopupPositions() {
    const popups = document.querySelectorAll(
        ".visual-builder__collab-wrapper .collab-thread .collab-popup"
    );

    popups.forEach((popup) => {
        if (popup && popup instanceof HTMLElement) {
            const parent = popup.closest(
                ".visual-builder__collab-wrapper .collab-thread"
            );

            if (!parent) {
                console.error(
                    "Parent element with class 'collab-thread' not found."
                );
                return;
            }

            const button = parent.querySelector(
                ".visual-builder__collab-wrapper .collab-thread .collab-indicator"
            );

            if (!button || !(button instanceof HTMLElement)) {
                console.error(
                    "Button with class 'collab-indicator' not found."
                );
                return;
            }

            calculatePopupPosition(button, popup);
        }
    });
}

export function calculatePopupPosition(
    button: HTMLElement,
    popup: HTMLElement
) {
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let popupHeight = popup.offsetHeight || 198;
    let popupWidth = popup.offsetWidth || 334;

    const spaceAbove = buttonRect.top;
    const spaceBelow = viewportHeight - buttonRect.bottom;

    let top, left;

    if (spaceAbove >= popupHeight) {
        top = buttonRect.top - popupHeight - 8;
    } else if (spaceBelow >= popupHeight) {
        top = buttonRect.bottom + 8;
    } else {
        top =
            spaceBelow > spaceAbove
                ? buttonRect.bottom + 8
                : Math.max(buttonRect.top - popupHeight - 8, 0);
    }

    left = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;

    top = Math.max(top, 0);
    left = Math.max(left, 0);
    left = Math.min(left, viewportWidth - popupWidth);

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;

    requestAnimationFrame(() => {
        const newPopupHeight = popup.offsetHeight;
        if (newPopupHeight !== popupHeight) {
            calculatePopupPosition(button, popup);
        }
    });
}

export function removeAllCollabIcons(): void {
    const icons = document.querySelectorAll(
        ".visual-builder__collab-wrapper .collab-thread"
    );
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

export function handleMissingThreads(payload: MissingThreadsInfo) {
    visualBuilderPostMessage?.send(
        VisualBuilderPostMessageEvents.COLLAB_MISSING_THREADS,
        { payload }
    );
}

export function handleEmptyThreads() {
    const icons = document.querySelectorAll(
        ".visual-builder__collab-wrapper .collab-thread"
    );
    icons?.forEach((icon) => {
        if (!icon.hasAttribute("threaduid")) {
            icon.remove();
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
