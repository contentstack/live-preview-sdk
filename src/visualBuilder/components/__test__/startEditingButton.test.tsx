import { render, fireEvent, screen } from "@testing-library/preact";
import StartEditingButtonComponent, { getEditButtonPosition } from "../startEditingButton";
import Config from "../../../configManager/configManager";
import { asyncRender } from "../../../__test__/utils";

describe("StartEditingButtonComponent", () => {
    let visualBuilderContainer: HTMLDivElement;

    beforeEach(() => {
        document.getElementsByTagName('html')[0].innerHTML = ''; 
        Config.reset();
        Config.set("stackDetails.apiKey", "bltapikey");
        Config.set("stackDetails.environment", "bltenvironment");

        visualBuilderContainer = document.createElement("div");
        document.body.appendChild(visualBuilderContainer);
    });

    afterEach(() => {
        vi.clearAllMocks();
        document.body.removeChild(visualBuilderContainer);
    });

    afterAll(() => {
        Config.reset();
    });

    test("renders correctly with EditIcon and Start Editing text", async () => {
        const { getByText, getByTestId } = await asyncRender(
            <StartEditingButtonComponent />
        );

        const editIcon = getByTestId("visual-builder__edit-icon");
        const startEditingText = getByText("Start Editing");

        expect(editIcon).toBeInTheDocument();
        expect(startEditingText).toBeInTheDocument();
    });

    test("should update the href when clicked", async () => {
        const { getByTestId } = await asyncRender(<StartEditingButtonComponent />);
        const button = getByTestId("vcms-start-editing-btn");

        expect(button?.getAttribute("href")).toBe(
            "https://app.contentstack.com/#!/stack/bltapikey/visual-builder?branch=main&environment=bltenvironment&target-url=http%3A%2F%2Flocalhost%3A3000%2F&locale=en-us"
        );
    });

    test("should not render when enable is false", async () => {
        Config.set("editButtonBuilder.enable", false);
        const { container } = await asyncRender(<StartEditingButtonComponent />);
        expect(container).toBeEmptyDOMElement();
    });

    test("should render when enable is true", async () => {
        Config.set("editButtonBuilder.enable", true);
        const { getByTestId } = await asyncRender(<StartEditingButtonComponent />);
        const button = getByTestId("vcms-start-editing-btn");
        expect(button).toBeInTheDocument();
    });

    test.each([
        'bottom-right',
        'bottom-left',
        'top-left',
        'top-right'
    ])('should return valid position %s', (position) => {
        expect(getEditButtonPosition(position)).toBe(position);
    });

    test.each([
        'invalid-position',
        'center',
        '',
        undefined,
        null,
        123,
        {},
        [],
        false,
    ])('should return bottom-right for invalid input: %s', (invalidPosition) => {
        expect(getEditButtonPosition(invalidPosition)).toBe('bottom-right');
    });
    
    test("should render with default values when editButtonBuilder config is missing", async () => {
        Config.reset();
        Config.set("stackDetails.apiKey", "bltapikey");
        Config.set("stackDetails.environment", "bltenvironment");

        const { getByTestId } = await asyncRender(<StartEditingButtonComponent />);
        const button = getByTestId("vcms-start-editing-btn");
        
        expect(Config.get().editButtonBuilder.position).toBe("bottom-right")
        expect(button).toBeInTheDocument();
    });
});
