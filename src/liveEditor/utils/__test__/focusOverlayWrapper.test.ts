import { addFocusOverlay, hideFocusOverlay } from "../focusOverlayWrapper";
import { generateVisualEditorOverlay } from "../generateVisualEditorDom";
import { cleanIndividualFieldResidual } from "../handleIndividualFields";
import liveEditorPostMessage from "../liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../types/postMessage.types";

jest.mock("../liveEditorPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: jest.fn(),
        },
    };
});

jest.mock("../handleIndividualFields", () => {
    return {
        __esModule: true,
        cleanIndividualFieldResidual: jest.fn(),
    };
});

describe("addFocusOverlay", () => {
    let targetElement: Element;
    let focusOverlayWrapper: HTMLDivElement;
    const mockOnClickCallback = jest.fn();

    beforeEach(() => {
        // Create a target element and focus overlay wrapper for each test
        targetElement = document.createElement("p");
        targetElement.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.title"
        );
        targetElement.getBoundingClientRect = jest.fn(() => ({
            left: 10,
            right: 20,
            top: 10,
            bottom: 20,
        })) as any;

        document.body.appendChild(targetElement);

        focusOverlayWrapper = generateVisualEditorOverlay(mockOnClickCallback);

        document.body.appendChild(focusOverlayWrapper);
    });

    afterEach(() => {
        // Remove the target element and focus overlay wrapper after each test
        document.body.innerHTML = "";
        if (focusOverlayWrapper) {
            focusOverlayWrapper.remove();
        }
        jest.clearAllMocks();
    });

    test("should set the focus overlay wrapper to visible", () => {
        addFocusOverlay(targetElement, focusOverlayWrapper);
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);
    });

    test("should set the top overlay to the correct dimensions", () => {
        let visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );

        expect(visualEditorOverlayWrapper).toMatchSnapshot();

        addFocusOverlay(targetElement, focusOverlayWrapper);

        visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );

        expect(visualEditorOverlayWrapper).toMatchSnapshot();
        expect(visualEditorOverlayWrapper?.classList.contains("visible")).toBe(
            true
        );

        const visualEditorWrapperTopOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--top"]`
        ) as HTMLDivElement;
        const visualEditorWrapperLeftOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--left"]`
        ) as HTMLDivElement;
        const visualEditorWrapperRightOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--right"]`
        ) as HTMLDivElement;
        const visualEditorWrapperBottomOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--bottom"]`
        ) as HTMLDivElement;

        expect(visualEditorWrapperTopOverlay.style.top).toBe("0px");
        expect(visualEditorWrapperTopOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperTopOverlay.style.width).toBe("100%");
        expect(visualEditorWrapperTopOverlay.style.height).toBe("10px");

        expect(visualEditorWrapperBottomOverlay.style.top).toBe("20px");
        expect(visualEditorWrapperBottomOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperBottomOverlay.style.width).toBe("100%");
        expect(visualEditorWrapperBottomOverlay.style.height).toBe("-20px");

        expect(visualEditorWrapperLeftOverlay.style.top).toBe("10px");
        expect(visualEditorWrapperLeftOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperLeftOverlay.style.width).toBe("10px");

        expect(visualEditorWrapperRightOverlay.style.top).toBe("10px");
        expect(visualEditorWrapperRightOverlay.style.left).toBe("20px");
        expect(visualEditorWrapperRightOverlay.style.width).toBe("1004px");
    });

    test("should run onClickCallback when the focus overlay is clicked", () => {
        addFocusOverlay(targetElement, focusOverlayWrapper);
        const visualEditorOverlay = document.querySelector(
            `[data-testid="visual-editor__overlay--top"]`
        ) as HTMLDivElement;

        visualEditorOverlay?.dispatchEvent(
            new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            })
        );

        expect(mockOnClickCallback).toHaveBeenCalledTimes(1);
    });
});

describe("hideFocusOverlay", () => {
    let editedElement: HTMLParagraphElement;
    let focusOverlayWrapper: HTMLDivElement;
    let singleFocusOverlay: HTMLDivElement;
    const visualEditorWrapper = document.createElement("div");

    beforeEach(() => {
        editedElement = document.createElement("p");
        editedElement.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.title"
        );
        editedElement.innerHTML = "Hello World!";
        editedElement.getBoundingClientRect = jest.fn(() => ({
            left: 10,
            right: 20,
            top: 10,
            bottom: 20,
        })) as any;

        focusOverlayWrapper = generateVisualEditorOverlay(
            (visualEditorOverlayWrapper) => {
                hideFocusOverlay({
                    previousSelectedEditableDOM: editedElement,
                    visualEditorWrapper,
                    visualEditorOverlayWrapper,
                });
            }
        );
        document.body.appendChild(visualEditorWrapper);
        document.body.appendChild(editedElement);
        document.body.appendChild(focusOverlayWrapper);

        singleFocusOverlay = focusOverlayWrapper.querySelector(
            `[data-testid="visual-editor__overlay--top"]`
        ) as HTMLDivElement;

        addFocusOverlay(editedElement, focusOverlayWrapper);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        jest.clearAllMocks();
    });

    test("should not hide the overlay if the focus overlay wrapper is null", () => {
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);

        hideFocusOverlay({
            previousSelectedEditableDOM: editedElement,
            visualEditorWrapper,
            visualEditorOverlayWrapper: null,
        });

        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);
    });

    test("should hide the overlay if the focus overlay is clicked", () => {
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);
        singleFocusOverlay.click();
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(false);
    });

    test("should not hide the overlay if any other element is clicked", () => {
        const singleLineElement = document.createElement("p");
        singleLineElement.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.single_line"
        );

        document.body.appendChild(singleLineElement);

        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);
        singleLineElement.click();
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);
    });

    test("should send update field event to the parent if the focused element is an inline editable element", () => {
        editedElement.setAttribute("contenteditable", "true");

        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);
        singleFocusOverlay.click();

        expect(focusOverlayWrapper.classList.contains("visible")).toBe(false);
        expect(liveEditorPostMessage?.send).toHaveBeenCalledTimes(1);
        expect(liveEditorPostMessage?.send).toHaveBeenCalledWith(
            LiveEditorPostMessageEvents.UPDATE_FIELD,
            {
                data: editedElement.innerHTML,
                fieldMetadata: {
                    content_type_uid: "all_fields",
                    cslpValue: "all_fields.blt58a50b4cebae75c5.en-us.title",
                    entry_uid: "blt58a50b4cebae75c5",
                    fieldPath: "title",
                    fieldPathWithIndex: "title",
                    locale: "en-us",
                    multipleFieldMetadata: { index: -1, parentDetails: null },
                },
            }
        );
    });

    test("should run cleanup function", () => {
        const editedElement = document.createElement("p");
        editedElement.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.title"
        );

        editedElement.getBoundingClientRect = jest.fn(() => ({
            left: 10,
            right: 20,
            top: 10,
            bottom: 20,
        })) as any;

        const focusOverlayWrapper = generateVisualEditorOverlay(
            (visualEditorOverlayWrapper = null) => {
                hideFocusOverlay({
                    previousSelectedEditableDOM: editedElement,
                    visualEditorWrapper,
                    visualEditorOverlayWrapper,
                });
            }
        );
        document.body.appendChild(visualEditorWrapper);
        document.body.appendChild(editedElement);
        document.body.appendChild(focusOverlayWrapper);

        addFocusOverlay(editedElement, focusOverlayWrapper);

        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);

        // We'll always click one of the overlays, so we can just grab the first one
        const singleFocusOverlay = focusOverlayWrapper.querySelector(
            `[data-testid="visual-editor__overlay--top"]`
        ) as HTMLDivElement;
        singleFocusOverlay.click();

        expect(cleanIndividualFieldResidual).toHaveBeenCalledTimes(1);
    });

    test("should hide the overlay if the escape key is pressed", () => {
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);

        const escapeEvent = new KeyboardEvent("keydown", {
            key: "Escape",
        });
        window.dispatchEvent(escapeEvent);

        expect(focusOverlayWrapper.classList.contains("visible")).toBe(false);
    });
});
