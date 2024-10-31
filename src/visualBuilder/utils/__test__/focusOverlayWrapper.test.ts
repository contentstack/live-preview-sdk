import { fireEvent, waitFor } from "@testing-library/preact";
import {
    addFocusOverlay,
    hideFocusOverlay,
} from "./../../generators/generateOverlay";
import initUI from "../../components";
import { cleanIndividualFieldResidual } from "../handleIndividualFields";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import visualBuilderPostMessage from "../visualBuilderPostMessage";
import { FieldSchemaMap } from "../fieldSchemaMap";
import { mockMultipleLinkFieldSchema } from "../../../__test__/data/fields";
// if this file is imported before, tests might fail
// this is probably because of cyclic dependencies
import { VisualBuilder } from "../..";

vi.mock("../visualBuilderPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: vi.fn(),
            on: vi.fn(),
        },
    };
});

vi.mock("../handleIndividualFields", () => {
    return {
        __esModule: true,
        cleanIndividualFieldResidual: vi.fn(),
    };
});

const mockResizeObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
};

describe("addFocusOverlay", () => {
    let visualBuilderContainer: HTMLDivElement;
    let targetElement: HTMLElement;
    let focusOverlayWrapper: HTMLDivElement;

    vi.mock("../../generators/generateOverlay", async () => {
        const originalModule = await vi.importActual<
            typeof import("../../generators/generateOverlay")
        >("../../generators/generateOverlay");
        return {
            ...originalModule,
            hideOverlay: vi.fn(),
        };
    });

    vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(
        100
    );
    vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(
        100
    );
    vi.spyOn(window.document.body, "scrollHeight", "get").mockReturnValue(100);

    beforeEach(() => {
        initUI({
            resizeObserver: mockResizeObserver,
        });
        visualBuilderContainer = document.querySelector(
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
        targetElement.getBoundingClientRect = vi.fn(() => ({
            left: 10,
            right: 20,
            top: 10,
            bottom: 20,
        })) as any;

        visualBuilderContainer.appendChild(targetElement);
    });

    afterEach(() => {
        // Remove the target element and focus overlay wrapper after each test
        document.body.innerHTML = "";
        vi.clearAllMocks();
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

        const visualBuilderWrapperTopOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--top"]`
        ) as HTMLDivElement;
        const visualBuilderWrapperLeftOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--left"]`
        ) as HTMLDivElement;
        const visualBuilderWrapperRightOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--right"]`
        ) as HTMLDivElement;
        const visualBuilderWrapperBottomOverlay = document.querySelector(
            `[data-testid="visual-builder__overlay--bottom"]`
        ) as HTMLDivElement;

        expect(visualBuilderWrapperTopOverlay.style.top).toBe("0px");
        expect(visualBuilderWrapperTopOverlay.style.left).toBe("0px");
        expect(visualBuilderWrapperTopOverlay.style.width).toBe("100%");
        expect(visualBuilderWrapperTopOverlay.style.height).toBe("calc(10px)");

        expect(visualBuilderWrapperBottomOverlay.style.top).toBe("20px");
        expect(visualBuilderWrapperBottomOverlay.style.left).toBe("0px");
        expect(visualBuilderWrapperBottomOverlay.style.width).toBe("100%");
        expect(visualBuilderWrapperBottomOverlay.style.height).toBe("80px");

        expect(visualBuilderWrapperLeftOverlay.style.top).toBe("10px");
        expect(visualBuilderWrapperLeftOverlay.style.left).toBe("0px");
        expect(visualBuilderWrapperLeftOverlay.style.width).toBe("10px");

        expect(visualBuilderWrapperRightOverlay.style.top).toBe("10px");
        expect(visualBuilderWrapperRightOverlay.style.left).toBe("20px");
        expect(visualBuilderWrapperRightOverlay.style.width).toBe("80px");
    });
});

describe("hideFocusOverlay", () => {
    let visualBuilderContainer: HTMLDivElement;
    let editedElement: HTMLParagraphElement;
    let focusOverlayWrapper: HTMLDivElement;
    let singleFocusOverlay: HTMLDivElement;

    vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue(
        mockMultipleLinkFieldSchema
    );
    beforeEach(() => {
        initUI({
            resizeObserver: mockResizeObserver,
        });
        visualBuilderContainer = document.querySelector(
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
        editedElement.getBoundingClientRect = vi.fn(() => ({
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
        vi.clearAllMocks();
    });

    test("should not hide the overlay if the focus overlay wrapper is null", () => {
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);

        hideFocusOverlay({
            visualBuilderContainer,
            visualBuilderOverlayWrapper: null,
            focusedToolbar: null,
            resizeObserver: mockResizeObserver,
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
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            editedElement;

        // already called addFocusOverlay, hence visible is set to true
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(true);

        fireEvent.change(editedElement, {
            target: { innerHTML: "New text" },
        });

        expect(editedElement.textContent).toBe("New text");

        // close the overlay
        fireEvent.click(focusOverlayWrapper);
        expect(focusOverlayWrapper.classList.contains("visible")).toBe(false);

        await waitFor(() => {
            expect(visualBuilderPostMessage?.send).toHaveBeenCalled();
        });
        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.UPDATE_FIELD,
            {
                data: editedElement.textContent,
                fieldMetadata: {
                    content_type_uid: "all_fields",
                    cslpValue: "all_fields.blt58a50b4cebae75c5.en-us.title",
                    entry_uid: "blt58a50b4cebae75c5",
                    fieldPath: "title",
                    fieldPathWithIndex: "title",
                    locale: "en-us",
                    multipleFieldMetadata: {
                        index: -1,
                        parentDetails: null,
                    },
                    instance: { fieldPathWithIndex: "title" },
                },
            }
        );
    });

    test("should run cleanup function", () => {
        // We"ll always click one of the overlays, so we can just grab the first one. Manually pointing the global state to the editedElement as we are not simulating mouse click on window here.
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
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

        waitFor(() => {
            expect(focusOverlayWrapper.classList.contains("visible")).toBe(
                false
            );
        });
    });
});
