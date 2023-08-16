import {
    generateAddButton,
    getChildrenDirection,
    handleAddButtonsForMultiple,
    hideAddInstanceButtons,
} from "../multipleElementAddButton";

describe("generateAddButton", () => {
    test("should generate a button", () => {
        const button = generateAddButton();
        expect(button.tagName).toBe("BUTTON");
    });
});

describe("getChildrenDirection", () => {
    let firstChild: HTMLElement;
    let secondChild: HTMLElement;
    let container: HTMLElement;

    beforeEach(() => {
        firstChild = document.createElement("div");
        firstChild.setAttribute(
            "data-cslp",
            "page.bltapikey.en-us.page_components.0.hero_banner"
        );
        firstChild.setAttribute(
            "data-cslp-container",
            "page.bltapikey.en-us.page_components"
        );

        secondChild = document.createElement("div");
        secondChild.setAttribute(
            "data-cslp",
            "page.bltapikey.en-us.page_components.1.section"
        );
        secondChild.setAttribute(
            "data-cslp-container",
            "page.bltapikey.en-us.page_components"
        );

        container = document.createElement("div");
        container.setAttribute(
            "data-cslp",
            "page.bltapikey.en-us.page_components"
        );
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

        const direction = getChildrenDirection(firstChild);
        expect(direction).toBe("none");
    });

    test(`should return "none" if the parent container is not found`, () => {
        container.removeAttribute("data-cslp");
        expect(getChildrenDirection(firstChild)).toBe("none");
    });

    test("should return 'vertical' if the parent container is found and the children are in a vertical list", () => {
        expect(getChildrenDirection(firstChild)).toBe("vertical");
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

        expect(getChildrenDirection(firstChild)).toBe("horizontal");
    });

    test("should create a clone and determine direction when one child is present", () => {
        container.removeChild(secondChild);

        firstChild.getBoundingClientRect = jest.fn().mockReturnValue({
            left: -10,
            top: 10,
        });

        expect(getChildrenDirection(firstChild)).toBe("vertical");
    });

    test("should return 'none' if input is not provided", () => {
        // @ts-ignore
        expect(getChildrenDirection()).toBe("none");
    });

    test(`should return "none" if container does not contain the elements`, () => {
        container.innerHTML = "";
        document.body.appendChild(firstChild);
        document.body.appendChild(secondChild);

        expect(getChildrenDirection(firstChild)).toBe("none");
    });
});

describe("handleAddButtonsForMultiple", () => {
    let firstChild: HTMLElement;
    let secondChild: HTMLElement;
    let container: HTMLElement;
    let visualEditorWrapper: HTMLElement;
    let previousButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;

    beforeEach(() => {
        firstChild = document.createElement("div");
        firstChild.setAttribute(
            "data-cslp",
            "page.bltapikey.en-us.page_components.0.hero_banner"
        );
        firstChild.setAttribute(
            "data-cslp-container",
            "page.bltapikey.en-us.page_components"
        );

        secondChild = document.createElement("div");
        secondChild.setAttribute(
            "data-cslp",
            "page.bltapikey.en-us.page_components.1.section"
        );
        secondChild.setAttribute(
            "data-cslp-container",
            "page.bltapikey.en-us.page_components"
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

        previousButton = document.createElement("button");
        nextButton = document.createElement("button");

        visualEditorWrapper = document.createElement("div");

        container = document.createElement("div");
        container.setAttribute(
            "data-cslp",
            "page.bltapikey.en-us.page_components"
        );
        container.appendChild(firstChild);
        container.appendChild(secondChild);

        document.body.appendChild(container);
        document.body.appendChild(visualEditorWrapper);
    });

    afterEach(() => {
        document.getElementsByTagName("body")[0].innerHTML = "";
        jest.resetAllMocks();
    });

    test("should not add buttons if the editable element is not found", () => {
        handleAddButtonsForMultiple({
            editableElement: null,
            visualEditorWrapper,
            nextButton: nextButton,
            previousButton: previousButton,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeFalsy();
    });

    test("should not add buttons if the editable element does not contain container", () => {
        firstChild.removeAttribute("data-cslp-container");

        handleAddButtonsForMultiple({
            editableElement: firstChild,
            visualEditorWrapper,
            nextButton: nextButton,
            previousButton: previousButton,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeFalsy();
    });

    test("should not add buttons if the direction is none", () => {
        container.removeAttribute("data-cslp");
        handleAddButtonsForMultiple({
            editableElement: firstChild,
            visualEditorWrapper,
            nextButton: nextButton,
            previousButton: previousButton,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeFalsy();
    });

    test("should not add buttons if the visual editor wrapper is not found", () => {
        handleAddButtonsForMultiple({
            editableElement: firstChild,
            visualEditorWrapper: null,
            nextButton: nextButton,
            previousButton: previousButton,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeFalsy();
    });

    test("should append the buttons to the visual editor wrapper", () => {
        handleAddButtonsForMultiple({
            editableElement: firstChild,
            visualEditorWrapper,
            nextButton: nextButton,
            previousButton: previousButton,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeTruthy();
        expect(visualEditorWrapper.contains(nextButton)).toBeTruthy();
    });

    test("should add the buttons to the center if the direction is horizontal", () => {
        handleAddButtonsForMultiple({
            editableElement: firstChild,
            visualEditorWrapper,
            nextButton: nextButton,
            previousButton: previousButton,
        });

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
        handleAddButtonsForMultiple({
            editableElement: firstChild,
            visualEditorWrapper,
            nextButton: nextButton,
            previousButton: previousButton,
        });

        expect(previousButton.style.left).toBe("15px");
        expect(previousButton.style.top).toBe("10px");

        expect(nextButton.style.left).toBe("15px");
        expect(nextButton.style.top).toBe("20px");
    });
});

describe("hideAddInstanceButtons", () => {
    let visualEditorWrapper: HTMLDivElement;
    let previousButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;
    let overlayWrapper: HTMLDivElement;
    let eventTarget: EventTarget;

    beforeEach(() => {
        visualEditorWrapper = document.createElement("div");
        previousButton = document.createElement("button");
        nextButton = document.createElement("button");
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

    test("should not hide buttons if wrapper or buttons are not present", () => {
        hideAddInstanceButtons({
            visualEditorWrapper: null,
            eventTarget: eventTarget,
            nextButton: null,
            previousButton: null,
            overlayWrapper: overlayWrapper,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeTruthy();
        expect(visualEditorWrapper.contains(nextButton)).toBeTruthy();
    });

    test("should not hide buttons if previous button contains event target", () => {
        hideAddInstanceButtons({
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: previousButton,
            nextButton: nextButton,
            previousButton: previousButton,
            overlayWrapper: overlayWrapper,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeTruthy();
        expect(visualEditorWrapper.contains(nextButton)).toBeTruthy();

        hideAddInstanceButtons({
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: nextButton,
            nextButton: nextButton,
            previousButton: previousButton,
            overlayWrapper: overlayWrapper,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeTruthy();
        expect(visualEditorWrapper.contains(nextButton)).toBeTruthy();
    });
    test("should not hide buttons if next button contains event target", () => {
        overlayWrapper.classList.add("visible");

        hideAddInstanceButtons({
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: eventTarget,
            nextButton: nextButton,
            previousButton: previousButton,
            overlayWrapper: overlayWrapper,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeTruthy();
        expect(visualEditorWrapper.contains(nextButton)).toBeTruthy();
    });

    test("should hide the buttons", () => {
        hideAddInstanceButtons({
            visualEditorWrapper: visualEditorWrapper,
            eventTarget: eventTarget,
            nextButton: nextButton,
            previousButton: previousButton,
            overlayWrapper: overlayWrapper,
        });

        expect(visualEditorWrapper.contains(previousButton)).toBeFalsy();
        expect(visualEditorWrapper.contains(nextButton)).toBeFalsy();
    });
});
