import { VisualEditorCslpEventDetails } from "../../../types/liveEditor.types";
import { generateAddInstanceButton } from "../instanceButtons";
import {
    getChildrenDirection,
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "../multipleElementAddButton";
import { getCsDataOfElement } from "../getCsDataOfElement";
import { generateFieldSchemaMap } from "../generateFieldSchemaMap";

describe("generateAddInstanceButton", () => {
    test("should generate a button", () => {
        const button = generateAddInstanceButton(() => {});
        expect(button.tagName).toBe("BUTTON");
    });

    test("should run the callback when the button is clicked", () => {
        const mockCallback = jest.fn();
        const button = generateAddInstanceButton(mockCallback);
        button.click();
        expect(mockCallback).toHaveBeenCalled();
    });
});

// TODO: rewrite this
describe("getChildrenDirection", () => {
    let firstChild: HTMLElement;
    let secondChild: HTMLElement;
    let container: HTMLElement;

    beforeEach(() => {
        firstChild = document.createElement("div");
        firstChild.setAttribute(
            "data-cslp",
            "all_fields.bltapikey.en-us.group.0"
        );

        secondChild = document.createElement("div");
        secondChild.setAttribute(
            "data-cslp",
            "all_fields.bltapikey.en-us.group.1"
        );

        container = document.createElement("div");
        container.setAttribute("data-cslp", "all_fields.bltapikey.en-us.group");
        container.appendChild(firstChild);
        container.appendChild(secondChild);

        document.body.appendChild(container);
    });

    afterEach(() => {
        document.getElementsByTagName("body")[0].innerHTML = "";
        jest.resetAllMocks();
    });

    test(`should return "none" if it is not a list type`, () => {
        container.innerHTML = "";

        const direction = getChildrenDirection(
            firstChild,
            "all_fields.bltapikey.en-us.group"
        );
        expect(direction).toBe("none");
    });

    test(`should return "none" if the parent container is not found`, () => {
        container.removeAttribute("data-cslp");
        expect(
            getChildrenDirection(firstChild, "all_fields.bltapikey.en-us.group")
        ).toBe("none");
    });

    test("should return 'vertical' if the parent container is found and the children are in a vertical list", () => {
        expect(
            getChildrenDirection(firstChild, "all_fields.bltapikey.en-us.group")
        ).toBe("vertical");
    });

    test("should return 'horizontal' if the parent container is found and the children are in a horizontal list", () => {
        firstChild.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 10,
            top: 10,
        });

        secondChild.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 20,
            top: 10,
        });

        expect(
            getChildrenDirection(firstChild, "all_fields.bltapikey.en-us.group")
        ).toBe("horizontal");
    });

    test("should create a clone and determine direction when one child is present", () => {
        container.removeChild(secondChild);

        firstChild.getBoundingClientRect = jest.fn().mockReturnValue({
            left: -10,
            top: 10,
        });

        expect(
            getChildrenDirection(firstChild, "all_fields.bltapikey.en-us.group")
        ).toBe("vertical");
    });

    test("should return 'none' if input is not provided", () => {
        // @ts-ignore
        expect(getChildrenDirection()).toBe("none");
    });

    test(`should return "none" if container does not contain the elements`, () => {
        container.innerHTML = "";
        document.body.appendChild(firstChild);
        document.body.appendChild(secondChild);

        expect(
            getChildrenDirection(firstChild, "all_fields.bltapikey.en-us.group")
        ).toBe("none");
    });
});

describe("handleAddButtonsForMultiple", () => {
    let firstChild: HTMLElement;
    let secondChild: HTMLElement;
    let container: HTMLElement;
    let visualEditorWrapper: HTMLDivElement;
    let eventDetails: VisualEditorCslpEventDetails;

    beforeEach(() => {
        firstChild = document.createElement("div");
        firstChild.setAttribute(
            "data-cslp",
            "all_fields.bltapikey.en-us.group.0"
        );

        secondChild = document.createElement("div");
        secondChild.setAttribute(
            "data-cslp",
            "all_fields.bltapikey.en-us.group.1"
        );

        firstChild.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 10,
            right: 20,
            top: 10,
            bottom: 20,
        });

        secondChild.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 20,
            right: 30,
            top: 10,
            bottom: 20,
        });

        visualEditorWrapper = document.createElement("div");

        container = document.createElement("div");
        container.setAttribute("data-cslp", "all_fields.bltapikey.en-us.group");
        container.appendChild(firstChild);
        container.appendChild(secondChild);

        document.body.appendChild(container);
        document.body.appendChild(visualEditorWrapper);

        const mouseEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });
        firstChild.dispatchEvent(mouseEvent);

        const fieldMap = generateFieldSchemaMap("all_fields");

        eventDetails = getCsDataOfElement(mouseEvent, {
            all_fields: fieldMap,
        }) as VisualEditorCslpEventDetails;
    });

    afterEach(() => {
        document.getElementsByTagName("body")[0].innerHTML = "";
        jest.resetAllMocks();
    });

    test("should not add buttons if the editable element is not found", () => {
        handleAddButtonsForMultiple(eventDetails, {
            editableElement: null,
            visualEditorWrapper: visualEditorWrapper,
        });

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(0);
    });

    test("should not add buttons if the direction is none", () => {
        container.removeAttribute("data-cslp");
        handleAddButtonsForMultiple(eventDetails, {
            editableElement: firstChild,
            visualEditorWrapper,
        });

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(0);
    });

    test("should not add buttons if the visual editor wrapper is not found", () => {
        handleAddButtonsForMultiple(eventDetails, {
            editableElement: firstChild,
            visualEditorWrapper: null,
        });

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(0);
    });

    test("should append the buttons to the visual editor wrapper", () => {
        handleAddButtonsForMultiple(eventDetails, {
            editableElement: firstChild,
            visualEditorWrapper,
        });

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should add the buttons to the center if the direction is horizontal", () => {
        handleAddButtonsForMultiple(eventDetails, {
            editableElement: firstChild,
            visualEditorWrapper,
        });

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        const previousButton = addInstanceButtons[0] as HTMLButtonElement;
        const nextButton = addInstanceButtons[1] as HTMLButtonElement;

        expect(previousButton.style.left).toBe("10px");
        expect(previousButton.style.top).toBe("15px");

        expect(nextButton.style.left).toBe("20px");
        expect(nextButton.style.top).toBe("15px");
    });

    test("should add the buttons to the middle if the direction is vertical", () => {
        firstChild.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 10,
            right: 20,
            top: 10,
            bottom: 20,
        });

        secondChild.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 10,
            right: 20,
            top: 20,
            bottom: 30,
        });
        handleAddButtonsForMultiple(eventDetails, {
            editableElement: firstChild,
            visualEditorWrapper,
        });

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        const previousButton = addInstanceButtons[0] as HTMLButtonElement;
        const nextButton = addInstanceButtons[1] as HTMLButtonElement;

        expect(previousButton.style.left).toBe("15px");
        expect(previousButton.style.top).toBe("10px");

        expect(nextButton.style.left).toBe("15px");
        expect(nextButton.style.top).toBe("20px");
    });
});

describe("removeAddInstanceButtons", () => {
    let visualEditorWrapper: HTMLDivElement;
    let previousButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;
    let overlayWrapper: HTMLDivElement;
    let eventTarget: EventTarget;

    beforeEach(() => {
        visualEditorWrapper = document.createElement("div");
        previousButton = generateAddInstanceButton(() => {});
        nextButton = generateAddInstanceButton(() => {});
        overlayWrapper = document.createElement("div");
        eventTarget = document.createElement("div");

        visualEditorWrapper.appendChild(previousButton);
        visualEditorWrapper.appendChild(nextButton);

        document.body.appendChild(visualEditorWrapper);
        document.body.appendChild(overlayWrapper);
    });

    afterEach(() => {
        document.getElementsByTagName("body")[0].innerHTML = "";
        jest.resetAllMocks();
    });

    test("should not remove buttons if wrapper or buttons are not present", () => {
        removeAddInstanceButtons({
            visualEditorWrapper: null,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should not remove buttons if previous button contains event target", () => {
        removeAddInstanceButtons({
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: previousButton,
            overlayWrapper: overlayWrapper,
        });

        let addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);

        removeAddInstanceButtons({
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: nextButton,
            overlayWrapper: overlayWrapper,
        });

        addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });
    test("should not remove buttons if next button contains event target", () => {
        overlayWrapper.classList.add("visible");

        removeAddInstanceButtons({
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should remove the buttons", () => {
        removeAddInstanceButtons({
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeFalsy();
        expect(visualEditorWrapper.contains(nextButton)).toBeFalsy();
    });

    test("should remove all buttons if forceRemoveAll is true", () => {
        for (let i = 0; i < 5; i++) {
            const button = generateAddInstanceButton(() => {});
            visualEditorWrapper.appendChild(button);
        }

        let buttons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(buttons.length).toBe(7);

        removeAddInstanceButtons(
            {
                visualEditorWrapper: visualEditorWrapper,
                eventTarget: eventTarget,
                overlayWrapper: overlayWrapper,
            },
            true
        );

        buttons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(buttons.length).toBe(0);
    });

    test("should not remove all buttons if forceRemoveAll is false", () => {
        for (let i = 0; i < 5; i++) {
            const button = generateAddInstanceButton(() => {});
            visualEditorWrapper.appendChild(button);
        }

        let buttons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(buttons.length).toBe(7);

        removeAddInstanceButtons(
            {
                visualEditorWrapper: visualEditorWrapper,
                eventTarget: eventTarget,
                overlayWrapper: overlayWrapper,
            },
            false
        );

        buttons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        const addInstanceButtons = visualEditorWrapper.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(5);
    });
});
