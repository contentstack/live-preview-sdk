import { getAllContentTypes } from "../../__test__/data/contentType";
import { waitForBuilderSDKToBeInitialized } from "../../__test__/utils";
import Config from "../../configManager/configManager";
import { VisualBuilder } from "../index";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { Mock } from "vitest";

vi.mock("../utils/visualBuilderPostMessage", () => ({
    __esModule: true,
    default: {
        send: vi.fn((eventName: string) =>
            Promise.resolve(
                eventName === "init"
                    ? { contentTypes: getAllContentTypes() }
                    : {}
            )
        ),
        on: vi.fn(() => ({ unregister: vi.fn() })),
    },
}));

vi.mock("../../utils/index.ts", async () => ({
    __esModule: true,
    ...(await vi.importActual("../../utils")),
    isOpenInBuilder: vi.fn().mockReturnValue(true),
}));

// Lives apart from index.test.ts: its click test leaves the document in a
// state where appending any `data-cslp` element stalls for 15 s.
describe("entries-in-current-page-changed", () => {
    const CSLP = "page.blt0f6a4e1c9d2b7a53.fr-fr.title";
    const ENTRY = {
        entryUid: "blt0f6a4e1c9d2b7a53",
        contentTypeUid: "page",
        locale: "fr-fr",
    };
    const EVENT =
        VisualBuilderPostMessageEvents.ENTRIES_IN_CURRENT_PAGE_CHANGED;
    const send = visualBuilderPostMessage.send as Mock;
    const entrySends = () =>
        send.mock.calls.filter(([event]) => event === EVENT);
    // The body observer is debounced at 100 ms.
    const afterDebounce = () => new Promise((r) => setTimeout(r, 300));

    // The global MutationObserver is a stub, so the body observer's callback
    // is captured while the builder constructs and fired by hand.
    let bodyMutation: () => void = () => {};
    const createBuilder = () => {
        const Stub = global.MutationObserver;
        global.MutationObserver = class {
            constructor(private callback: MutationCallback) {}
            observe = vi.fn((_: Node, options?: MutationObserverInit) => {
                if (options?.attributeFilter?.includes("data-cslp")) {
                    bodyMutation = () =>
                        this.callback([], this as unknown as MutationObserver);
                }
            });
            disconnect = vi.fn();
            takeRecords = vi.fn(() => []);
        } as unknown as typeof MutationObserver;
        try {
            return new VisualBuilder();
        } finally {
            global.MutationObserver = Stub;
        }
    };

    beforeAll(() => Config.set("mode", 2));
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });

    test("sends again when an entry joins the page, not on unrelated mutations", async () => {
        const x = createBuilder();
        await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);
        expect(entrySends()).toHaveLength(1);

        const h1 = document.createElement("h1");
        h1.setAttribute("data-cslp", CSLP);
        document.body.appendChild(h1);
        bodyMutation();
        await afterDebounce();
        expect(entrySends()).toHaveLength(2);
        expect(entrySends()[1][1]).toEqual({ entriesInCurrentPage: [ENTRY] });

        document.body.appendChild(document.createElement("div"));
        bodyMutation();
        await afterDebounce();
        expect(entrySends()).toHaveLength(2);

        x.destroy();
    });

    test("resends a set the editor did not receive", async () => {
        const original = send.getMockImplementation()!;
        send.mockImplementation((event: string, ...rest: unknown[]) =>
            event === EVENT
                ? Promise.reject({ code: "NO_REQUEST_LISTENER_FOUND" })
                : original(event, ...rest)
        );
        const x = createBuilder();
        await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);
        expect(entrySends()).toHaveLength(1);
        send.mockImplementation(original);

        bodyMutation();
        await afterDebounce();
        expect(entrySends()).toHaveLength(2);
        expect(entrySends()[1][1]).toEqual({ entriesInCurrentPage: [] });

        x.destroy();
    });

    test("destroy() drops a pending observer pass", async () => {
        const x = createBuilder();
        await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);
        expect(entrySends()).toHaveLength(1);

        const h1 = document.createElement("h1");
        h1.setAttribute("data-cslp", CSLP);
        document.body.appendChild(h1);
        bodyMutation();
        x.destroy();
        await afterDebounce();
        expect(entrySends()).toHaveLength(1);
    });
});
