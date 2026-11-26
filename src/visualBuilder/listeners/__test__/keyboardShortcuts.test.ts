import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { addKeyboardShortcuts } from "../keyboardShortcuts";
import { VisualBuilder } from "../..";
import { hideOverlay } from "../../generators/generateOverlay";
import { sendMouseClickPostMessage } from "../../utils/sendMouseClickPostMessage";

// Clears the focused field like the real hideOverlay, so the test pins reading it first.
vi.mock("../../generators/generateOverlay", () => ({
    hideOverlay: vi.fn(() => {
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            null;
    }),
}));

vi.mock("../../utils/sendMouseClickPostMessage", () => ({
    sendMouseClickPostMessage: vi.fn(),
}));

vi.mock("../..", () => ({
    VisualBuilder: {
        VisualBuilderGlobalState: {
            value: { previousSelectedEditableDOM: null as Element | null },
        },
    },
}));

const pressKey = (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
        ...init,
    });
    return document.body.dispatchEvent(event);
};

const focusField = () => {
    VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
        document.createElement("h1");
};

describe("addKeyboardShortcuts", () => {
    beforeAll(() => {
        addKeyboardShortcuts({
            overlayWrapper: document.createElement("div"),
            visualBuilderContainer: document.createElement("div"),
            focusedToolbar: null,
            resizeObserver: {} as ResizeObserver,
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            null;
    });

    it("reports a deselect after hiding the overlay when Escape leaves a focused field", () => {
        focusField();

        pressKey("Escape");

        expect(hideOverlay).toHaveBeenCalledTimes(1);
        expect(sendMouseClickPostMessage).toHaveBeenCalledTimes(1);
        expect(sendMouseClickPostMessage).toHaveBeenCalledWith();
        expect(vi.mocked(hideOverlay).mock.invocationCallOrder[0]).toBeLessThan(
            vi.mocked(sendMouseClickPostMessage).mock.invocationCallOrder[0]
        );
    });

    it("sends nothing when Escape is pressed with no field focused", () => {
        pressKey("Escape");

        expect(hideOverlay).toHaveBeenCalledTimes(1);
        expect(sendMouseClickPostMessage).not.toHaveBeenCalled();
    });

    it("still leaves a focused field when another handler prevented the Escape default", () => {
        focusField();
        document.body.addEventListener("keydown", (e) => e.preventDefault(), {
            once: true,
        });

        pressKey("Escape");

        expect(hideOverlay).toHaveBeenCalledTimes(1);
        expect(sendMouseClickPostMessage).toHaveBeenCalledWith();
    });

    it.each([{ isComposing: true }, { keyCode: 229 }])(
        "leaves the field alone when Escape ends an IME composition (%o)",
        (init) => {
            focusField();

            pressKey("Escape", init as KeyboardEventInit);

            expect(hideOverlay).not.toHaveBeenCalled();
            expect(sendMouseClickPostMessage).not.toHaveBeenCalled();
        }
    );

    it("ignores other keys", () => {
        focusField();

        pressKey("Enter");

        expect(hideOverlay).not.toHaveBeenCalled();
        expect(sendMouseClickPostMessage).not.toHaveBeenCalled();
    });
});
