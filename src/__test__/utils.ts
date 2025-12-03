import { EventManager } from "@contentstack/advanced-post-message";
import { act, fireEvent, render, waitFor } from "@testing-library/preact";
import { VisualBuilderPostMessageEvents } from "../visualBuilder/utils/types/postMessage.types";
import { ComponentChild } from "preact";

export function convertObjectToMinifiedString(
    obj: { [key: string]: any } | string
): any {
    let stringObj = obj;
    if (typeof obj !== "string") {
        stringObj = JSON.stringify(obj);
    }
    return stringObj.replace(/([\n]+|[\s]{2,})/gm, " ");
}

export class DOMRect {
    top = 76.75;
    right = 1587;
    bottom = 109.75;
    left = 58;
    constructor(
        public x = 5,
        public y = 0,
        public width = 0,
        public height = 0
    ) {}
    static fromRect(other?: DOMRectInit): DOMRect {
        return new DOMRect(other?.x, other?.y, other?.width, other?.height);
    }
    toJSON(): string {
        return JSON.stringify(this);
    }
}

export async function sleep(waitTimeInMs = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, waitTimeInMs));
}

export const waitForHoverOutline = async (options?: {
    timeout?: number;
    interval?: number;
}) => {
    // First, wait for the outline element to exist (faster check)
    await waitFor(
        () => {
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            );
            expect(hoverOutline).not.toBeNull();
        },
        {
            timeout: options?.timeout ?? 2000,
            interval: options?.interval ?? 5, // Faster polling: 5ms default
        }
    );

    // Then wait for style attribute to be set (more specific check)
    await waitFor(
        () => {
            const hoverOutline = document.querySelector(
                "[data-testid='visual-builder__hover-outline']"
            ) as HTMLElement;
            expect(hoverOutline).not.toBeNull();
            // Check if style has meaningful values (not empty)
            const hasStyle =
                hoverOutline?.style &&
                (hoverOutline.style.top ||
                    hoverOutline.style.left ||
                    hoverOutline.style.width ||
                    hoverOutline.style.height);
            expect(hasStyle).toBeTruthy();
        },
        {
            timeout: options?.timeout ?? 2000,
            interval: options?.interval ?? 5, // Faster polling: 5ms default
        }
    );
};

export const waitForBuilderSDKToBeInitialized = async (
    visualBuilderPostMessage: EventManager | undefined
) => {
    await waitFor(() => {
        expect(visualBuilderPostMessage?.send).toBeCalledWith(
            VisualBuilderPostMessageEvents.INIT,
            expect.any(Object)
        );
    });
};
interface WaitForClickActionOptions {
    skipWaitForFieldType?: boolean;
}
export const triggerAndWaitForClickAction = async (
    visualBuilderPostMessage: EventManager | undefined,
    element: HTMLElement,
    { skipWaitForFieldType }: WaitForClickActionOptions = {}
) => {
    await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);
    await act(async () => {
        await fireEvent.click(element);
    });
    if (!skipWaitForFieldType) {
        await waitFor(() => {
            expect(element).toHaveAttribute("data-cslp-field-type");
        });
    }
};
export const waitForToolbaxToBeVisible = async () => {
    await waitFor(() => {
        const toolbar = document.querySelector(
            ".visual-builder__focused-toolbar__field-label-container"
        );
        expect(toolbar).not.toBeNull();
    });
};

export const waitForCursorToBeVisible = async (options?: {
    timeout?: number;
    interval?: number;
}) => {
    await waitFor(
        () => {
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            if (!customCursor) throw new Error("Cursor not found");
            expect(customCursor.classList.contains("visible")).toBeTruthy();
        },
        {
            timeout: options?.timeout ?? 2000, // Default 2s timeout for cursor to be visible
            interval: options?.interval ?? 10, // Faster polling: 10ms default
        }
    );
};

export const waitForCursorIcon = async (
    icon: string,
    options?: { timeout?: number; interval?: number }
) => {
    await waitFor(
        () => {
            const customCursor = document.querySelector(
                `[data-testid="visual-builder__cursor"]`
            );
            if (!customCursor) throw new Error("Cursor not found");
            expect(customCursor).toHaveAttribute("data-icon", icon);
        },
        {
            timeout: options?.timeout ?? 1000, // Reduced from 2s to 1s - mocks resolve immediately
            interval: options?.interval ?? 10, // Faster polling: 10ms default
        }
    );
};
const defaultRect = {
    left: 10,
    right: 20,
    top: 10,
    bottom: 20,
    width: 10,
    height: 5,
};
export const mockGetBoundingClientRect = (
    element: HTMLElement,
    rect = defaultRect
) => {
    vi.spyOn(element, "getBoundingClientRect").mockImplementation(
        () => rect as DOMRect
    );
};
export const getElementBytestId = (testId: string) => {
    return document.querySelector(`[data-testid="${testId}"]`);
};
export const asyncRender: (
    componentChild: ComponentChild
) => ReturnType<typeof render> = async (...args) => {
    let returnValue: ReturnType<typeof render>;
    await act(async () => {
        returnValue = render(...args);
    });
    return returnValue;
};
