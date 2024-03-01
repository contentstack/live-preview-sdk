import getStyleOfAnElement from "../getStyleOfAnElement";

describe("getStyleOfAnElement", () => {
    test("it should return the style of an element", () => {
        const elem = document.createElement("div");

        elem.style.width = "100px";

        const style = getStyleOfAnElement(elem);
        expect(style).toEqual({
            display: "block",
            visibility: "visible",
            width: "100px",
        });
    });

    test("it should not return filtered styles", () => {
        const elem = document.createElement("div");

        elem.style.width = "100px";
        elem.style.position = "absolute";
        elem.style.left = "10px";
        elem.style.top = "10px";
        elem.style.right = "10px";
        elem.style.bottom = "10px";
        elem.style.textOverflow = "ellipsis";
        elem.style.marginBlockEnd = "10px";
        elem.style.marginBlockStart = "10px";
        elem.style.marginInlineEnd = "10px";
        elem.style.marginInlineStart = "10px";
        elem.style.marginLeft = "10px";
        elem.style.marginRight = "10px";
        elem.style.marginTop = "10px";
        elem.style.marginBottom = "10px";

        const style = getStyleOfAnElement(elem);
        expect(style).toEqual({
            display: "block",
            visibility: "visible",
            width: "100px",
        });
    });
});
