import classNames from "classnames";
import { dockStyles } from "./dock.style";

// Visual Editor's DEFAULT_SIDEBAR_WIDTH (72px tab rail + 400px form), so the panel matches the framed editor.
const MIN_WIDTH = 472;
// Leaves the page at least 40% of the window.
const MAX_SHARE = 0.6;
const KEY_STEP = 16;
// Half the handle's width: it straddles the panel's edge.
const HANDLE_OFFSET = 4;
const WIDTH_KEY = "cs-builder-panel-width";
const DRAGGING = "visual-builder__panel-resize-handle--dragging";

const clamp = (width: number) =>
    Math.min(
        Math.max(MIN_WIDTH, Math.floor(window.innerWidth * MAX_SHARE)),
        Math.max(MIN_WIDTH, Math.round(width))
    );

const element = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    name: keyof ReturnType<typeof dockStyles>
) => {
    const el = document.createElement(tag);
    el.className = classNames(name, dockStyles()[name]);
    return el;
};

/** Docks the Visual Editor panel on the right and pushes the page aside so nothing is covered. */
export function dockPanel(panelUrl: string): HTMLIFrameElement {
    const docked = document.querySelector<HTMLIFrameElement>(
        "iframe.visual-builder__panel"
    );
    if (docked) return docked;

    const panel = element("iframe", "visual-builder__panel");
    panel.title = "Visual Editor";
    panel.src = panelUrl;

    const handle = element("div", "visual-builder__panel-resize-handle");
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "vertical");
    handle.setAttribute("aria-label", "Resize the Visual Editor panel");
    handle.tabIndex = 0;
    handle.appendChild(element("div", "visual-builder__panel-resize-grip"));
    document.body.append(panel, handle);

    let width = 0;
    const resizeTo = (next: number) => {
        width = clamp(next);
        panel.style.width = `${width}px`;
        document.documentElement.style.marginRight = `${width}px`;
        handle.style.right = `${width - HANDLE_OFFSET}px`;
        handle.setAttribute("aria-valuenow", String(width));
        localStorage.setItem(WIDTH_KEY, String(width));
    };
    resizeTo(Number(localStorage.getItem(WIDTH_KEY)) || MIN_WIDTH);

    handle.addEventListener("pointerdown", (down: PointerEvent) => {
        down.preventDefault();
        const startWidth = width;
        let x = down.clientX;
        let frame = 0;
        const page = document.documentElement.style;
        const dragging = (on: boolean) => {
            handle.classList.toggle(DRAGGING, on);
            // A cross-origin iframe would otherwise swallow the moves once the pointer is over it.
            panel.style.pointerEvents = on ? "none" : "";
            page.cursor = on ? "col-resize" : "";
            page.userSelect = on ? "none" : "";
        };
        // One style write per frame, however many moves arrive in it.
        const onMove = (move: PointerEvent) => {
            x = move.clientX;
            frame ||= requestAnimationFrame(() => {
                frame = 0;
                resizeTo(startWidth + down.clientX - x);
            });
        };
        const onUp = () => {
            cancelAnimationFrame(frame);
            resizeTo(startWidth + down.clientX - x);
            dragging(false);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
        };
        dragging(true);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    });

    handle.addEventListener("keydown", (event: KeyboardEvent) => {
        const step = { ArrowLeft: KEY_STEP, ArrowRight: -KEY_STEP }[event.key];
        if (!step) return;
        event.preventDefault();
        resizeTo(width + step);
    });
    window.addEventListener("resize", () => resizeTo(width));
    return panel;
}
