import crypto from "crypto";
import { waitFor } from "@testing-library/preact";
import { VisualBuilder } from "../index";
import Config from "../../configManager/configManager";
import { askRelay } from "../panel/relayHello";

// Outside an iframe nothing answers init: the path that shows Start Editing today.
vi.mock("../utils/visualBuilderPostMessage", () => ({
    __esModule: true,
    default: {
        send: vi.fn((eventName: string) =>
            eventName === "init" ? Promise.reject() : Promise.resolve()
        ),
        on: vi.fn(),
    },
}));
vi.mock("../panel/relayHello", () => ({ askRelay: vi.fn() }));

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

const PANEL_URL = "https://visual-builder.contentstack.com/panel/index.html";
const startEditing = () =>
    document.querySelector('[data-testid="vcms-start-editing-btn"]');
const panel = () => document.querySelector("iframe.visual-builder__panel");

describe("Open in New Tab on the site", () => {
    beforeAll(() => Config.set("mode", 2));
    afterAll(() => Config.reset());
    afterEach(() => {
        document.body.innerHTML = "";
        document.documentElement.style.marginRight = "";
    });

    test("shows Start Editing as today when no relay answers", async () => {
        vi.mocked(askRelay).mockResolvedValue(null);

        new VisualBuilder();

        await waitFor(() => expect(startEditing()).toBeTruthy());
        expect(panel()).toBeNull();
    });

    test("docks the panel instead of Start Editing when the relay answers ready", async () => {
        vi.mocked(askRelay).mockResolvedValue(PANEL_URL);

        new VisualBuilder();

        await waitFor(() =>
            expect(panel()?.getAttribute("src")).toBe(PANEL_URL)
        );
        expect(startEditing()).toBeNull();
    });
});
