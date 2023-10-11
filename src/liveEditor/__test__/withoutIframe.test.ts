import crypto from "crypto";

import { sleep } from "../../__test__/utils";
import { IConfig } from "../../types/types";
import { getDefaultConfig } from "../../utils/defaults";
import { VisualEditor } from "../index";

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
    },
});

describe("When outside the Visual editor, the Visual Editor", () => {
    const mockedConsoleError = jest
        .spyOn(console, "error")
        .mockImplementation((...args) => {
            if (
                args.at(-1) !==
                `contentstack-adv-post-message: No request listener found for event "init"`
            ) {
                console.error(...args);
            }
        });

    afterAll(() => {
        mockedConsoleError.mockRestore();
    });
    test("should have the start editing button", () => {
        const config: IConfig = getDefaultConfig();
        new VisualEditor(config);
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

        const config: IConfig = getDefaultConfig();

        new VisualEditor(config);

        await sleep(0);
        h1.click();

        expect(h1).toMatchSnapshot();
        expect(h1.getAttribute("contenteditable")).toBe(null);
    });
});
