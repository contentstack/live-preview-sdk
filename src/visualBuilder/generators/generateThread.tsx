/** @jsxImportSource preact */
import { render } from "preact";
import { css } from "goober";
import CollabIndicator from "../components/Collab/CollabIndicator";
import Config from "../../configManager/configManager";
import { IThreadDTO, IThreadRenderStatus } from "../types/collab.types";
import {
    MissingThreadsInfo,
    toggleCollabPopupEvent,
} from "../types/collab.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { adjustPositionToViewport } from "../utils/collabUtils";

const popupTopOffset = 43;
const popupLeftOffset = 9;

const hiddenClass = css`
    display: none;
`;

function createPopupContainer(
    resolvedXPath: string,
    relativeX: number,
    relativeY: number,
    top: number,
    left: number,
    updateConfig: boolean,
    hidden: boolean,
    payload: IThreadDTO | any
): HTMLDivElement {
    const popupContainer = document.createElement("div");
    popupContainer.setAttribute("field-path", resolvedXPath);
    popupContainer.setAttribute("relative", `x: ${relativeX}, y: ${relativeY}`);
    popupContainer.style.position = "absolute";
    popupContainer.style.top = `${top - popupTopOffset}px`;
    popupContainer.style.left = `${left - popupLeftOffset}px`;
    popupContainer.style.zIndex = updateConfig ? "1000" : "999";
    popupContainer.style.cursor = "pointer";
    popupContainer.className = "collab-thread";
    if (hidden) popupContainer.classList.add(hiddenClass);
    if (payload?._id) popupContainer.setAttribute("threaduid", payload._id);
    return popupContainer;
}

function appendPopupContainer(popupContainer: HTMLDivElement): void {
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

export function generateThread(
    payload: IThreadDTO | any,
    options: {
        isNewThread?: boolean;
        updateConfig?: boolean;
        hidden?: boolean;
    } = {}
): string | undefined {
    const {
        isNewThread = false,
        updateConfig = false,
        hidden = false,
    } = options;
    const config = Config.get?.();

    let relativeX: number, relativeY: number, resolvedXPath: string;

    if (isNewThread) {
        ({ relativeX, relativeY, xpath: resolvedXPath } = payload);
    } else {
        const { position, elementXPath } = payload;
        ({ x: relativeX, y: relativeY } = position);
        resolvedXPath = elementXPath;
    }

    // Filter to remove already rendered threads
    if (payload?._id) {
        const existingThread = document.querySelector(
            `div[threaduid='${payload._id}']`
        );
        if (existingThread) {
            return undefined;
        }
    }

    const element = getElementByXpath(resolvedXPath);
    if (!element) {
        return payload._id;
    }

    const rect = element.getBoundingClientRect();
    let top = rect.top + window.scrollY + relativeY * rect.height;
    let left = rect.left + window.scrollX + relativeX * rect.width;

    const adjustedPosition = adjustPositionToViewport({ top, left });
    top = adjustedPosition.top;
    left = adjustedPosition.left;

    const popupContainer = createPopupContainer(
        resolvedXPath,
        relativeX,
        relativeY,
        top,
        left,
        updateConfig,
        hidden,
        payload
    );

    if (updateConfig && config?.collab?.enable) {
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

    appendPopupContainer(popupContainer);

    return undefined;
}

export function updateCollabIconPosition() {
    const icons = document.querySelectorAll(
        ".visual-builder__collab-wrapper .collab-thread"
    );
    const config = Config.get?.();
    if (config?.collab?.pauseFeedback) return;

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
        let left = rect.left + rect.width * relativeX + window.scrollX;
        let top = rect.top + rect.height * relativeY + window.scrollY;

        const adjustedPosition = adjustPositionToViewport({ top, left });
        top = adjustedPosition.top;
        left = adjustedPosition.left;

        icon.style.top = `${top - popupTopOffset}px`;
        icon.style.left = `${left - popupLeftOffset}px`;
        icon.classList.remove(hiddenClass);
    });
}
export function updatePopupPositions() {
    const popups = document.querySelectorAll(
        ".visual-builder__collab-wrapper .collab-thread .collab-popup"
    );

    const config = Config.get?.();
    if (config?.collab?.pauseFeedback) return;

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

export function updateSuggestionListPosition() {
    const suggestionLists = document.querySelectorAll(
        ".collab-thread-body--input--textarea--suggestionsList"
    );

    if (!suggestionLists.length) return;

    suggestionLists.forEach((list) => {
        if (!(list instanceof HTMLElement)) return;

        const textarea = document.querySelector(
            ".collab-thread-body--input--textarea"
        ) as HTMLTextAreaElement | null;

        if (!textarea) return;
        const positionData = list.getAttribute("data-position");
        const parsedData = positionData ? JSON.parse(positionData) : null;
        const showAbove = window.getComputedStyle(list).bottom !== "auto";
        const textareaRect = textarea.getBoundingClientRect();
        if (showAbove) {
            const lineHeight =
                parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
            const paddingTop =
                parseInt(window.getComputedStyle(textarea).paddingTop) || 8;
            const cursorLineY =
                parsedData?.cursorLineY || paddingTop + lineHeight;

            list.style.position = "fixed";
            list.style.bottom = `${window.innerHeight - textareaRect.top - cursorLineY + lineHeight}px`;
            list.style.top = "auto";
        } else {
            const lineHeight =
                parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
            const paddingTop =
                parseInt(window.getComputedStyle(textarea).paddingTop) || 8;

            const cursorLineY =
                parsedData?.cursorLineY || paddingTop + lineHeight;

            list.style.position = "fixed";
            list.style.top = `${textareaRect.top + cursorLineY}px`;
            list.style.bottom = "auto";
        }

        if (!positionData && textareaRect) {
            const lineHeight =
                parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
            const paddingTop =
                parseInt(window.getComputedStyle(textarea).paddingTop) || 8;

            const positionInfo = {
                showAbove: showAbove,
                cursorLineY: paddingTop + lineHeight,
            };
            list.setAttribute("data-position", JSON.stringify(positionInfo));
        }

        const listRect = list.getBoundingClientRect();

        if (!showAbove && listRect.bottom > window.innerHeight) {
            const lineHeight =
                parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
            const paddingTop =
                parseInt(window.getComputedStyle(textarea).paddingTop) || 8;
            const cursorLineY =
                parsedData?.cursorLineY || paddingTop + lineHeight;

            list.style.bottom = `${window.innerHeight - textareaRect.top - cursorLineY + lineHeight}px`;
            list.style.top = "auto";

            if (positionData) {
                const updatedData = JSON.parse(positionData);
                updatedData.showAbove = true;
                list.setAttribute("data-position", JSON.stringify(updatedData));
            }
        } else if (showAbove && listRect.top < 0) {
            const lineHeight =
                parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
            const paddingTop =
                parseInt(window.getComputedStyle(textarea).paddingTop) || 8;
            const cursorLineY =
                parsedData?.cursorLineY || paddingTop + lineHeight;

            list.style.top = `${textareaRect.top + cursorLineY}px`;
            list.style.bottom = "auto";

            if (positionData) {
                const updatedData = JSON.parse(positionData);
                updatedData.showAbove = false;
                list.setAttribute("data-position", JSON.stringify(updatedData));
            }
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

export function hideAllCollabIcons(): void {
    const icons = document.querySelectorAll(
        ".visual-builder__collab-wrapper .collab-thread"
    );
    icons?.forEach((icon) => icon?.classList.add(hiddenClass));
}

export function showAllCollabIcons(): void {
    const icons = document.querySelectorAll(
        ".visual-builder__collab-wrapper .collab-thread"
    );
    icons?.forEach((icon) => icon?.classList.remove(hiddenClass));
}

export function removeCollabIcon(threadUid: string): void {
    const thread = document.querySelector(`div[threaduid='${threadUid}']`);
    thread?.remove();
}

export function toggleCollabPopup({
    threadUid = "",
    action,
}: toggleCollabPopupEvent): void {
    document.dispatchEvent(
        new CustomEvent("toggleCollabPopup", {
            detail: { threadUid, action },
        })
    );
}

export function HighlightThread(threadUid: string): void {
    toggleCollabPopup({ threadUid, action: "open" });
}

export function isCollabThread(target: HTMLElement): boolean {
    return Array.from(target.classList).some((className) =>
        className.startsWith("collab")
    );
}

export function handleMissingThreads(payload: MissingThreadsInfo) {
    visualBuilderPostMessage?.send(
        VisualBuilderPostMessageEvents.COLLAB_MISSING_THREADS,
        payload
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

const retryConfig = {
    maxRetries: 5,
    retryDelay: 1000,
};

let isProcessingThreads = false;

export const threadRenderStatus = new Map<string, IThreadRenderStatus>();

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRenderStatus(threadId: string): IThreadRenderStatus {
    if (!threadRenderStatus.has(threadId)) {
        threadRenderStatus.set(threadId, {
            threadId,
            attempts: 0,
            isRendered: false,
        });
    }
    return threadRenderStatus.get(threadId)!;
}

function updateRenderStatus(threadId: string, isRendered: boolean): void {
    const status = getRenderStatus(threadId);
    status.isRendered = isRendered;
    threadRenderStatus.set(threadId, status);
}

export function clearThreadStatus(threadId: string): void {
    threadRenderStatus.delete(threadId);
}

export function clearAllThreadStatus(): void {
    threadRenderStatus.clear();
    isProcessingThreads = false;
}

async function processThread(thread: IThreadDTO): Promise<string | undefined> {
    let status = getRenderStatus(thread._id);

    while (status.attempts < retryConfig.maxRetries) {
        try {
            const result = generateThread(thread);
            if (result === undefined) {
                updateRenderStatus(thread._id, true);
                return undefined;
            }

            status.attempts++;
            updateRenderStatus(thread._id, false);

            if (status.attempts < retryConfig.maxRetries) {
                await delay(retryConfig.retryDelay);
            }
        } catch (error) {
            console.error(`Error rendering thread ${thread._id}:`, error);
            status.attempts++;
            if (status.attempts >= retryConfig.maxRetries) {
                break;
            }
            await delay(retryConfig.retryDelay);
        }
    }

    return thread._id;
}

export async function processThreadsBatch(
    threads: IThreadDTO[]
): Promise<string[]> {
    if (isProcessingThreads) return [];

    try {
        isProcessingThreads = true;
        const unrenderedThreads = filterUnrenderedThreads(threads);
        if (unrenderedThreads.length === 0) return [];

        const missingThreadIds = (
            await Promise.all(
                unrenderedThreads.map((thread) => processThread(thread))
            )
        ).filter(Boolean) as string[];

        missingThreadIds.forEach(clearThreadStatus);
        return missingThreadIds;
    } finally {
        isProcessingThreads = false;
    }
}

export function filterUnrenderedThreads(threads: IThreadDTO[]): IThreadDTO[] {
    return threads.filter((thread) => {
        const existingThread = document.querySelector(
            `[threaduid="${thread._id}"]`
        );
        if (existingThread) {
            updateRenderStatus(thread._id, true);
            return false;
        }
        return true;
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
