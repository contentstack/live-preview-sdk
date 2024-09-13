import crypto from "crypto";

import { sleep } from "../../__test__/utils";
import { VisualBuilder } from "../index";
import Config from "../../configManager/configManager";

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

        await sleep(100);

        const startEditingButton = document.querySelector(
            `[data-testid="vcms-start-editing-btn"]`
        );
        expect(startEditingButton).toBeTruthy();
    });

    test("should not have clickable elements", async () => {
        const h1 = document.createElement("h1");

        h1.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.single_line"
        );

        document.body.appendChild(h1);

        new VisualBuilder();

        await sleep(0);
        h1.click();

        expect(h1).toMatchSnapshot();
        expect(h1.getAttribute("contenteditable")).toBe(null);
    });
});
