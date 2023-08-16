import { getDefaultConfig } from "../../../utils/defaults";
import { PublicLogger } from "../../../utils/public-logger";
import { IConfig } from "../../../types/types";
import { generateStartEditingButton } from "../generateStartEditingButton";

describe("generateStartEditingButton", () => {
    let config: IConfig;
    let visualEditorWrapper: HTMLDivElement;
    const onClickEvent = jest.fn();

    beforeEach(() => {
        config = getDefaultConfig();

        config.stackDetails.apiKey = "bltapikey";
        config.stackDetails.environment = "bltenvironment";

        visualEditorWrapper = document.createElement("div");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should  return a button", () => {
        const button = generateStartEditingButton(
            config,
            visualEditorWrapper,
            onClickEvent
        );
        expect(button).toBeInstanceOf(HTMLButtonElement);
    });
    test("should append the button within visualEditorWrapper", () => {
        expect(visualEditorWrapper.children.length).toBe(0);
        generateStartEditingButton(config, visualEditorWrapper, onClickEvent);

        expect(visualEditorWrapper.children.length).toBe(1);
    });
    test("should call the startEditing function when clicked", () => {
        const button = generateStartEditingButton(
            config,
            visualEditorWrapper,
            onClickEvent
        );
        button?.click();

        expect(onClickEvent).toHaveBeenCalledTimes(1);
    });
    test("should throw a warning if visualEditorWrapper is not found", () => {
        const spiedWarn = jest.spyOn(PublicLogger, "warn");

        generateStartEditingButton(config, null, onClickEvent);

        expect(spiedWarn).toHaveBeenCalledTimes(1);
    });
});
