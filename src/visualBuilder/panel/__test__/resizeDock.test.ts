import { dockPanel } from "../dock";
import { dockStyles } from "../dock.style";

const PANEL_URL = "https://visual-builder.contentstack.com/panel/index.html";
const WIDTH_KEY = "cs-builder-panel-width";
const DRAGGING = "visual-builder__panel-resize-handle--dragging";

const panel = () =>
    document.querySelector<HTMLIFrameElement>("iframe.visual-builder__panel")!;
const handle = () =>
    document.querySelector<HTMLElement>(
        ".visual-builder__panel-resize-handle"
    )!;
const grip = () =>
    handle().querySelector<HTMLElement>(".visual-builder__panel-resize-grip")!;
const pageMargin = () => document.documentElement.style.marginRight;
// Straddles the panel's left edge: half over the page, half over the panel's border.
const handleRightFor = (panelWidth: number) => `${panelWidth - 4}px`;

type StyleKey = keyof ReturnType<typeof dockStyles>;
/** The rules goober wrote for one of the SDK's style classes, without whitespace. */
const rulesOf = (key: StyleKey) => {
    const className = dockStyles()[key];
    const css = [...document.querySelectorAll("style#_goober")]
        .map((style) => style.textContent)
        .join("");
    return css
        .split("}")
        .filter((rule) => rule.includes(`.${className}`))
        .join("}")
        .replace(/\s/g, "");
};
const hasClass = (el: Element, key: StyleKey) =>
    el.classList.contains(dockStyles()[key]);

// jsdom has no PointerEvent; the handler only reads clientX.
const pointer = (type: string, target: EventTarget, clientX: number) =>
    target.dispatchEvent(
        new MouseEvent(type, { clientX, bubbles: true, cancelable: true })
    );

/** Drags the handle by `dx` pixels (negative = left, which widens the dock). */
const drag = (dx: number, startX = 900) => {
    pointer("pointerdown", handle(), startX);
    pointer("pointermove", window, startX + dx);
    vi.runAllTimers(); // flush the animation frame the move was batched into
    pointer("pointerup", window, startX + dx);
};

describe("resizing the docked panel", () => {
    beforeEach(() => {
        vi.useFakeTimers({
            toFake: ["requestAnimationFrame", "cancelAnimationFrame"],
        });
        window.innerWidth = 1440;
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = "";
        document.documentElement.style.marginRight = "";
    });

    test("puts a keyboard-reachable resize handle on the panel's left edge", () => {
        dockPanel(PANEL_URL);

        expect(handle()).toBeTruthy();
        expect(handle().getAttribute("role")).toBe("separator");
        expect(handle().getAttribute("aria-orientation")).toBe("vertical");
        expect(handle().getAttribute("aria-label")).toBeTruthy();
        expect(handle().tabIndex).toBe(0);
    });

    test("is an invisible strip straddling the panel's left edge, with the resize cursor", () => {
        dockPanel(PANEL_URL);

        expect(hasClass(handle(), "visual-builder__panel-resize-handle")).toBe(
            true
        );
        const rules = rulesOf("visual-builder__panel-resize-handle");
        expect(rules).toContain("width:8px");
        expect(rules).toContain("cursor:col-resize");
        expect(rules).toContain("background:transparent");
        // Above the panel, so the half over its border still takes the pointer.
        expect(rules).toContain("z-index:2147483647");
        expect(rulesOf("visual-builder__panel")).toContain(
            "z-index:2147483646"
        );
        // Where it sits depends on the width, so that one stays inline.
        expect(handle().style.right).toBe(handleRightFor(472));
    });

    test("draws the framed editor's resize line: full height, 2px, brand purple, on the panel's edge", () => {
        dockPanel(PANEL_URL);

        expect(hasClass(grip(), "visual-builder__panel-resize-grip")).toBe(
            true
        );
        const rules = rulesOf("visual-builder__panel-resize-grip");
        expect(rules).toContain("top:0");
        expect(rules).toContain("height:100%");
        // The panel's edge is the middle of the strip, which straddles it.
        expect(rules).toContain("left:4px");
        // venus lavender-purple P-500, as on the side form's resize bar
        expect(rules).toContain("border-left:2pxsolid#5d50be");
        expect(rules).toContain("opacity:0");
    });

    test("shows the line while the edge is hovered or dragged", () => {
        dockPanel(PANEL_URL);

        const rules = rulesOf("visual-builder__panel-resize-handle");
        expect(rules).toContain(":hover.visual-builder__panel-resize-grip");
        expect(rules).toContain(
            `.${DRAGGING}.visual-builder__panel-resize-grip`
        );
        expect(rules).toContain("opacity:1");
    });

    test("keeps the line and the resize cursor for the whole drag, even off the strip", () => {
        dockPanel(PANEL_URL);
        pointer("pointerdown", handle(), 900);

        expect(handle().classList.contains(DRAGGING)).toBe(true);
        expect(document.documentElement.style.cursor).toBe("col-resize");
        // Text must not get selected as the pointer sweeps across the page.
        expect(document.documentElement.style.userSelect).toBe("none");

        pointer("pointerup", window, 700);
        expect(handle().classList.contains(DRAGGING)).toBe(false);
        expect(document.documentElement.style.cursor).toBe("");
        expect(document.documentElement.style.userSelect).toBe("");
    });

    test("has no width transition, so the edge stays under the pointer", () => {
        dockPanel(PANEL_URL);

        expect(hasClass(panel(), "visual-builder__panel")).toBe(true);
        expect(rulesOf("visual-builder__panel")).toContain("transition:none");
        expect(document.documentElement.style.transition).not.toMatch(/margin/);
    });

    test("dragging left widens the panel and pushes the page aside by the same width", () => {
        dockPanel(PANEL_URL);

        drag(-100);

        expect(panel().style.width).toBe("572px");
        expect(pageMargin()).toBe("572px");
        expect(handle().style.right).toBe(handleRightFor(572));
    });

    test("dragging right narrows it, but never below the framed editor's side form width", () => {
        dockPanel(PANEL_URL);
        drag(-100);

        drag(300);

        expect(panel().style.width).toBe("472px");
        expect(pageMargin()).toBe("472px");
    });

    test("never takes more than 60% of the window, so the page stays usable", () => {
        dockPanel(PANEL_URL);

        drag(-2000);

        expect(panel().style.width).toBe("864px");
    });

    test("applies a burst of moves once per animation frame, so dragging stays smooth", () => {
        dockPanel(PANEL_URL);
        pointer("pointerdown", handle(), 900);

        pointer("pointermove", window, 880);
        pointer("pointermove", window, 860);
        pointer("pointermove", window, 850);
        expect(panel().style.width).toBe("472px");

        vi.runAllTimers();
        expect(panel().style.width).toBe("522px");
    });

    test("lets the pointer cross over the panel mid-drag, and gives it back afterwards", () => {
        dockPanel(PANEL_URL);

        pointer("pointerdown", handle(), 900);
        // A cross-origin iframe would otherwise swallow the moves once the pointer is over it.
        expect(panel().style.pointerEvents).toBe("none");

        pointer("pointerup", window, 900);
        expect(panel().style.pointerEvents).toBe("");
    });

    test("stops following the pointer once released", () => {
        dockPanel(PANEL_URL);
        drag(-100);

        pointer("pointermove", window, 500);
        vi.runAllTimers();

        expect(panel().style.width).toBe("572px");
    });

    test("arrow keys on the handle resize it in steps, within the same limits", () => {
        dockPanel(PANEL_URL);

        handle().dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })
        );
        expect(panel().style.width).toBe("488px");

        handle().dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
        );
        handle().dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
        );
        expect(panel().style.width).toBe("472px");
    });

    test("keeps the chosen width when the page reloads", () => {
        dockPanel(PANEL_URL);
        drag(-100);
        expect(localStorage.getItem(WIDTH_KEY)).toBe("572");

        document.body.innerHTML = "";
        dockPanel(PANEL_URL);

        expect(panel().style.width).toBe("572px");
        expect(pageMargin()).toBe("572px");
    });

    test("ignores a remembered width outside the limits", () => {
        localStorage.setItem(WIDTH_KEY, "5000");

        dockPanel(PANEL_URL);

        expect(panel().style.width).toBe("864px");
    });

    test("shrinks back within the limit when the window gets narrower", () => {
        dockPanel(PANEL_URL);
        drag(-2000);

        window.innerWidth = 1000;
        window.dispatchEvent(new Event("resize"));

        expect(panel().style.width).toBe("600px");
        expect(pageMargin()).toBe("600px");
    });

    test("never lets the panel and the page overlap, however it is resized", () => {
        dockPanel(PANEL_URL);
        const steps: Array<() => void> = [
            () => drag(-150),
            () => drag(90),
            () => drag(-3000),
            () => drag(5000),
            () =>
                handle().dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key: "ArrowLeft",
                        bubbles: true,
                    })
                ),
            () => {
                window.innerWidth = 900;
                window.dispatchEvent(new Event("resize"));
            },
        ];

        // The border counts inside the width, or the panel would overlap the page by 1px.
        expect(rulesOf("visual-builder__panel")).toContain(
            "box-sizing:border-box"
        );
        for (const step of steps) {
            step();
            expect(pageMargin()).toBe(panel().style.width);
        }
    });

    test("adds one handle however many times the panel is docked", () => {
        dockPanel(PANEL_URL);
        dockPanel(PANEL_URL);

        expect(
            document.querySelectorAll(".visual-builder__panel-resize-handle")
        ).toHaveLength(1);
    });
});
