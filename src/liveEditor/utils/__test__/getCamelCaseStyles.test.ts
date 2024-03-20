import getCamelCaseStyles from "./../getCamelCaseStyles";

describe("getCamelCaseStyles", () => {
    test("returns an empty object when provided with an empty object", () => {
        const styles = {};
        const result = getCamelCaseStyles(styles);
        expect(result).toEqual({});
    });

    test("converts kebab-case styles to camelCase", () => {
        const styles = {
            "font-size": "16px",
            "margin-top": "10px",
        };
        const result = getCamelCaseStyles(styles);
        expect(result).toEqual({
            fontSize: "16px",
            marginTop: "10px",
        });
    });

    test("leaves camelCase styles unchanged", () => {
        const styles = {
            fontSize: "16px",
            marginTop: "10px",
        };
        const result = getCamelCaseStyles(styles);
        expect(result).toEqual(styles);
    });

    test("converts PascalCase styles to camelCase", () => {
        const styles = {
            FontSize: "16px",
            MarginTop: "10px",
        };
        const result = getCamelCaseStyles(styles);
        expect(result).toEqual({
            fontSize: "16px",
            marginTop: "10px",
        });
    });

    test("handles mixed-case styles", () => {
        const styles = {
            FontSize: "16px",
            "margin-top": "10px",
            Color: "red",
        };
        const result = getCamelCaseStyles(styles);
        expect(result).toEqual({
            fontSize: "16px",
            marginTop: "10px",
            color: "red",
        });
    });

    test("handles numeric keys", () => {
        const styles = {
            "123": "value",
            width: "100px",
        };
        const result = getCamelCaseStyles(styles);
        expect(result).toEqual({
            "123": "value",
            width: "100px",
        });
    });
});
