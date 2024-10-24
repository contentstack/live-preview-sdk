import { generatePseudoEditableElement } from "./../../generators/generatePseudoEditableField";

describe("generatePseudoEditableElement", () => {
    let visualBuilderContainer: HTMLDivElement;

    beforeEach(() => {
        visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualBuilderContainer);
    });

    afterEach(() => {
        document.body.removeChild(visualBuilderContainer);
    });

    test("it should generate a pseudo editable element", () => {
        const editableElement = document.createElement("div");

        const mockedBoundingClientRect = {
            bottom: 88.3984375,
            height: 54.3984375,
            left: 34,
            right: 862,
            top: 34,
            width: 828,
            x: 34,
            y: 34,
        };

        editableElement.getBoundingClientRect = vi
            .fn()
            .mockReturnValue(mockedBoundingClientRect);

        editableElement.style.width = "100px";

        const expectedTextContent = "I am the correct long expected data";

        const pseudoEditableElement = generatePseudoEditableElement(
            { editableElement },
            { textContent: expectedTextContent }
        );

        expect(pseudoEditableElement).toBeTruthy();
        expect(pseudoEditableElement.textContent).toBe(expectedTextContent);
        expect(editableElement.style.cssText).toBe("width: 100px;");
    });
});
