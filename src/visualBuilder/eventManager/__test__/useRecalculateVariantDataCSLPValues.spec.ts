import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Identity debounce so the observer's request fires within the test.
vi.mock("lodash-es", async (importOriginal) => {
    const actual = await importOriginal<typeof import("lodash-es")>();
    return { ...actual, debounce: vi.fn((fn: any) => fn) };
});

vi.mock("../../../visualBuilder/utils/visualBuilderPostMessage", () => ({
    default: { on: vi.fn(), send: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("../../../visualBuilder", () => ({
    VisualBuilder: {
        VisualBuilderGlobalState: {
            value: { variant: null, highlightVariantFields: false },
        },
    },
}));

import { updateVariantClasses } from "../useRecalculateVariantDataCSLPValues";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import visualBuilderPostMessage from "../../../visualBuilder/utils/visualBuilderPostMessage";
import * as cslpdata from "../../../cslp/cslpdata";
import { PublicLogger } from "../../../logger/logger";

const send = (visualBuilderPostMessage as any).send;

// vitest.setup.ts swaps MutationObserver for a stub that drops the callback, so
// the real observer never fires here. Capture the callback and drive it instead.
let observerCallbacks: MutationCallback[] = [];
// Captured in beforeEach, not at module scope: vitest.setup.ts installs its
// stub in beforeAll, so a module-level read would grab jsdom's native one and
// afterEach would restore the wrong implementation.
let installedMutationObserver: typeof MutationObserver;

class CapturingMutationObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn((): MutationRecord[] => []);
    constructor(callback: MutationCallback) {
        observerCallbacks.push(callback);
    }
}

const attributeMutation = {
    type: "attributes",
    attributeName: "data-cslp",
    addedNodes: [] as unknown as NodeList,
} as unknown as MutationRecord;

describe("requestDiscussionHighlights via the CSLP mutation observer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        observerCallbacks = [];
        installedMutationObserver = global.MutationObserver;
        global.MutationObserver =
            CapturingMutationObserver as unknown as typeof MutationObserver;
        send.mockResolvedValue(undefined);
        vi.spyOn(cslpdata, "isValidCslp").mockReturnValue(true);
        document.body.innerHTML = `<p data-cslp="v2:ct.entry.en-us.title">hi</p>`;
    });

    afterEach(() => {
        global.MutationObserver = installedMutationObserver;
        document.body.innerHTML = "";
        vi.restoreAllMocks();
    });

    function fireMutation() {
        updateVariantClasses();
        expect(observerCallbacks).toHaveLength(1);
        observerCallbacks[0]([attributeMutation], {} as MutationObserver);
    }

    it("requests discussion highlights when a data-cslp attribute changes", () => {
        fireMutation();

        expect(send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.REQUEST_DISCUSSION_HIGHLIGHTS
        );
    });

    // The bug this guards: the Discussions panel is closed on most CSR page
    // loads, so this send rejects nearly every time. Left unhandled it reaches
    // the Next.js dev overlay.
    it("attaches a rejection handler to that send", async () => {
        const rejection = Promise.reject({
            code: "NO_REQUEST_LISTENER_FOUND",
            message: 'No request listener found for event "x"',
        });
        const catchSpy = vi.spyOn(rejection, "catch");
        const warn = vi.spyOn(PublicLogger, "warn").mockImplementation(() => {});
        send.mockReturnValue(rejection);

        fireMutation();
        await expect(rejection).rejects.toMatchObject({
            code: "NO_REQUEST_LISTENER_FOUND",
        });

        expect(catchSpy).toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
    });

    // postMessageErrors is not mocked here, so the real helper runs. This is
    // the case that ties the call site to it: a bare `.catch(() => {})` would
    // pass every assertion above but fail this one.
    it("warns through the helper when the send fails for another reason", async () => {
        // The shape the library's no-ack timeout rejects with: no code.
        const rejection = Promise.reject(
            "contentstack-adv-post-message: The ACK was not received"
        );
        const warn = vi.spyOn(PublicLogger, "warn").mockImplementation(() => {});
        send.mockReturnValue(rejection);

        fireMutation();
        await expect(rejection).rejects.toBe(
            "contentstack-adv-post-message: The ACK was not received"
        );

        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0][0]).toContain(
            VisualBuilderPostMessageEvents.REQUEST_DISCUSSION_HIGHLIGHTS
        );
        expect(warn.mock.calls[0][1]).toBe(
            "contentstack-adv-post-message: The ACK was not received"
        );
    });
});
