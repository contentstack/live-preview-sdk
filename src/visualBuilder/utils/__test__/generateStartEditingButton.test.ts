import { getDefaultConfig } from "../../../configManager/config.default";
import { IConfig } from "../../../types/types";
import { generateStartEditingButton } from "./../../generators/generateStartEditingButton";

describe("generateStartEditingButton", () => {
    let config: IConfig;

    beforeEach(() => {
        config = getDefaultConfig();

        config.stackDetails.apiKey = "bltapikey";
        config.stackDetails.environment = "bltenvironment";
    });

    afterEach(() => {
        vi.clearAllMocks();
        const existingButton = document.querySelector(
            ".visual-builder__start-editing-btn"
        );
        if (existingButton) {
            existingButton.remove();
        }
    });

    test("should return an anchor tag", () => {
        const button = generateStartEditingButton();
        expect(button).toBeInstanceOf(HTMLAnchorElement);
    });

    test("should append the button within document.body", () => {
        const initialBodyChildren = document.body.children.length;
        generateStartEditingButton();

        expect(document.body.children.length).toBe(initialBodyChildren + 1);
    });

    test("should update the href when clicked", () => {
        const button = generateStartEditingButton();
        button?.click();

        expect(button?.getAttribute("href")).toBe(
            "https://app.contentstack.com/#!/stack//visual-builder?target-url=http%3A%2F%2Flocalhost%3A3000&branch=main&locale=en-us"
        );
    });

    test("should get the href detail from cslp attribute if present", () => {
        const h1 = document.createElement("h1");

        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.single_line"
        );

        document.body.appendChild(h1);

        const button = generateStartEditingButton();
        button?.click();

        expect(button?.getAttribute("href")).toBe(
            "https://app.contentstack.com/#!/stack//visual-builder?target-url=http%3A%2F%2Flocalhost%3A3000&branch=main&locale=en-us"
        );
    });
});
