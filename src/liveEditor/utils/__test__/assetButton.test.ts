import {
    generateReplaceAssetButton,
    removeReplaceAssetButton,
} from "../generateAssetButton";

describe("generateReplaceAssetButton", () => {
    let targetElement: HTMLImageElement;
    const onClickCallback = jest.fn();

    beforeEach(() => {
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

        document.body.appendChild(targetElement);
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
    it("should remove all existing replace asset buttons from the provided visual editor wrapper element", () => {
        const visualEditorWrapper = document.createElement("div");
        const replaceButton1 = generateReplaceAssetButton(
            visualEditorWrapper,
            jest.fn()
        );
        const replaceButton2 = generateReplaceAssetButton(
            visualEditorWrapper,
            jest.fn()
        );

        visualEditorWrapper.appendChild(replaceButton1);
        visualEditorWrapper.appendChild(replaceButton2);

        expect(
            visualEditorWrapper.querySelectorAll(
                `[data-testid="visual-editor-replace-asset"]`
            ).length
        ).toBe(2);

        removeReplaceAssetButton(visualEditorWrapper);

        expect(
            visualEditorWrapper.querySelectorAll(
                `[data-testid="visual-editor-replace-asset"]`
            ).length
        ).toBe(0);
    });

    it("should do nothing if the provided visual editor wrapper element is null", () => {
        const visualEditorWrapper = null;

        expect(() =>
            removeReplaceAssetButton(visualEditorWrapper)
        ).not.toThrow();
    });
});
