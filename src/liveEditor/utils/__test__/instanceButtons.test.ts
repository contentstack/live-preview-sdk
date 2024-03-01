import {
    getAddInstanceButtons,
    generateAddInstanceButton,
} from "./../../generators/generateAddInstanceButtons";

describe("generateAddInstanceButton", () => {
    test("should generate a button", () => {
        const button = generateAddInstanceButton(() => {});
        expect(button).toBeInstanceOf(HTMLButtonElement);
    });

    test("should call the callback when clicked", () => {
        const callback = jest.fn();
        const button = generateAddInstanceButton(callback);
        button.click();
        expect(callback).toHaveBeenCalledTimes(1);
    });
});

describe("getAddInstanceButtons", () => {
    let wrapper: HTMLDivElement;

    beforeEach(() => {
        wrapper = document.createElement("div");
        wrapper.innerHTML = `
            <button class="visual-editor__add-button"></button>
            <button class="visual-editor__add-button"></button>
        `;

        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
    });

    test("should return null if there are less than 2 buttons and we didn't ask for every buttons", () => {
        wrapper.innerHTML = `
            <button class="visual-editor__add-button"></button>
        `;
        const result = getAddInstanceButtons(wrapper);
        expect(result).toBeNull();
    });

    test("should return an array with previous and next buttons if there are 2 or more buttons", () => {
        const result = getAddInstanceButtons(wrapper);
        expect(result).toHaveLength(2);
        expect(result?.[0]).toBeInstanceOf(HTMLButtonElement);
        expect(result?.[1]).toBeInstanceOf(HTMLButtonElement);
    });

    test("should return all buttons if getAllButtons is true", () => {
        wrapper.innerHTML = `
      <button class="visual-editor__add-button"></button>
      <button class="visual-editor__add-button"></button>
      <button class="visual-editor__add-button"></button>
      <button class="visual-editor__add-button"></button>
    `;
        const result = getAddInstanceButtons(wrapper, true);
        expect(result).toHaveLength(4);
        expect(result![0]).toBeInstanceOf(HTMLButtonElement);
        expect(result![1]).toBeInstanceOf(HTMLButtonElement);
    });
});
