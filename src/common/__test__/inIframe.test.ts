import { inIframe, isOpeningInNewTab } from "../inIframe";
import { hasWindow } from "../../utils";

vi.mock("../../utils", () => ({ hasWindow: vi.fn() }));

describe("inIframe", () => {
    let windowSpy: any;

    beforeEach(() => {
        windowSpy = vi.spyOn(window, "window", "get");
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
        windowSpy.mockImplementation(() => {
            throw new Error("Test error");
        });

        expect(inIframe()).toBe(true);
    });
});

describe("isOpeningInNewTab", () => {
    let windowSpy: any;

    beforeEach(() => {
        vi.mocked(hasWindow).mockReturnValue(true);
        windowSpy = vi.spyOn(window, "window", "get");
    });

    afterEach(() => {
        windowSpy.mockRestore();
        vi.mocked(hasWindow).mockReset();
    });

    test("should return true when window.opener is truthy", () => {
        windowSpy.mockReturnValue({ opener: {} });
        expect(isOpeningInNewTab()).toBe(true);
    });

    test("should return false when window.opener is null", () => {
        windowSpy.mockReturnValue({ opener: null });
        expect(isOpeningInNewTab()).toBe(false);
    });

    test("should return false when hasWindow returns false", () => {
        vi.mocked(hasWindow).mockReturnValue(false);
        expect(isOpeningInNewTab()).toBe(false);
    });

    test("should return false when accessing window throws", () => {
        windowSpy.mockImplementation(() => {
            throw new Error("Test error");
        });
        expect(isOpeningInNewTab()).toBe(false);
    });
});
