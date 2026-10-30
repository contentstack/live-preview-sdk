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

    test("is as wide as the side form in Visual Editor's framed editor", () => {
        dockPanel(PANEL_URL);

        // Visual Editor's DEFAULT_SIDEBAR_WIDTH: a 72px tab rail and 400px of form.
        expect(panels()[0].style.width).toBe("472px");
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
