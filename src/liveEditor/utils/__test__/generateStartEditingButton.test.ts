import { getDefaultConfig } from "../../../configManager/config.default";
import { PublicLogger } from "../../../logger/logger";
import { IConfig } from "../../../types/types";
import { generateStartEditingButton } from "../generateStartEditingButton";

describe("generateStartEditingButton", () => {
    let config: IConfig;
    let visualEditorWrapper: HTMLDivElement;

    beforeEach(() => {
        config = getDefaultConfig();

        config.stackDetails.apiKey = "bltapikey";
        config.stackDetails.environment = "bltenvironment";

        visualEditorWrapper = document.createElement("div");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should  return an anchor tag", () => {
        const button = generateStartEditingButton(visualEditorWrapper);
        expect(button).toBeInstanceOf(HTMLAnchorElement);
    });
    test("should append the button within visualEditorWrapper", () => {
        expect(visualEditorWrapper.children.length).toBe(0);
        generateStartEditingButton(visualEditorWrapper);

        expect(visualEditorWrapper.children.length).toBe(1);
    });
    test("should update the href when clicked", () => {
        const button = generateStartEditingButton(visualEditorWrapper);
        button?.click();

        expect(button?.getAttribute("href")).toBe(
            "https://app.contentstack.com/live-editor/stack//environment/?branch=main&target-url=http%3A%2F%2Flocalhost%2F&locale=en-us"
        );
    });

    test("should get the href detal from cslp attribute if present", () => {
        const h1 = document.createElement("h1");

        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.single_line"
        );

        document.body.appendChild(h1);

        const button = generateStartEditingButton(visualEditorWrapper);
        button?.click();

        expect(button?.getAttribute("href")).toBe(
            "https://app.contentstack.com/live-editor/stack//environment/?branch=main&target-url=http%3A%2F%2Flocalhost%2F&locale=en-us"
        );
    });

    test("should throw a warning if visualEditorWrapper is not found", () => {
        const spiedWarn = jest.spyOn(PublicLogger, "warn");

        generateStartEditingButton(null);

        expect(spiedWarn).toHaveBeenCalledTimes(1);
    });
});
