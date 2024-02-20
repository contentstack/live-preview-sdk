import { hasWindow } from "../index";

describe("hasWindow() function", () => {
    test("must check if window is available", () => {
        expect(hasWindow()).toBe(typeof window !== "undefined");
    });
});
