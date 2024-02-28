import { fireEvent } from "@testing-library/preact";

import {
    addFocusOverlay,
    hideFocusOverlay,
} from "./../../generators/generateOverlay";
// import { generateVisualEditorOverlay } from "../generateVisualEditorDom";
import { cleanIndividualFieldResidual } from "../handleIndividualFields";
import liveEditorPostMessage from "../liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../types/postMessage.types";
import initUI from "../../components";

jest.mock("../liveEditorPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: jest.fn(),
            on: jest.fn(),
        },
    };
});

jest.mock("../handleIndividualFields", () => {
    return {
        __esModule: true,
        cleanIndividualFieldResidual: jest.fn(),
    };
});

jest.mock('../../globals', () => ({
    value: {
        previousSelectedEditableDOM: null,
        previousHoveredTargetDOM: null
    },
}));

const mockResizeObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
};

describe("addFocusOverlay", () => {
    let visualEditorContainer: HTMLDivElement;
    let targetElement: HTMLElement;
    let focusOverlayWrapper: HTMLDivElement;
    const mockOnClickCallback = jest.fn();

    beforeEach(() => {
        initUI({
            resizeObserver: mockResizeObserver,
        });
        visualEditorContainer = document.querySelector(
            ".visual-editor__container"
        ) as HTMLDivElement;

        focusOverlayWrapper = document.querySelector(
            ".visual-editor__overlay__wrapper"
        ) as HTMLDivElement;

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

        visualEditorContainer.appendChild(targetElement);
    });

    afterEach(() => {
        // Remove the target element and focus overlay wrapper after each test
        document.body.innerHTML = "";
        jest.clearAllMocks();
    });

    test("should set the focus overlay wrapper to visible", () => {
        addFocusOverlay(targetElement, focusOverlayWrapper);
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);
    });

    // disabling .toMatchSnapshot() method
    test("should set the top overlay to the correct dimensions", () => {
        let visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );

        // expect(visualEditorOverlayWrapper).toMatchSnapshot();

        addFocusOverlay(targetElement, focusOverlayWrapper);

        visualEditorOverlayWrapper = document.querySelector(
            `[data-testid="visual-editor__overlay__wrapper"]`
        );

        // expect(visualEditorOverlayWrapper).toMatchSnapshot();
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
        expect(visualEditorWrapperTopOverlay.style.height).toBe(
            "calc(10px - 2px)"
        );

        expect(visualEditorWrapperBottomOverlay.style.top).toBe(
            "calc(20px + 2px)"
        );
        expect(visualEditorWrapperBottomOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperBottomOverlay.style.width).toBe("100%");
        expect(visualEditorWrapperBottomOverlay.style.height).toBe(
            "calc(-20px - 2px)"
        );

        expect(visualEditorWrapperLeftOverlay.style.top).toBe(
            "calc(10px - 2px)"
        );
        expect(visualEditorWrapperLeftOverlay.style.left).toBe("0px");
        expect(visualEditorWrapperLeftOverlay.style.width).toBe(
            "calc(10px - 2px)"
        );

        expect(visualEditorWrapperRightOverlay.style.top).toBe(
            "calc(10px - 2px)"
        );
        expect(visualEditorWrapperRightOverlay.style.left).toBe(
            "calc(20px + 2px)"
        );
        expect(visualEditorWrapperRightOverlay.style.width).toBe(
            "calc(1004px - 2px)"
        );
    });


    // test("should run onClickCallback when the focus overlay is clicked", () => {
    //     addFocusOverlay(targetElement, focusOverlayWrapper);
    //     const visualEditorOverlay = document.querySelector(
    //         `[data-testid="visual-editor__overlay"]`
    //     ) as HTMLDivElement;

    //     // visualEditorOverlay?.dispatchEvent(
    //     //     new MouseEvent("click", {
    //     //         bubbles: true,
    //     //         cancelable: true,
    //     //     })
    //     // );

    //     fireEvent.click(visualEditorOverlay);

    //     expect(hideOverlay).toHaveBeenCalledTimes(1);
    // });
});

describe("hideFocusOverlay", () => {
    let visualEditorContainer: HTMLDivElement;
    let editedElement: HTMLParagraphElement;
    let focusOverlayWrapper: HTMLDivElement;
    let singleFocusOverlay: HTMLDivElement;

    beforeEach(() => {

        initUI({
            resizeObserver: mockResizeObserver,
        });
        visualEditorContainer = document.querySelector(
            ".visual-editor__container"
        ) as HTMLDivElement;

        focusOverlayWrapper = document.querySelector(
            ".visual-editor__overlay__wrapper"
        ) as HTMLDivElement;

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

        visualEditorContainer.appendChild(editedElement);

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
            visualEditorContainer,
            visualEditorOverlayWrapper: null,
            focusedToolbar: null,
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
        initUI({
            resizeObserver: mockResizeObserver,
        });
        visualEditorContainer = document.querySelector(
            ".visual-editor__container"
        ) as HTMLDivElement;

        focusOverlayWrapper = document.querySelector(
            ".visual-editor__overlay__wrapper"
        ) as HTMLDivElement;

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

        visualEditorContainer.appendChild(editedElement);
        
        addFocusOverlay(editedElement, focusOverlayWrapper);
        
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);
        
        // We'll always click one of the overlays, so we can just grab the first one
        singleFocusOverlay = focusOverlayWrapper.querySelector(
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
