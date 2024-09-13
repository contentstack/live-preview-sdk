import {
    generateReplaceAssetButton,
    removeReplaceAssetButton,
} from "./../../generators/generateAssetButton";

describe("generateReplaceAssetButton", () => {
    let targetElement: HTMLImageElement;
    let visualBuilderContainer: HTMLDivElement;
    const onClickCallback = vi.fn();

    beforeEach(() => {
        visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualBuilderContainer);

        targetElement = document.createElement("img");
        targetElement.src = "https://example.com/image.png";

        targetElement.getBoundingClientRect = vi.fn(() => ({
            x: 50,
            y: 50,
            width: 50,
            height: 50,
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
        })) as any;

        visualBuilderContainer.appendChild(targetElement);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test("should generate a button element with the correct class and text content", () => {
        const replaceButton = generateReplaceAssetButton(
            targetElement,
            onClickCallback
        );

        expect(replaceButton.tagName).toBe("BUTTON");
        expect(
            replaceButton.classList.contains("visual-builder__replace-button")
        ).toBe(true);
        expect(replaceButton.textContent).toBe("Replace Asset");
    });

    test("should attach a click event listener to the generated button", () => {
        const replaceButton = generateReplaceAssetButton(
            targetElement,
            onClickCallback
        );

        replaceButton.click();

        expect(onClickCallback).toHaveBeenCalled();
    });

    test("should position the button correctly", () => {
        const replaceButton = generateReplaceAssetButton(
            targetElement,
            onClickCallback
        );

        expect(replaceButton.style.top).toBe("20px");
        expect(replaceButton.style.right).toBe("974px");
    });
});

describe("removeReplaceAssetButton", () => {
    let visualBuilderContainer: HTMLDivElement;

    test("should remove all existing replace asset buttons from the provided visual builder wrapper element", () => {
        visualBuilderContainer = document.createElement("div");
        visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add("visual-builder__container");
        document.body.appendChild(visualBuilderContainer);

        generateReplaceAssetButton(visualBuilderContainer, vi.fn());
        generateReplaceAssetButton(visualBuilderContainer, vi.fn());

        expect(
            visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-replace-asset"]`
            ).length
        ).toBe(2);

        removeReplaceAssetButton(visualBuilderContainer);

        expect(
            visualBuilderContainer.querySelectorAll(
                `[data-testid="visual-builder-replace-asset"]`
            ).length
        ).toBe(0);
    });

    test("should do nothing if the provided visual builder wrapper element is null", () => {
        const visualBuilderContainer = null;

        expect(() =>
            removeReplaceAssetButton(visualBuilderContainer)
        ).not.toThrow();
    });
});
