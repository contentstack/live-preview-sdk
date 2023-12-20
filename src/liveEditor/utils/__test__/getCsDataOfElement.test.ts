import { getCsDataOfElement } from "../getCsDataOfElement";

describe("getCsDataOfElement", () => {
    let targetElement: Element;
    let mockEvent: MouseEvent;

    beforeEach(() => {
        targetElement = document.createElement("div");
        targetElement.setAttribute(
            "data-cslp",
            "all_fields.bltentryuid.en-us.title"
        );

        document.body.appendChild(targetElement);

        jest.spyOn(targetElement, "closest").mockReturnValue(targetElement);

        mockEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });

        targetElement.dispatchEvent(mockEvent);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        jest.clearAllMocks();
    });

    test("should return undefined if targetElement is not present", () => {
        // create a new event with null target to simulate the case where targetElement is not present
        Object.defineProperty(mockEvent, "target", {
            value: null,
            writable: false,
        });

        const result = getCsDataOfElement(mockEvent);

        expect(result).toBeUndefined();
    });

    test("should return undefined if editableElement is not present", () => {
        targetElement = document.createElement("div");
        document.body.innerHTML = "";

        mockEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });

        targetElement.dispatchEvent(mockEvent);

        const result = getCsDataOfElement(mockEvent);

        expect(result).toBeUndefined();
    });

    test("should return undefined if cslpData is not present", () => {
        targetElement.removeAttribute("data-cslp");

        const result = getCsDataOfElement(mockEvent);

        expect(result).toBeUndefined();
    });

    test("should return event details if all the required data is present", () => {
        const result = getCsDataOfElement(mockEvent);

        expect(result).toEqual({
            editableElement: targetElement,
            cslpData: "all_fields.bltentryuid.en-us.title",
            fieldMetadata: {
                entry_uid: "bltentryuid",
                content_type_uid: "all_fields",
                locale: "en-us",
                cslpValue: "all_fields.bltentryuid.en-us.title",
                fieldPath: "title",
                fieldPathWithIndex: "title",
                multipleFieldMetadata: { parentDetails: null, index: -1 },
            },
        });
    });

    test("should return event details if the data cslp is the parent of the target element", () => {
        document.body.innerHTML = "";

        targetElement = document.createElement("div");
        const parentElement = document.createElement("div");
        parentElement.setAttribute(
            "data-cslp",
            "all_fields.bltentryuid.en-us.title"
        );
        parentElement.setAttribute("data-testid", "parentElement");
        parentElement.appendChild(targetElement);
        document.body.appendChild(parentElement);

        mockEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });

        targetElement.dispatchEvent(mockEvent);

        const result = getCsDataOfElement(mockEvent);

        expect(result).toEqual({
            editableElement: parentElement,
            cslpData: "all_fields.bltentryuid.en-us.title",
            fieldMetadata: {
                entry_uid: "bltentryuid",
                content_type_uid: "all_fields",
                locale: "en-us",
                cslpValue: "all_fields.bltentryuid.en-us.title",
                fieldPath: "title",
                fieldPathWithIndex: "title",
                multipleFieldMetadata: { parentDetails: null, index: -1 },
            },
        });
    });
});
