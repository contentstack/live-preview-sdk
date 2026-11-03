import { dockPanel } from "../dock";
import { dockStyles } from "../dock.style";

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
        expect(
            panel.classList.contains(dockStyles()["visual-builder__panel"])
        ).toBe(true);
        const rules = [...document.querySelectorAll("style#_goober")]
            .map((style) => style.textContent)
            .join("")
            .replace(/\s/g, "");
        expect(rules).toContain("position:fixed");
        expect(rules).toContain("right:0");
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

    describe("the page's builder treats the dock as off the page", () => {
        const handle = () =>
            document.querySelector(".visual-builder__panel-resize-handle")!;
        const pageEvents = () => {
            const seen: string[] = [];
            const root = document.documentElement;
            const log = (e: Event) => e.target === root && seen.push(e.type);
            root.addEventListener("mouseleave", log);
            root.addEventListener("mouseenter", log);
            return seen;
        };
        const moveOver = (target: Element) =>
            target.dispatchEvent(
                new MouseEvent("mousemove", { bubbles: true })
            );
        /** The page gets no events over the panel's frame, so the panel reports it. */
        const panelSays = (source: Window | null = panels()[0].contentWindow) =>
            window.dispatchEvent(
                new MessageEvent("message", {
                    data: {
                        source: "cs-builder-panel",
                        type: "pointer-over-panel",
                    },
                    source,
                })
            );

        test("hides the page's cursor and outlines when the panel says the pointer is over it", () => {
            dockPanel(PANEL_URL);
            const seen = pageEvents();

            panelSays();

            expect(seen).toEqual(["mouseleave"]);
        });

        test("ignores that from any window but the panel", () => {
            dockPanel(PANEL_URL);
            const seen = pageEvents();

            panelSays(window);

            expect(seen).toEqual([]);
        });

        test("hides them from the resize handle on, which reaches over the page's edge", () => {
            dockPanel(PANEL_URL);
            const seen = pageEvents();

            moveOver(handle());

            expect(seen).toEqual(["mouseleave"]);
        });

        test("brings them back on the next move over the page", () => {
            dockPanel(PANEL_URL);
            const seen = pageEvents();
            panelSays();

            moveOver(document.body);

            expect(seen).toEqual(["mouseleave", "mouseenter"]);
        });

        test("leaves moves within the page alone", () => {
            dockPanel(PANEL_URL);
            const seen = pageEvents();

            moveOver(document.body);
            moveOver(document.body);

            expect(seen).toEqual([]);
        });
    });
});
