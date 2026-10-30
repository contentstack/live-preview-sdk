import { dockPanel } from "../dock";

const PANEL_URL = "https://visual-builder.contentstack.com/panel/index.html";
const panels = () =>
    document.querySelectorAll<HTMLIFrameElement>(
        "iframe.visual-builder__panel"
    );

describe("dockPanel", () => {
    afterEach(() => {
        document.body.innerHTML = "";
        document.documentElement.style.marginRight = "";
    });

    test("docks the panel iframe on the right of the page", () => {
        dockPanel(PANEL_URL);

        const [panel] = panels();
        expect(panel.src).toBe(PANEL_URL);
        expect(panel.title).toBeTruthy();
        expect(panel.style.position).toBe("fixed");
        expect(panel.style.right).toBe("0px");
    });

    test("pushes the page aside by the panel's width instead of covering it", () => {
        dockPanel(PANEL_URL);

        expect(document.documentElement.style.marginRight).toBe(
            panels()[0].style.width
        );
    });

    test("docks only once", () => {
        dockPanel(PANEL_URL);
        dockPanel(PANEL_URL);

        expect(panels()).toHaveLength(1);
    });
});
