import {
    generateReplaceAssetButton,
    removeReplaceAssetButton,
} from "./../../generators/generateAssetButton";

describe("generateReplaceAssetButton", () => {
    let targetElement: HTMLImageElement;
    let visualEditorContainer: HTMLDivElement;
    const onClickCallback = jest.fn();

    beforeEach(() => {
        visualEditorContainer = document.createElement("div");
        visualEditorContainer.classList.add("visual-editor__container");
        document.body.appendChild(visualEditorContainer);

        targetElement = document.createElement("img");
        targetElement.src = "https://example.com/image.png";

        targetElement.getBoundingClientRect = jest.fn(() => ({
            x: 50,
            y: 50,
            width: 50,
            height: 50,
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        })) as any;

        visualEditorContainer.appendChild(targetElement);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should generate a button element with the correct class and text content", () => {
        const replaceButton = generateReplaceAssetButton(
            targetElement,
            onClickCallback
        );

        expect(replaceButton.tagName).toBe("BUTTON");
        expect(
            replaceButton.classList.contains("visual-editor__replace-button")
        ).toBe(true);
        expect(replaceButton.textContent).toBe("Replace Asset");
    });

    it("should attach a click event listener to the generated button", () => {
        const replaceButton = generateReplaceAssetButton(
            targetElement,
            onClickCallback
        );

        replaceButton.click();

        expect(onClickCallback).toHaveBeenCalled();
    });

    it("should position the button correctly", () => {
        const replaceButton = generateReplaceAssetButton(
            targetElement,
            onClickCallback
        );

        expect(replaceButton.style.top).toBe("20px");
        expect(replaceButton.style.right).toBe("974px");
    });
});

describe("removeReplaceAssetButton", () => {
    let visualEditorContainer: HTMLDivElement;

    it("should remove all existing replace asset buttons from the provided visual editor wrapper element", () => {
        visualEditorContainer = document.createElement("div");
        visualEditorContainer = document.createElement("div");
        visualEditorContainer.classList.add("visual-editor__container");
        document.body.appendChild(visualEditorContainer);

        generateReplaceAssetButton(
            visualEditorContainer,
            jest.fn()
        );
        generateReplaceAssetButton(
            visualEditorContainer,
            jest.fn()
        );

        expect(
            visualEditorContainer.querySelectorAll(
                `[data-testid="visual-editor-replace-asset"]`
            ).length
        ).toBe(2);

        removeReplaceAssetButton(visualEditorContainer);

        expect(
            visualEditorContainer.querySelectorAll(
                `[data-testid="visual-editor-replace-asset"]`
            ).length
        ).toBe(0);
    });

    it("should do nothing if the provided visual editor wrapper element is null", () => {
        const visualEditorContainer = null;

        expect(() =>
            removeReplaceAssetButton(visualEditorContainer)
        ).not.toThrow();
    });
});
