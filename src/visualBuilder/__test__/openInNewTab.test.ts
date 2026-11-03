import crypto from "crypto";
import { waitFor } from "@testing-library/preact";
import { VisualBuilder } from "../index";
import Config from "../../configManager/configManager";
import { askRelay } from "../panel/relayHello";
import { connectPanel } from "../panel/connect";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import livePreviewPostMessage from "../../livePreview/eventManager/livePreviewEventManager";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

// Outside an iframe nothing answers the first init: the path that shows Start Editing today.
// Once docked, the panel answers the next one.
let initAnswer: () => Promise<unknown> = () => Promise.reject();
vi.mock("../utils/visualBuilderPostMessage", () => ({
    __esModule: true,
    default: {
        send: vi.fn((eventName: string) =>
            eventName === "init" ? initAnswer() : Promise.resolve()
        ),
        on: vi.fn(),
        updateConfig: vi.fn(),
    },
}));
vi.mock("../../livePreview/eventManager/livePreviewEventManager", () => ({
    __esModule: true,
    default: {
        send: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        updateConfig: vi.fn(),
    },
}));
vi.mock("../panel/relayHello", () => ({ askRelay: vi.fn() }));
vi.mock("../panel/connect", () => ({ connectPanel: vi.fn() }));

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

const PANEL_URL = "https://visual-builder.contentstack.com/panel/index.html";
const startEditing = () =>
    document.querySelector('[data-testid="vcms-start-editing-btn"]');
const panel = () =>
    document.querySelector<HTMLIFrameElement>("iframe.visual-builder__panel");
const PANEL_ORIGIN = new URL(PANEL_URL).origin;

/** The panel saying its canvas host listens for init. */
const canvasReady = ({
    source = panel()!.contentWindow as Window | null,
    origin = PANEL_ORIGIN,
} = {}) =>
    window.dispatchEvent(
        new MessageEvent("message", {
            data: { source: "cs-builder-panel", type: "canvas-ready" },
            origin,
            source,
        })
    );
const initCalls = () =>
    vi
        .mocked(visualBuilderPostMessage!.send)
        .mock.calls.filter(([event]) => event === "init").length;

describe("Open in New Tab on the site", () => {
    beforeAll(() => Config.set("mode", 2));
    afterAll(() => Config.reset());
    afterEach(() => {
        document.body.innerHTML = "";
        document.documentElement.style.marginRight = "";
        initAnswer = () => Promise.reject();
        vi.clearAllMocks();
        Config.set("windowType", "independent");
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

    test("starts connecting the panel it docked", async () => {
        vi.mocked(askRelay).mockResolvedValue(PANEL_URL);

        new VisualBuilder();

        await waitFor(() => expect(connectPanel).toHaveBeenCalledWith(panel()));
    });

    test("connects nothing when it shows Start Editing", async () => {
        vi.mocked(askRelay).mockResolvedValue(null);
        vi.mocked(connectPanel).mockClear();

        new VisualBuilder();

        await waitFor(() => expect(startEditing()).toBeTruthy());
        expect(connectPanel).not.toHaveBeenCalled();
    });

    describe("once the panel's canvas is ready", () => {
        const docked = async () => {
            vi.mocked(askRelay).mockResolvedValue(PANEL_URL);
            new VisualBuilder();
            await waitFor(() => expect(panel()).toBeTruthy());
            initAnswer = () =>
                Promise.resolve({
                    windowType: "builder",
                    stackDetails: { masterLocale: "en-us" },
                });
        };

        test("sends the builder and Live Preview channels to the panel, pinned to its origin", async () => {
            await docked();

            canvasReady();

            const to = {
                target: panel()!.contentWindow,
                targetOrigin: PANEL_ORIGIN,
            };
            await waitFor(() =>
                expect(
                    visualBuilderPostMessage!.updateConfig
                ).toHaveBeenCalledWith(to)
            );
            expect(livePreviewPostMessage!.updateConfig).toHaveBeenCalledWith(
                to
            );
        });

        test("introduces the page to the panel with init, and the panel's builder takes over", async () => {
            await docked();
            expect(initCalls()).toBe(1);

            canvasReady();

            await waitFor(() =>
                expect(Config.get().windowType).toBe("builder")
            );
            expect(initCalls()).toBe(2);
        });

        test("ignores canvas-ready from another window", async () => {
            await docked();

            canvasReady({ source: window });
            await new Promise((r) => setTimeout(r, 20));

            expect(
                visualBuilderPostMessage!.updateConfig
            ).not.toHaveBeenCalled();
            expect(initCalls()).toBe(1);
        });

        test("ignores canvas-ready from another origin", async () => {
            await docked();

            canvasReady({ origin: "https://evil.example" });
            await new Promise((r) => setTimeout(r, 20));

            expect(
                visualBuilderPostMessage!.updateConfig
            ).not.toHaveBeenCalled();
        });

        test("re-introduces the page to a reloaded panel, but sets up the builder on the page once", async () => {
            await docked();
            canvasReady();
            await waitFor(() =>
                expect(Config.get().windowType).toBe("builder")
            );

            canvasReady();

            await waitFor(() => expect(initCalls()).toBe(3));
            const setups = vi
                .mocked(visualBuilderPostMessage!.on)
                .mock.calls.filter(
                    ([event]) =>
                        event ===
                        VisualBuilderPostMessageEvents.GET_ALL_ENTRIES_IN_CURRENT_PAGE
                );
            expect(setups).toHaveLength(1);
        });

        test("retries a missed init when the panel next says it is ready", async () => {
            await docked();
            const answer = initAnswer;
            initAnswer = () => Promise.reject();
            canvasReady();
            await waitFor(() => expect(initCalls()).toBe(2));
            initAnswer = answer;

            canvasReady();

            await waitFor(() =>
                expect(Config.get().windowType).toBe("builder")
            );
        });

        test("sends no second init while the panel has not answered the first", async () => {
            await docked();
            initAnswer = () => new Promise(() => {});

            canvasReady();
            canvasReady();
            await new Promise((r) => setTimeout(r, 20));

            expect(initCalls()).toBe(2);
        });

        test("does not fall back to Start Editing or dock again if the panel's init fails", async () => {
            await docked();
            initAnswer = () => Promise.reject();

            canvasReady();
            await waitFor(() => expect(initCalls()).toBe(2));
            await new Promise((r) => setTimeout(r, 20));

            expect(startEditing()).toBeNull();
            expect(
                document.querySelectorAll("iframe.visual-builder__panel")
            ).toHaveLength(1);
            expect(askRelay).toHaveBeenCalledTimes(1);
        });
    });
});
