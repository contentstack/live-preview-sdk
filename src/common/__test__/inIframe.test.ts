import inIframe from "../inIframe";

describe("inIframe", () => {
    let windowSpy: any;

    beforeEach(() => {
        windowSpy = jest.spyOn(window, "window", "get");
    });

    afterEach(() => {
        windowSpy.mockRestore();
    });

    test("should return false if outside iframe", () => {
        windowSpy.mockImplementation(() => ({
            self: "test",
            top: "test",
        }));

        expect(inIframe()).toBe(false);
    });

    test("should return true if inside iframe", () => {
        windowSpy.mockImplementation(() => ({
            self: "test-self",
        }));
        windowSpy.mockImplementation(() => ({
            top: "test-top",
        }));

        expect(inIframe()).toBe(true);
    });

    test("should return true in case of any error", () => {
        windowSpy.mockImplementation(() => undefined);
        windowSpy.mockImplementation(() => ({
            top: "test-top",
        }));

        expect(inIframe()).toBe(true);
    });
});
