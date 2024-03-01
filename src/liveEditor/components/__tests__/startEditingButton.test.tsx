import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/preact";
import StartEditingButtonComponent from "../startEditingButton";
import { IConfig } from "../../../types/types";
import { getDefaultConfig } from "../../../configManager/config.default";

describe("StartEditingButtonComponent", () => {
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
        jest.clearAllMocks();
        document.body.removeChild(visualEditorContainer);
    });

    it("renders correctly with EditIcon and Start Editing text", () => {
        const { getByText, getByTestId } = render(
            <StartEditingButtonComponent />
        );

        const editIcon = getByTestId("visual-editor__edit-icon");
        const startEditingText = getByText("Start Editing");

        expect(editIcon).toBeInTheDocument();
        expect(startEditingText).toBeInTheDocument();
    });

    test("should update the href when clicked", () => {
        const { getByTestId } = render(<StartEditingButtonComponent />);
        const button = getByTestId("vcms-start-editing-btn");
        fireEvent.click(button);

        expect(button?.getAttribute("href")).toBe(
            "https://app.contentstack.com/live-editor/stack//environment/?branch=main&target-url=http%3A%2F%2Flocalhost%2F&locale=en-us"
        );
    });
});
