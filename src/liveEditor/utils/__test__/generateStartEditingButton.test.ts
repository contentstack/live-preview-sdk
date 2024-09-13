import { getDefaultConfig } from "../../../configManager/config.default";
import { PublicLogger } from "../../../logger/logger";
import { IConfig } from "../../../types/types";
import { generateStartEditingButton } from "./../../generators/generateStartEditingButton";

describe("generateStartEditingButton", () => {
    let config: IConfig;
    let visualEditorContainer: HTMLDivElement;

    beforeEach(() => {
        config = getDefaultConfig();

        config.stackDetails.apiKey = "bltapikey";
        config.stackDetails.environment = "bltenvironment";

        visualEditorContainer = document.createElement("div");
        document.body.appendChild(visualEditorContainer);
    });

    afterEach(() => {
        vi.clearAllMocks();
        document.body.removeChild(visualEditorContainer);
    });

    test("should  return an anchor tag", () => {
        const button = generateStartEditingButton(visualEditorContainer);
        expect(button).toBeInstanceOf(HTMLAnchorElement);
    });

    test("should append the button within visualEditorContainer", () => {
        expect(visualEditorContainer.children.length).toBe(0);
        generateStartEditingButton(visualEditorContainer);

        expect(visualEditorContainer.children.length).toBe(1);
    });

    test("should update the href when clicked", () => {
        const button = generateStartEditingButton(visualEditorContainer);
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

        const button = generateStartEditingButton(visualEditorContainer);
        button?.click();

        expect(button?.getAttribute("href")).toBe(
            "https://app.contentstack.com/live-editor/stack//environment/?branch=main&target-url=http%3A%2F%2Flocalhost%2F&locale=en-us"
        );
    });

    test("should throw a warning if visualEditorContainer is not found", () => {
        const spiedWarn = vi.spyOn(PublicLogger, "warn");

        generateStartEditingButton(null);

        expect(spiedWarn).toHaveBeenCalledTimes(1);
    });
});
