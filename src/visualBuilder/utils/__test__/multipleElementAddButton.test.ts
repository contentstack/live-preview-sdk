import crypto from "crypto";
import { getFieldSchemaMap } from "../../../__test__/data/fieldSchemaMap";
import { sleep } from "../../../__test__/utils";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { FieldSchemaMap } from "../fieldSchemaMap";
import { getCsDataOfElement } from "../getCsDataOfElement";
import { generateAddInstanceButton } from "./../../generators/generateAddInstanceButtons";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "../multipleElementAddButton";
import getChildrenDirection from "../getChildrenDirection";
import visualBuilderPostMessage from "../visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import { singleLineFieldSchema } from "../../../__test__/data/fields";

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

const mockResizeObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
};

vi.mock("../visualBuilderPostMessage", async () => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("../../../__test__/data/contentType")
    >("../../../__test__/data/contentType");
    const contentTypes = getAllContentTypes();
    return {
        default: {
            send: vi.fn().mockImplementation((eventName: string) => {
                if (eventName === "init") {
                    return {
                        contentTypes,
                    };
                }
                return Promise.resolve({});
            }),
            on: vi.fn(),
        },
    };
});

describe("generateAddInstanceButton", () => {
    test("should generate a button", () => {
        const button = generateAddInstanceButton({
            fieldSchema: singleLineFieldSchema,
            value: "",
            onClick: () => {},
        });
        expect(button.tagName).toBe("BUTTON");
    });

    test("should run the callback when the button is clicked", () => {
        const mockCallback = vi.fn();
        const button = generateAddInstanceButton({
            fieldSchema: singleLineFieldSchema,
            value: "",
            onClick: mockCallback,
        });

        button.click();
        expect(mockCallback).toHaveBeenCalled();
    });
});

// TODO: rewrite this
describe("getChildrenDirection", () => {
    let visualBuilderContainer: HTMLDivElement;
    let firstChild: HTMLElement;
    let secondChild: HTMLElement;
    let container: HTMLElement;

    beforeEach(() => {
        visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualBuilderContainer);

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

        visualBuilderContainer.appendChild(container);
    });

    afterEach(() => {
        document.getElementsByTagName("body")[0].innerHTML = "";
        vi.clearAllMocks();
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
        let visualBuilderContainer: HTMLDivElement;
        let eventDetails: VisualBuilderCslpEventDetails;

        beforeEach(() => {
            visualBuilderContainer = document.createElement("div");
            visualBuilderContainer.classList.add("visual-builder__container");
            document.body.appendChild(visualBuilderContainer);

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

            visualBuilderContainer.appendChild(container);

            const mouseEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            });
            firstChild.dispatchEvent(mouseEvent);

            eventDetails = getCsDataOfElement(
                mouseEvent
            ) as VisualBuilderCslpEventDetails;
        });

        afterEach(() => {
            document.getElementsByTagName("body")[0].innerHTML = "";
            vi.clearAllMocks();
        });

        test("should not add buttons if the editable element is not found", () => {
            handleAddButtonsForMultiple(
                eventDetails,
                {
                    editableElement: null,
                    visualBuilderContainer: visualBuilderContainer,
                    resizeObserver: mockResizeObserver,
                },
                {
                    fieldSchema: singleLineFieldSchema,
                    expectedFieldData: [],
                    disabled: false,
                    label: undefined,
                }
            );

            const addInstanceButtons = visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(0);
        });

        test("should not add buttons if the direction is none", () => {
            container.removeAttribute("data-cslp");
            handleAddButtonsForMultiple(
                eventDetails,
                {
                    editableElement: null,
                    visualBuilderContainer: visualBuilderContainer,
                    resizeObserver: mockResizeObserver,
                },
                {
                    fieldSchema: singleLineFieldSchema,
                    expectedFieldData: [],
                    disabled: false,
                    label: undefined,
                }
            );

            const addInstanceButtons = visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(0);
        });

        test("should not add buttons if the visual builder wrapper is not found", () => {
            handleAddButtonsForMultiple(
                eventDetails,
                {
                    editableElement: null,
                    visualBuilderContainer: visualBuilderContainer,
                    resizeObserver: mockResizeObserver,
                },
                {
                    fieldSchema: singleLineFieldSchema,
                    expectedFieldData: [],
                    disabled: false,
                    label: undefined,
                }
            );

            const addInstanceButtons = visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(0);
        });

        test("should append the buttons to the visual builder wrapper", async () => {
            handleAddButtonsForMultiple(
                eventDetails,
                {
                    editableElement: firstChild,
                    visualBuilderContainer: visualBuilderContainer,
                    resizeObserver: mockResizeObserver,
                },
                {
                    fieldSchema: singleLineFieldSchema,
                    expectedFieldData: "Hello",
                    disabled: false,
                    label: undefined,
                }
            );

            await sleep(0);
            const addInstanceButtons = visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(2);
        });

        test("should add the buttons to the center if the direction is horizontal", async () => {
            handleAddButtonsForMultiple(
                eventDetails,
                {
                    editableElement: firstChild,
                    visualBuilderContainer: visualBuilderContainer,
                    resizeObserver: mockResizeObserver,
                },
                {
                    fieldSchema: singleLineFieldSchema,
                    expectedFieldData: [],
                    disabled: false,
                    label: undefined,
                }
            );
            await sleep(0);

            const addInstanceButtons = visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-add-instance-button"]`
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
            handleAddButtonsForMultiple(
                eventDetails,
                {
                    editableElement: firstChild,
                    visualBuilderContainer: visualBuilderContainer,
                    resizeObserver: mockResizeObserver,
                },
                {
                    fieldSchema: singleLineFieldSchema,
                    expectedFieldData: [],
                    disabled: false,
                    label: undefined,
                }
            );
            await sleep(0);

            const addInstanceButtons = visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-add-instance-button"]`
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
        let visualBuilderContainer: HTMLDivElement;
        let eventDetails: VisualBuilderCslpEventDetails;

        beforeEach(() => {
            visualBuilderContainer = document.createElement("div");
            visualBuilderContainer.classList.add("visual-builder__container");
            document.body.appendChild(visualBuilderContainer);

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

            visualBuilderContainer.appendChild(container);

            const mouseEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            });
            firstChild.dispatchEvent(mouseEvent);

            eventDetails = getCsDataOfElement(
                mouseEvent
            ) as VisualBuilderCslpEventDetails;
        });

        afterEach(() => {
            document.getElementsByTagName("body")[0].innerHTML = "";
            vi.clearAllMocks();
        });

        test("should send an add instance message to the parent", async () => {
            handleAddButtonsForMultiple(
                eventDetails,
                {
                    editableElement: firstChild,
                    visualBuilderContainer: visualBuilderContainer,
                    resizeObserver: mockResizeObserver,
                },
                {
                    fieldSchema: singleLineFieldSchema,
                    expectedFieldData: [],
                    disabled: false,
                    label: undefined,
                }
            );

            await sleep(0);
            const addInstanceButtons = visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-add-instance-button"]`
            );

            expect(addInstanceButtons.length).toBe(2);

            (addInstanceButtons[0] as HTMLButtonElement).click();

            expect(visualBuilderPostMessage?.send).toBeCalledWith(
                VisualBuilderPostMessageEvents.ADD_INSTANCE,
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

            expect(visualBuilderPostMessage?.send).lastCalledWith(
                VisualBuilderPostMessageEvents.ADD_INSTANCE,
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
    let visualBuilderContainer: HTMLDivElement;
    let previousButton: HTMLButtonElement;
    let nextButton: HTMLButtonElement;
    let overlayWrapper: HTMLDivElement;
    let eventTarget: EventTarget;

    beforeEach(() => {
        visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualBuilderContainer);

        previousButton = generateAddInstanceButton({
            fieldSchema: singleLineFieldSchema,
            value: "",
            onClick: vi.fn(),
        });
        nextButton = generateAddInstanceButton({
            fieldSchema: singleLineFieldSchema,
            value: "",
            onClick: vi.fn(),
        });
        overlayWrapper = document.createElement("div");
        eventTarget = document.createElement("div");

        visualBuilderContainer.appendChild(previousButton);
        visualBuilderContainer.appendChild(nextButton);
        visualBuilderContainer.appendChild(overlayWrapper);
    });

    afterEach(() => {
        document.getElementsByTagName("body")[0].innerHTML = "";
        vi.clearAllMocks();
    });

    test("should not remove buttons if wrapper or buttons are not present", () => {
        removeAddInstanceButtons({
            visualBuilderContainer: null,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        const addInstanceButtons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should not remove buttons if previous button contains event target", () => {
        overlayWrapper.classList.add("visible");

        removeAddInstanceButtons({
            visualBuilderContainer: visualBuilderContainer,
            eventTarget: previousButton,
            overlayWrapper: overlayWrapper,
        });

        let addInstanceButtons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);

        removeAddInstanceButtons({
            visualBuilderContainer: visualBuilderContainer,
            eventTarget: nextButton,
            overlayWrapper: overlayWrapper,
        });

        addInstanceButtons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should not remove buttons if next button contains event target", () => {
        overlayWrapper.classList.add("visible");

        removeAddInstanceButtons({
            visualBuilderContainer: visualBuilderContainer,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        const addInstanceButtons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(2);
    });

    test("should remove the buttons", () => {
        removeAddInstanceButtons({
            visualBuilderContainer: visualBuilderContainer,
            eventTarget: eventTarget,
            overlayWrapper: overlayWrapper,
        });

        expect(visualBuilderContainer.contains(previousButton)).toBeFalsy();
        expect(visualBuilderContainer.contains(nextButton)).toBeFalsy();
    });

    test("should remove all buttons if forceRemoveAll is true", () => {
        for (let i = 0; i < 5; i++) {
            const button = generateAddInstanceButton({
                fieldSchema: singleLineFieldSchema,
                value: "",
                onClick: () => {},
            });
            visualBuilderContainer.appendChild(button);
        }

        let buttons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        expect(buttons.length).toBe(7);

        removeAddInstanceButtons(
            {
                visualBuilderContainer: visualBuilderContainer,
                eventTarget: eventTarget,
                overlayWrapper: overlayWrapper,
            },
            true
        );

        buttons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        expect(buttons.length).toBe(0);
    });

    test("should not remove all buttons if forceRemoveAll is false", () => {
        for (let i = 0; i < 5; i++) {
            const button = generateAddInstanceButton({
                fieldSchema: singleLineFieldSchema,
                value: "",
                onClick: () => {},
            });
            visualBuilderContainer.appendChild(button);
        }

        let buttons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        expect(buttons.length).toBe(7);

        removeAddInstanceButtons(
            {
                visualBuilderContainer: visualBuilderContainer,
                eventTarget: eventTarget,
                overlayWrapper: overlayWrapper,
            },
            false
        );

        buttons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        const addInstanceButtons = visualBuilderContainer.querySelectorAll(
            `[data-testid="visual-builder-add-instance-button"]`
        );

        expect(addInstanceButtons.length).toBe(5);
    });
});
