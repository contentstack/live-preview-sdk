import { fireEvent } from "@testing-library/preact";
import StartEditingButtonComponent from "../startEditingButton";
import Config from "../../../configManager/configManager";
import { asyncRender } from "../../../__test__/utils";

// Start Editing opens Visual Editor in a new tab, which becomes the relay a
// docked panel needs. The link stays the fallback when the window is refused.
describe("StartEditingButtonComponent in a new tab", () => {
    beforeEach(() => {
        Config.reset();
        Config.set("stackDetails.apiKey", "bltapikey");
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = "";
    });

    test("opens Visual Editor in the relay tab instead of leaving the page", async () => {
        const open = vi
            .spyOn(window, "open")
            .mockReturnValue({ postMessage: vi.fn() } as unknown as Window);
        const { getByTestId } = await asyncRender(
            <StartEditingButtonComponent />
        );
        const button = getByTestId("vcms-start-editing-btn");

        const notPrevented = fireEvent.click(button);

        expect(open).toHaveBeenCalledWith(
            button.getAttribute("href"),
            expect.stringContaining("csBuilderRelay:bltapikey:")
        );
        expect(notPrevented).toBe(false);
    });

    test("follows the link as before when the window is refused", async () => {
        vi.spyOn(window, "open").mockReturnValue(null);
        const { getByTestId } = await asyncRender(
            <StartEditingButtonComponent />
        );

        const notPrevented = fireEvent.click(
            getByTestId("vcms-start-editing-btn")
        );

        expect(notPrevented).toBe(true);
    });
});
