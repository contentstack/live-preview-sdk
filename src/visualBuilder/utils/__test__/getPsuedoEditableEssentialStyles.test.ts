import { getPsuedoEditableEssentialStyles } from "../getPsuedoEditableEssentialStyles";

describe("getPsuedoEditableEssentialStyles", () => {
    const mockRect: DOMRect = {
        top: 50,
        left: 30,
        width: 200,
        height: 100,
        bottom: 150,
        right: 230,
        x: 30,
        y: 50,
        toJSON: () => ({}),
    };

    const mockScrollX = 100;
    const mockScrollY = 200;

    beforeEach(() => {
        // Mock window.scrollX and window.scrollY using vitest spies
        vi.spyOn(window, "scrollX", "get").mockReturnValue(mockScrollX);
        vi.spyOn(window, "scrollY", "get").mockReturnValue(mockScrollY);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("returns styles with kebab-case properties when camelCase is false", () => {
        const result = getPsuedoEditableEssentialStyles({
            rect: mockRect,
            camelCase: false,
        });

        expect(result).toEqual({
            position: "absolute",
            top: `${mockRect.top + mockScrollY}px`,
            left: `${mockRect.left + mockScrollX}px`,
            height: "auto",
            "min-height": `${Math.abs(mockRect.height)}px`,
            "white-space": "normal",
            "text-transform": "none",
            "text-wrap-mode": "wrap",
            "text-overflow": "visible",
        });
    });

    test("returns styles with kebab-case properties when camelCase is undefined", () => {
        const result = getPsuedoEditableEssentialStyles({
            rect: mockRect,
            camelCase: undefined,
        });

        expect(result).toEqual({
            position: "absolute",
            top: `${mockRect.top + mockScrollY}px`,
            left: `${mockRect.left + mockScrollX}px`,
            height: "auto",
            "min-height": `${Math.abs(mockRect.height)}px`,
            "white-space": "normal",
            "text-transform": "none",
            "text-wrap-mode": "wrap",
            "text-overflow": "visible",
        });
    });

    test("returns styles with camelCase properties when camelCase is true", () => {
        const result = getPsuedoEditableEssentialStyles({
            rect: mockRect,
            camelCase: true,
        });

        expect(result).toEqual({
            position: "absolute",
            top: `${mockRect.top + mockScrollY}px`,
            left: `${mockRect.left + mockScrollX}px`,
            height: "auto",
            minHeight: `${Math.abs(mockRect.height)}px`,
            whiteSpace: "normal",
            textTransform: "none",
            textWrapMode: "wrap",
            textOverflow: "visible",
        });
    });

    test("calculates correct positioning with scroll offset", () => {
        const customScrollX = 50;
        const customScrollY = 150;

        // Override the default mock values for this test
        vi.spyOn(window, "scrollX", "get").mockReturnValue(customScrollX);
        vi.spyOn(window, "scrollY", "get").mockReturnValue(customScrollY);

        const result = getPsuedoEditableEssentialStyles({
            rect: mockRect,
            camelCase: false,
        });

        expect(result.top).toBe(`${mockRect.top + customScrollY}px`);
        expect(result.left).toBe(`${mockRect.left + customScrollX}px`);
    });

    test("handles negative rect heights correctly", () => {
        const negativeHeightRect: DOMRect = {
            ...mockRect,
            height: -50,
        };

        const result = getPsuedoEditableEssentialStyles({
            rect: negativeHeightRect,
            camelCase: false,
        });

        expect(result["min-height"]).toBe(
            `${Math.abs(negativeHeightRect.height)}px`
        );
    });
});
