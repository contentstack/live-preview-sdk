import { describe, it, expect, vi } from "vitest";
import { getPsuedoEditableElementStyles } from "../getPsuedoEditableStylesElement";
import getCamelCaseStyles from "../getCamelCaseStyles";
import getStyleOfAnElement from "../getStyleOfAnElement";

vi.mock("../getCamelCaseStyles");
vi.mock("../getStyleOfAnElement");

describe("getPsuedoEditableElementStyles", () => {
    it("should return styles with absolute position and correct top and left values", () => {
        const mockElement = {
            getBoundingClientRect: vi.fn().mockReturnValue({
                top: 100,
                left: 200,
            }),
        } as unknown as HTMLElement;

        window.scrollY = 50;
        window.scrollX = 30;

        const mockStyles = {
            color: "red",
            fontSize: "16px",
        };

        (getStyleOfAnElement as vi.Mock).mockReturnValue(mockStyles);

        const result = getPsuedoEditableElementStyles(mockElement);

        expect(result).toEqual({
            color: "red",
            fontSize: "16px",
            position: "absolute",
            top: "150px",
            left: "230px",
            height: "auto",
            whiteSpace: "pre-line",
            textTransform: "none",
        });
    });

    it("should return camel case styles if camelCase is true", () => {
        const mockElement = {
            getBoundingClientRect: vi.fn().mockReturnValue({
                top: 100,
                left: 200,
            }),
        } as unknown as HTMLElement;

        window.scrollY = 50;
        window.scrollX = 30;

        const mockStyles = {
            color: "red",
            fontSize: "16px",
        };

        const mockCamelCaseStyles = {
            color: "red",
            fontSize: "16px",
        };

        (getStyleOfAnElement as vi.Mock).mockReturnValue(mockStyles);
        (getCamelCaseStyles as vi.Mock).mockReturnValue(mockCamelCaseStyles);

        const result = getPsuedoEditableElementStyles(mockElement, true);

        expect(result).toEqual({
            color: "red",
            fontSize: "16px",
            position: "absolute",
            top: "150px",
            left: "230px",
            height: "auto",
            whiteSpace: "pre-line",
            textTransform: "none",
        });
    });
});