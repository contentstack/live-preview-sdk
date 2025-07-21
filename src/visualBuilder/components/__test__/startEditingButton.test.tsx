import { render, fireEvent, screen } from "@testing-library/preact";
import StartEditingButtonComponent, {
    getEditButtonPosition,
} from "../startEditingButton";
import Config from "../../../configManager/configManager";
import { asyncRender } from "../../../__test__/utils";

describe("StartEditingButtonComponent", () => {
    let visualBuilderContainer: HTMLDivElement;

    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
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
        const { getByTestId } = await asyncRender(
            <StartEditingButtonComponent />
        );
        const button = getByTestId("vcms-start-editing-btn");

        expect(button?.getAttribute("href")).toBe(
            "https://app.contentstack.com/#!/stack/bltapikey/visual-builder?target-url=http%3A%2F%2Flocalhost%3A3000&branch=main&environment=bltenvironment&locale=en-us"
        );
    });

    test("should not render when enable is false", async () => {
        Config.set("editInVisualBuilderButton.enable", false);
        const { container } = await asyncRender(
            <StartEditingButtonComponent />
        );
        expect(container).toBeEmptyDOMElement();
    });

    test("should render when enable is true", async () => {
        Config.set("editInVisualBuilderButton.enable", true);
        const { getByTestId } = await asyncRender(
            <StartEditingButtonComponent />
        );
        const button = getByTestId("vcms-start-editing-btn");
        expect(button).toBeInTheDocument();
    });

    test.each(["bottom-right", "bottom-left", "top-left", "top-right"])(
        "should return valid position %s",
        (position) => {
            expect(getEditButtonPosition(position)).toBe(position);
        }
    );

    test.each([
        "invalid-position",
        "center",
        "",
        undefined,
        null,
        123,
        {},
        [],
        false,
    ])(
        "should return bottom-right for invalid input: %s",
        (invalidPosition) => {
            expect(getEditButtonPosition(invalidPosition)).toBe("bottom-right");
        }
    );

    test("should render with default values when editInVisualBuilderButton config is missing", async () => {
        Config.reset();
        Config.set("stackDetails.apiKey", "bltapikey");
        Config.set("stackDetails.environment", "bltenvironment");

        const { getByTestId } = await asyncRender(
            <StartEditingButtonComponent />
        );
        const button = getByTestId("vcms-start-editing-btn");

        expect(Config.get().editInVisualBuilderButton.position).toBe(
            "bottom-right"
        );
        expect(button).toBeInTheDocument();
    });

    test("should update href with current URL when mouse enters button", async () => {
        Object.defineProperty(window, "location", {
            value: new URL("http://localhost:3000"),
        });

        const { getByTestId } = await asyncRender(
            <StartEditingButtonComponent />
        );
        const button = getByTestId("vcms-start-editing-btn");
        const initialHref = button.getAttribute("href");

        Object.defineProperty(window, "location", {
            value: new URL("http://localhost:3000/about"),
            writable: true,
        });

        fireEvent.mouseEnter(button);

        const updatedHref = button.getAttribute("href");
        expect(updatedHref).not.toBe(initialHref);
        expect(updatedHref).toContain(
            encodeURIComponent("http://localhost:3000/about")
        );
    });

    test("should update href with current URL when button is focused", async () => {
        Object.defineProperty(window, "location", {
            value: new URL("http://localhost:3000"),
        });

        const { getByTestId } = await asyncRender(
            <StartEditingButtonComponent />
        );
        const button = getByTestId("vcms-start-editing-btn");
        const initialHref = button.getAttribute("href");

        Object.defineProperty(window, "location", {
            value: new URL("http://localhost:3000/contact"),
            writable: true,
        });

        fireEvent.focus(button);

        const updatedHref = button.getAttribute("href");
        expect(updatedHref).not.toBe(initialHref);
        expect(updatedHref).toContain(
            encodeURIComponent("http://localhost:3000/contact")
        );
    });
});
