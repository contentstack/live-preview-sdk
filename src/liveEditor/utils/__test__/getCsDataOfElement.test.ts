import { getCsDataOfElement, getDOMEditStack } from "../getCsDataOfElement";
import { JSDOM } from "jsdom";

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

describe("getDOMEditStack", () => {
    it("get dom edit stack should provide stack", () => {
        const stack = [
            {
                ct: "page",
                uid: "page_uid",
                locale: "page_locale",
                fieldPath: "group",
            },
            {
                ct: "blog",
                uid: "blog_post_uid",
                locale: "blog_locale",
                fieldPath: "blogs",
            },
            {
                ct: "author",
                uid: "author_uid",
                locale: "author_locale",
                fieldPath: "author.name",
            },
        ];
        const getCSLP = ({ ct, uid, locale, fieldPath }: any) =>
            `${ct}.${uid}.${locale}.${fieldPath}`;
        const dom = new JSDOM(`
            <div data-cslp="${getCSLP(stack[0])}">
                <div class='empty_el'>
                    <span data-cslp="${getCSLP(stack[1])}">
                        <span data-cslp="${getCSLP(stack[1])}.0">
                            <span data-cslp="${getCSLP(
                                stack[2]
                            )}">author name</stack>
                        </span>
                    </span>
                </div>
            </div>
        `).window.document;
        const leafEl = dom.querySelector(
            `[data-cslp="${getCSLP(stack[2])}"]`
        ) as HTMLElement;
        const editStack = getDOMEditStack(leafEl);
        editStack.forEach((edit, idx) => {
            expect(edit.entry_uid).toBe(stack[idx].uid);
            expect(edit.content_type_uid).toBe(stack[idx].ct);
            expect(edit.locale).toBe(stack[idx].locale);
        });
    });
});
