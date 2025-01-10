import crypto from "crypto";

import { triggerAndWaitForClickAction, waitForBuilderSDKToBeInitialized } from "../../__test__/utils";
import { VisualBuilder } from "../index";
import Config from "../../configManager/configManager";

vi.mock("../utils/visualBuilderPostMessage", async () => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("../../__test__/data/contentType")
    >("../../__test__/data/contentType");
    const contentTypes = getAllContentTypes();

    return {
        __esModule: true,
        default: {
            send: vi.fn().mockImplementation((eventName: string) => {
                if (eventName === "init")
                    return Promise.reject({
                        contentTypes,
                    });
                return Promise.resolve();
            }),
            on: vi.fn(),
        },
    };
});
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { act, fireEvent, waitFor, screen } from "@testing-library/preact";

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe("When outside the Visual Builder, the Visual Builder", () => {
    beforeAll(() => {
        Config.set("mode", 2);
    });
    afterAll(() => {
        Config.reset();
    });
    test("should have the start editing button", async () => {
        new VisualBuilder();

        await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);
        await waitFor(() => {
            const startEditingButton = document.querySelector(
                `[data-testid="vcms-start-editing-btn"]`
            );
            expect(startEditingButton).toBeTruthy();
        });
    });

    test("should not have clickable elements", async () => {
        const h1 = document.createElement("h1");

        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.single_line"
        );

        document.body.appendChild(h1);

        new VisualBuilder();

        await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);
        await act(async () => {
            await fireEvent.click(h1);
        });

        expect(h1.getAttribute("contenteditable")).toBe(null);
    });
});
