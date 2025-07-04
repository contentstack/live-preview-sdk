import { throttle as throttleActual } from "lodash-es";
import { MockedObject } from "vitest";
import {
    generatePseudoEditableElement as generatePseudoEditableElementActual,
    isEllipsisActive as isEllipsisActiveActual,
} from "../../generators/generatePseudoEditableField";
import { VisualBuilder } from "../../index";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../constants";
import { enableInlineEditing } from "../enableInlineEditing";
import { getMultilinePlaintext as getMultilinePlaintextActual } from "../getMultilinePlaintext";
import { handleFieldInput, handleFieldKeyDown } from "../handleFieldMouseDown";
import { pasteAsPlainText } from "../pasteAsPlainText";
import { FieldDataType } from "../types/index.types";
import { updateFocussedState as updateFocussedStateActual } from "../updateFocussedState";

const isEllipsisActive = vi.mocked(isEllipsisActiveActual);
const generatePseudoEditableElement = vi.mocked(
    generatePseudoEditableElementActual
);
const getMultilinePlaintext = vi.mocked(getMultilinePlaintextActual);
const updateFocussedState = vi.mocked(updateFocussedStateActual);
const throttle = vi.mocked(throttleActual);

vi.mock("../../index", () => ({
    VisualBuilder: {
        VisualBuilderGlobalState: {
            value: {
                focusFieldValue: null,
            },
        },
    },
}));

// Mock utility functions that are imported in the original file
vi.mock("../getMultilinePlaintext", () => ({
    getMultilinePlaintext: vi.fn((element) => element.textContent || ""),
}));

vi.mock("../../generators/generatePseudoEditableField", () => ({
    generatePseudoEditableElement: vi.fn(() => {
        const pseudoElement = document.createElement("div");
        pseudoElement.setAttribute("data-testid", "pseudo-element");
        return pseudoElement;
    }),
    isEllipsisActive: vi.fn(() => false),
}));

vi.mock("../updateFocussedState", () => ({
    updateFocussedState: vi.fn(),
}));

vi.mock("lodash-es", () => ({
    throttle: vi.fn((fn) => fn),
    debounce: vi.fn((fn) => fn),
}));

vi.mock("../handleFieldInput", () => ({
    handleFieldInput: vi.fn(),
}));

vi.mock("../handleFieldKeyDown", () => ({
    handleFieldKeyDown: vi.fn(),
}));

vi.mock("../pasteAsPlainText", () => ({
    pasteAsPlainText: vi.fn(),
}));

describe("enableInlineEditing", () => {
    let editableElement: HTMLDivElement;
    let mockedEditableElement: MockedObject<HTMLDivElement>;
    let visualBuilderContainer: HTMLDivElement;
    let resizeObserver: ResizeObserver;

    beforeEach(() => {
        // Set up the DOM elements
        editableElement = document.createElement("div");
        // after this point the editableElement is mocked
        // but we have reference to both just for the types
        mockedEditableElement = vi.mocked(editableElement);

        editableElement.textContent = "Test content";
        editableElement.innerText = "Test content";

        mockedEditableElement.focus = vi.fn();
        mockedEditableElement.addEventListener = vi.fn();

        visualBuilderContainer = document.createElement("div");
        document.body.appendChild(visualBuilderContainer);

        // Mock ResizeObserver
        resizeObserver = {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        } as unknown as ResizeObserver;

        // clear mocks
        vi.clearAllMocks();

        // @ts-expect-error only mocking required properties
        vi.spyOn(window, "getComputedStyle").mockReturnValue({
            display: "block",
        });
    });

    afterEach(() => {
        VisualBuilder.VisualBuilderGlobalState.value.focusFieldValue = null;
        isEllipsisActive.mockReturnValue(false);
        document.body.removeChild(visualBuilderContainer);
    });

    it("should make element editable and set focus", () => {
        enableInlineEditing({
            expectedFieldData: "Test content",
            editableElement,
            fieldType: FieldDataType.SINGLELINE,
            elements: {
                visualBuilderContainer,
                resizeObserver,
                lastEditedField: null,
            },
        });

        expect(editableElement.getAttribute("contenteditable")).toBe("true");
        expect(editableElement.focus).toHaveBeenCalled();
    });

    it("should handle multiline fields correctly", () => {
        enableInlineEditing({
            expectedFieldData: "Test content",
            editableElement,
            fieldType: FieldDataType.MULTILINE,
            elements: {
                visualBuilderContainer,
                resizeObserver,
                lastEditedField: null,
            },
        });

        expect(getMultilinePlaintext).toHaveBeenCalledWith(editableElement);
        expect(editableElement.getAttribute("contenteditable")).toBe("true");

        // Check event listeners
        const eventListeners =
            mockedEditableElement.addEventListener.mock.calls;
        expect(
            eventListeners.some(
                (call) => call[0] === "paste" && call[1] === pasteAsPlainText
            )
        ).toBe(true);
    });

    it("should create pseudo element when text content differs from expected", () => {
        enableInlineEditing({
            expectedFieldData: "Different content",
            editableElement,
            fieldType: FieldDataType.SINGLELINE,
            elements: {
                visualBuilderContainer,
                resizeObserver,
                lastEditedField: null,
            },
        });

        expect(generatePseudoEditableElement).toHaveBeenCalled();
        expect(editableElement.style.visibility).toBe("hidden");
        expect(resizeObserver.observe).toHaveBeenCalled();
    });

    it("should create pseudo element when ellipsis is active", () => {
        isEllipsisActive.mockReturnValue(true);

        enableInlineEditing({
            expectedFieldData: "Test content",
            editableElement,
            fieldType: FieldDataType.SINGLELINE,
            elements: {
                visualBuilderContainer,
                resizeObserver,
                lastEditedField: null,
            },
        });

        expect(generatePseudoEditableElement).toHaveBeenCalled();
        expect(editableElement.style.visibility).toBe("hidden");
    });

    it("should set field type attribute on pseudo element", () => {
        enableInlineEditing({
            expectedFieldData: "Different content",
            editableElement,
            fieldType: FieldDataType.MULTILINE,
            elements: {
                visualBuilderContainer,
                resizeObserver,
                lastEditedField: null,
            },
        });

        const pseudoElement =
            generatePseudoEditableElement.mock.results[0].value;
        expect(
            pseudoElement.getAttribute(VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY)
        ).toBe(FieldDataType.MULTILINE);
    });

    it("should handle inline elements correctly", () => {
        // @ts-expect-error mocking only required properties
        vi.spyOn(window, "getComputedStyle").mockReturnValue({
            display: "inline",
        });

        enableInlineEditing({
            expectedFieldData: "Test content",
            editableElement,
            fieldType: FieldDataType.SINGLELINE,
            elements: {
                visualBuilderContainer,
                resizeObserver,
                lastEditedField: null,
            },
        });

        expect(throttle).toHaveBeenCalled();

        const onInlineElementInput =
            mockedEditableElement.addEventListener.mock.calls[0][1];

        expect(onInlineElementInput).toBeInstanceOf(Function);
        (onInlineElementInput as () => void)();

        expect(updateFocussedState).toHaveBeenCalled();
    });

    it("should add event listeners for input and keydown", () => {
        enableInlineEditing({
            expectedFieldData: "Test content",
            editableElement,
            fieldType: FieldDataType.SINGLELINE,
            elements: {
                visualBuilderContainer,
                resizeObserver,
                lastEditedField: null,
            },
        });

        const eventListeners =
            mockedEditableElement.addEventListener.mock.calls;
        expect(
            eventListeners.some(
                (call) => call[0] === "input" && call[1] === handleFieldInput
            )
        ).toBe(true);
        expect(
            eventListeners.some(
                (call) =>
                    call[0] === "keydown" && call[1] === handleFieldKeyDown
            )
        ).toBe(true);
    });

    it("should update global state with field value", () => {
        enableInlineEditing({
            expectedFieldData: "Test content",
            editableElement,
            fieldType: FieldDataType.SINGLELINE,
            elements: {
                visualBuilderContainer,
                resizeObserver,
                lastEditedField: null,
            },
        });

        expect(
            VisualBuilder.VisualBuilderGlobalState.value.focusFieldValue
        ).toBe("Test content");
    });
});
