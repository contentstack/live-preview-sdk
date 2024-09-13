import crypto from "crypto";

import { getFieldSchemaMap } from "../../../__test__/data/fieldSchemaMap";
import { sleep } from "../../../__test__/utils";
import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";
import { FieldSchemaMap } from "../fieldSchemaMap";
import { getCsDataOfElement } from "../getCsDataOfElement";
import { generateAddInstanceButton } from "./../../generators/generateAddInstanceButtons";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "../multipleElementAddButton";
import getChildrenDirection from "../getChildrenDirection";
import liveEditorPostMessage from "../liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../types/postMessage.types";

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

vi.mock("../liveEditorPostMessage", async () => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("../../../__test__/data/contentType")
    >("../../../__test__/data/contentType");
    const contentTypes = getAllContentTypes();
    return {
        __esModule: true,
        default: {
            send: vi.fn().mockImplementation((eventName: string) => {
                if (eventName === "init")
                    return Promise.resolve({
                        contentTypes,
                    });
                return Promise.resolve();
            }),
            on: vi.fn(),
        },
    };
});

describe("generateAddInstanceButton", () => {
    test("should generate a button", () => {
        const button = generateAddInstanceButton(() => {});
        expect(button.tagName).toBe("BUTTON");
    });

    test("should run the callback when the button is clicked", () => {
        const mockCallback = vi.fn();
        const button = generateAddInstanceButton(mockCallback);

        button.click();
        expect(mockCallback).toHaveBeenCalled();
    });
});

// TODO: rewrite this
describe("getChildrenDirection", () => {
    let visualEditorContainer: HTMLDivElement;
    let firstChild: HTMLElement;
    let secondChild: HTMLElement;
    let container: HTMLElement;

    beforeEach(() => {
        visualEditorContainer = document.createElement("div");
        visualEditorContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualEditorContainer);

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

        visualEditorContainer.appendChild(container);
    });

    afterEach(() => {
        document.getElementsByTagName("body")[0].innerHTML = "";
        vi.resetAllMocks();
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
        firstChild.getBoundingClientRect = vi.fn().mockReturnValue({
            left: 10,
            top: 10,
        });

        secondChild.getBoundingClientRect = vi.fn().mockReturnValue({
            left: 20,
            top: 10,
        });

        expect(
            getChildrenDirection(firstChild, "all_fields.bltapikey.en-us.group")
        ).toBe("horizontal");
    });

    test("should create a clone and determine direction when one child is present", () => {
        container.removeChild(secondChild);

        firstChild.getBoundingClientRect = vi.fn().mockReturnValue({
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
    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
    });

    describe("component render and UI logic", () => {
        let firstChild: HTMLElement;
        let secondChild: HTMLElement;
        let container: HTMLElement;
        let visualEditorContainer: HTMLDivElement;
        let eventDetails: VisualEditorCslpEventDetails;

        beforeEach(() => {
            visualEditorContainer = document.createElement("div");
            visualEditorContainer.classList.add("visual-builder__container");
            document.body.appendChild(visualEditorContainer);

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

            firstChild.getBoundingClientRect = vi.fn().mockReturnValue({
                left: 10,
                right: 20,
                top: 10,
                bottom: 20,
            });

            secondChild.getBoundingClientRect = vi.fn().mockReturnValue({
                left: 20,
                right: 30,
                top: 10,
                bottom: 20,
            });

            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group"
            );
            container.appendChild(firstChild);
            container.appendChild(secondChild);

            visualEditorContainer.appendChild(container);

            const mouseEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            });
            firstChild.dispatchEvent(mouseEvent);

            eventDetails = getCsDataOfElement(
                mouseEvent
            ) as VisualEditorCslpEventDetails;
        });

        afterEach(() => {
            document.getElementsByTagName("body")[0].innerHTML = "";
            vi.resetAllMocks();
        });

        test("should not add buttons if the editable element is not found", () => {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: null,
                visualEditorContainer: visualEditorContainer,
            });

            const addInstanceButtons = visualEditorContainer.querySelectorAll(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(0);
        });

        test("should not add buttons if the direction is none", () => {
            container.removeAttribute("data-cslp");
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: firstChild,
                visualEditorContainer,
            });

            const addInstanceButtons = visualEditorContainer.querySelectorAll(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(0);
        });

        test("should not add buttons if the visual editor wrapper is not found", () => {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: firstChild,
                visualEditorContainer: null,
            });

            const addInstanceButtons = visualEditorContainer.querySelectorAll(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(0);
        });

        test("should append the buttons to the visual editor wrapper", async () => {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: firstChild,
                visualEditorContainer,
            });

            await sleep(0);
            const addInstanceButtons = visualEditorContainer.querySelectorAll(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should add the buttons to the center if the direction is horizontal", async () => {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: firstChild,
                visualEditorContainer,
            });
            await sleep(0);

            const addInstanceButtons = visualEditorContainer.querySelectorAll(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            const previousButton = addInstanceButtons[0] as HTMLButtonElement;
            const nextButton = addInstanceButtons[1] as HTMLButtonElement;

            expect(previousButton.style.left).toBe("10px");
            expect(previousButton.style.top).toBe("15px");

            expect(nextButton.style.left).toBe("20px");
            expect(nextButton.style.top).toBe("15px");
        });

        test("should add the buttons to the middle if the direction is vertical", async () => {
            firstChild.getBoundingClientRect = vi.fn().mockReturnValue({
                left: 10,
                right: 20,
                top: 10,
                bottom: 20,
            });

            secondChild.getBoundingClientRect = vi.fn().mockReturnValue({
                left: 10,
                right: 20,
                top: 20,
                bottom: 30,
            });
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: firstChild,
                visualEditorContainer,
            });
            await sleep(0);

            const addInstanceButtons = visualEditorContainer.querySelectorAll(
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

    describe("click event on add instance button", () => {
        let firstChild: HTMLElement;
        let secondChild: HTMLElement;
        let container: HTMLElement;
        let visualEditorContainer: HTMLDivElement;
        let eventDetails: VisualEditorCslpEventDetails;

        beforeEach(() => {
            visualEditorContainer = document.createElement("div");
            visualEditorContainer.classList.add("visual-builder__container");
            document.body.appendChild(visualEditorContainer);

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

            firstChild.getBoundingClientRect = vi.fn().mockReturnValue({
                left: 10,
                right: 20,
                top: 10,
                bottom: 20,
            });

            secondChild.getBoundingClientRect = vi.fn().mockReturnValue({
                left: 20,
                right: 30,
                top: 10,
                bottom: 20,
            });

            container = document.createElement("div");
            container.setAttribute(
                "data-cslp",
                "all_fields.bltapikey.en-us.group"
            );
            container.appendChild(firstChild);
            container.appendChild(secondChild);

            visualEditorContainer.appendChild(container);

            const mouseEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            });
            firstChild.dispatchEvent(mouseEvent);

            eventDetails = getCsDataOfElement(
                mouseEvent
            ) as VisualEditorCslpEventDetails;
        });

        afterEach(() => {
            document.getElementsByTagName("body")[0].innerHTML = "";
            vi.resetAllMocks();
        });

        test("should send an add instance message to the parent", async () => {
            handleAddButtonsForMultiple(eventDetails, {
                editableElement: firstChild,
                visualEditorContainer,
            });

            await sleep(0);
            const addInstanceButtons = visualEditorContainer.querySelectorAll(
                `[data-testid="visual-editor-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(2);

            (addInstanceButtons[0] as HTMLButtonElement).click();

            expect(liveEditorPostMessage?.send).toBeCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue: "all_fields.bltapikey.en-us.group.0",
                        fieldPath: "group",
                        fieldPathWithIndex: "group",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "group",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.group",
                            },
                            index: 0,
                        },
                        instance: {
                            fieldPathWithIndex: "group.0",
                        },
                    },

                    index: 0,
                }
            );

            (addInstanceButtons[1] as HTMLButtonElement).click();

            expect(liveEditorPostMessage?.send).lastCalledWith(
                LiveEditorPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: {
                        entry_uid: "bltapikey",
                        content_type_uid: "all_fields",
                        locale: "en-us",
                        cslpValue: "all_fields.bltapikey.en-us.group.0",
                        fieldPath: "group",
                        fieldPathWithIndex: "group",
                        multipleFieldMetadata: {
                            parentDetails: {
                                parentPath: "group",
                                parentCslpValue:
                                    "all_fields.bltapikey.en-us.group",
                            },
                            index: 0,
                        },
                        instance: {
                            fieldPathWithIndex: "group.0",
                        },
                    },
                    index: 1,
                }
            );
        });
    });
});

describe("removeAddInstanceButtons", () => {
    let visualEditorContainer: HTMLDivElement;
    let previousButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;
    let overlayWrapper: HTMLDivElement;
    let eventTarget: EventTarget;

    beforeEach(() => {
        visualEditorContainer = document.createElement("div");
        visualEditorContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualEditorContainer);

        previousButton = generateAddInstanceButton(() => {});
        nextButton = generateAddInstanceButton(() => {});
        overlayWrapper = document.createElement("div");
        eventTarget = document.createElement("div");

        visualEditorContainer.appendChild(previousButton);
        visualEditorContainer.appendChild(nextButton);
        visualEditorContainer.appendChild(overlayWrapper);
    });

    afterEach(() => {
        document.getElementsByTagName("body")[0].innerHTML = "";
        vi.resetAllMocks();
    });

    test("should not remove buttons if wrapper or buttons are not present", () => {
        removeAddInstanceButtons({
            visualEditorContainer: null,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        const addInstanceButtons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should not remove buttons if previous button contains event target", () => {
        overlayWrapper.classList.add("visible");

        removeAddInstanceButtons({
            visualEditorContainer: visualEditorContainer,
            eventTarget: previousButton,
            overlayWrapper: overlayWrapper,
        });

        let addInstanceButtons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);

        removeAddInstanceButtons({
            visualEditorContainer: visualEditorContainer,
            eventTarget: nextButton,
            overlayWrapper: overlayWrapper,
        });

        addInstanceButtons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should not remove buttons if next button contains event target", () => {
        overlayWrapper.classList.add("visible");

        removeAddInstanceButtons({
            visualEditorContainer: visualEditorContainer,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        const addInstanceButtons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should remove the buttons", () => {
        removeAddInstanceButtons({
            visualEditorContainer: visualEditorContainer,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        expect(visualEditorContainer.contains(previousButton)).toBeFalsy();
        expect(visualEditorContainer.contains(nextButton)).toBeFalsy();
    });

    test("should remove all buttons if forceRemoveAll is true", () => {
        for (let i = 0; i < 5; i++) {
            const button = generateAddInstanceButton(() => {});
            visualEditorContainer.appendChild(button);
        }

        let buttons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(buttons.length).toBe(7);

        removeAddInstanceButtons(
            {
                visualEditorContainer: visualEditorContainer,
                eventTarget: eventTarget,
                overlayWrapper: overlayWrapper,
            },
            true
        );

        buttons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(buttons.length).toBe(0);
    });

    test("should not remove all buttons if forceRemoveAll is false", () => {
        for (let i = 0; i < 5; i++) {
            const button = generateAddInstanceButton(() => {});
            visualEditorContainer.appendChild(button);
        }

        let buttons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(buttons.length).toBe(7);

        removeAddInstanceButtons(
            {
                visualEditorContainer: visualEditorContainer,
                eventTarget: eventTarget,
                overlayWrapper: overlayWrapper,
            },
            false
        );

        buttons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        const addInstanceButtons = visualEditorContainer.querySelectorAll(
            `[data-testid="visual-editor-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(5);
    });
});
