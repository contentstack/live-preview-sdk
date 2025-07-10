import { describe, it, expect, vi, Mock } from "vitest";
import { getPsuedoEditableElementStyles } from "../getPsuedoEditableStylesElement";
import getCamelCaseStyles from "../getCamelCaseStyles";
import getStyleOfAnElement from "../getStyleOfAnElement";
import { getPsuedoEditableEssentialStyles } from "../getPsuedoEditableEssentialStyles";

vi.mock("../getCamelCaseStyles");
vi.mock("../getStyleOfAnElement");
vi.mock("../getPsuedoEditableEssentialStyles");

describe("getPsuedoEditableElementStyles", () => {
    it("should return merged styles from getStyleOfAnElement and getPsuedoEditableEssentialStyles", () => {
        const mockElement = {
            getBoundingClientRect: vi.fn().mockReturnValue({
                top: 100,
                left: 200,
                height: 50,
            }),
        } as unknown as HTMLElement;

        const mockStyles = {
            color: "red",
            "font-size": "16px",
        };

        const mockEssentialStyles = {
            position: "absolute",
            top: "150px",
            left: "230px",
            height: "auto",
            "white-space": "normal",
            "text-transform": "none",
            "text-overflow": "visible",
            "text-wrap-mode": "wrap",
            "min-height": "50px",
        };

        (getStyleOfAnElement as Mock).mockReturnValue(mockStyles);
        (getPsuedoEditableEssentialStyles as Mock).mockReturnValue(
            mockEssentialStyles
        );

        const result = getPsuedoEditableElementStyles(mockElement);

        expect(getPsuedoEditableEssentialStyles).toHaveBeenCalledWith({
            rect: { top: 100, left: 200, height: 50 },
            camelCase: undefined,
        });

        expect(result).toEqual({
            color: "red",
            "font-size": "16px",
            position: "absolute",
            top: "150px",
            left: "230px",
            height: "auto",
            "white-space": "normal",
            "text-transform": "none",
            "text-overflow": "visible",
            "text-wrap-mode": "wrap",
            "min-height": "50px",
        });
    });

    it("should apply camelCase conversion when camelCase is true", () => {
        const mockElement = {
            getBoundingClientRect: vi.fn().mockReturnValue({
                top: 100,
                left: 200,
                height: 50,
            }),
        } as unknown as HTMLElement;

        const mockStyles = {
            color: "red",
            "font-size": "16px",
        };

        const mockCamelCaseStyles = {
            color: "red",
            fontSize: "16px",
        };

        const mockEssentialStyles = {
            position: "absolute",
            top: "150px",
            left: "230px",
            height: "auto",
            whiteSpace: "normal",
            textTransform: "none",
            textOverflow: "visible",
            textWrapMode: "wrap",
            minHeight: "50px",
        };

        (getStyleOfAnElement as Mock).mockReturnValue(mockStyles);
        (getCamelCaseStyles as Mock).mockReturnValue(mockCamelCaseStyles);
        (getPsuedoEditableEssentialStyles as Mock).mockReturnValue(
            mockEssentialStyles
        );

        const result = getPsuedoEditableElementStyles(mockElement, true);

        expect(getCamelCaseStyles).toHaveBeenCalledWith(mockStyles);
        expect(getPsuedoEditableEssentialStyles).toHaveBeenCalledWith({
            rect: { top: 100, left: 200, height: 50 },
            camelCase: true,
        });

        expect(result).toEqual({
            color: "red",
            fontSize: "16px",
            position: "absolute",
            top: "150px",
            left: "230px",
            height: "auto",
            whiteSpace: "normal",
            textTransform: "none",
            textOverflow: "visible",
            textWrapMode: "wrap",
            minHeight: "50px",
        });
    });

    it("should handle merging where essential styles override element styles", () => {
        const mockElement = {
            getBoundingClientRect: vi.fn().mockReturnValue({
                top: 100,
                left: 200,
                height: 50,
            }),
        } as unknown as HTMLElement;

        const mockStyles = {
            color: "red",
            position: "relative", // This should be overridden by essential styles
            height: "100px", // This should be overridden by essential styles
        };

        const mockEssentialStyles = {
            position: "absolute",
            top: "150px",
            left: "230px",
            height: "auto",
            "min-height": "50px",
        };

        (getStyleOfAnElement as Mock).mockReturnValue(mockStyles);
        (getPsuedoEditableEssentialStyles as Mock).mockReturnValue(
            mockEssentialStyles
        );

        const result = getPsuedoEditableElementStyles(mockElement);

        expect(result).toEqual({
            color: "red",
            position: "absolute", // Overridden by essential styles
            top: "150px",
            left: "230px",
            height: "auto", // Overridden by essential styles
            "min-height": "50px",
        });
    });
});
