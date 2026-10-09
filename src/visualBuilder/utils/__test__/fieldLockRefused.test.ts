import { VisualBuilder } from "../..";
import { isFieldLockRefused, isFieldStillSelected } from "../fieldLockRefused";

describe("isFieldLockRefused", () => {
    test.each([
        [{ fieldLockRefused: true }, true],
        [{ fieldLockRefused: false }, false],
        [{}, false],
        [undefined, false],
        [null, false],
    ])("reads %o as %s", (response, expected) => {
        expect(isFieldLockRefused(response)).toBe(expected);
    });
});

describe("isFieldStillSelected", () => {
    afterEach(() => {
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            null;
    });

    test("matches the selected element by cslp", () => {
        const element = document.createElement("div");
        element.setAttribute("data-cslp", "page.entry.en-us.banner");
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            element;

        expect(isFieldStillSelected("page.entry.en-us.banner")).toBe(true);
        expect(isFieldStillSelected("page.entry.en-us.title")).toBe(false);
    });

    test("is false when nothing is selected", () => {
        expect(isFieldStillSelected("page.entry.en-us.banner")).toBe(false);
    });
});
