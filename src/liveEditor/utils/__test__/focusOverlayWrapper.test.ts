import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/preact";
import {
    addFocusOverlay,
    hideFocusOverlay,
} from "./../../generators/generateOverlay";
import initUI from "../../components";
import { cleanIndividualFieldResidual } from "../handleIndividualFields";
import { LiveEditorPostMessageEvents } from "../types/postMessage.types";
import liveEditorPostMessage from "../liveEditorPostMessage";
import { VisualEditor } from "../..";

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

const mockResizeObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
};

describe("addFocusOverlay", () => {
    let visualEditorContainer: HTMLDivElement;
    let targetElement: HTMLElement;
    let focusOverlayWrapper: HTMLDivElement;

    jest.mock("../../generators/generateOverlay", () => {
        const originalModule = jest.requireActual(
            "../../generators/generateOverlay"
        );
        return {
            ...originalModule,
            hideOverlay: jest.fn(),
        };
    });

    beforeEach(() => {
        initUI({
            resizeObserver: mockResizeObserver,
        });
        visualEditorContainer = document.querySelector(
            ".visual-builder__container"
        ) as HTMLDivElement;

        focusOverlayWrapper = document.querySelector(
            ".visual-builder__overlay__wrapper"
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

    test("should set the top overlay to the correct dimensions", () => {
        expect(focusOverlayWrapper).toMatchSnapshot();

        addFocusOverlay(targetElement, focusOverlayWrapper);

        focusOverlayWrapper = document.querySelector(
            ".visual-builder__overlay__wrapper"
        ) as HTMLDivElement;

        expect(focusOverlayWrapper).toMatchSnapshot();
        expect(focusOverlayWrapper?.classList.contains("visible")).toBe(true);

        const visualEditorWrapperTopOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--top"]`
        ) as HTMLDivElement;
        const visualEditorWrapperLeftOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--left"]`
        ) as HTMLDivElement;
        const visualEditorWrapperRightOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--right"]`
        ) as HTMLDivElement;
        const visualEditorWrapperBottomOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--bottom"]`
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
            ".visual-builder__container"
        ) as HTMLDivElement;

        focusOverlayWrapper = document.querySelector(
            ".visual-builder__overlay__wrapper"
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

        document.body.appendChild(editedElement);

        singleFocusOverlay = focusOverlayWrapper.querySelector(
            `[data-testid="visual-builder__overlay--top"]`
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

    test("should send update field event to the parent if the focused element is an inline editable element", async () => {
        editedElement.setAttribute("contenteditable", "true");

        // We"ll always click one of the overlays, so we can just grab the first one. Manually pointing the global state to the editedElement as we are not simulating mouse click on window here.
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
            editedElement;

        // already called addFocusOverlay, hence visible is set to true
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);

        await fireEvent.change(editedElement, {
            target: { innerHTML: "New text" },
        });

        expect(editedElement.textContent).toBe("New text");

        // close the overlay
        await fireEvent.click(focusOverlayWrapper);
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(false);

        expect(liveEditorPostMessage?.send).toHaveBeenCalledTimes(1);
        expect(liveEditorPostMessage?.send).toHaveBeenCalledWith(
            LiveEditorPostMessageEvents.UPDATE_FIELD,
            {
                data: editedElement.textContent,
                fieldMetadata: {
                    content_type_uid: "all_fields",
                    cslpValue: "all_fields.blt58a50b4cebae75c5.en-us.title",
                    entry_uid: "blt58a50b4cebae75c5",
                    fieldPath: "title",
                    fieldPathWithIndex: "title",
                    locale: "en-us",
                    multipleFieldMetadata: { index: -1, parentDetails: null },
                    instance: { fieldPathWithIndex: "title" },
                },
            }
        );
    });

    test("should run cleanup function", () => {
        // We"ll always click one of the overlays, so we can just grab the first one. Manually pointing the global state to the editedElement as we are not simulating mouse click on window here.
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
            editedElement;
        fireEvent.click(focusOverlayWrapper);

        expect(cleanIndividualFieldResidual).toHaveBeenCalledTimes(1);
    });

    // TODO
    test("should hide the overlay if the escape key is pressed", () => {
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);

        const escapeEvent = new KeyboardEvent("keydown", {
            key: "Escape",
        });
        window.dispatchEvent(escapeEvent);

        expect(focusOverlayWrapper.classList.contains("visible")).toBe(false);
    });
});
