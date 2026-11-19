import classNames from "classnames";
import { h, render } from "preact";
import Config from "../../configManager/configManager";
import { FormIcon } from "../components/icons";
import { startEditingPositionClass } from "../components/startEditingButton";
import { visualBuilderStyles } from "../visualBuilder.style";
import { dockStyles } from "./dock.style";
import {
    isEditorReloading,
    rememberFormOpen,
    takeEditorReload,
} from "./editorReload";

export { markEditorReload } from "./editorReload";

// Visual Editor's DEFAULT_SIDEBAR_WIDTH (72px tab rail + 400px form), so the panel matches the framed editor.
const MIN_WIDTH = 472;
// Leaves the page at least 40% of the window.
const MAX_SHARE = 0.6;
const KEY_STEP = 16;
// Half the handle's width: it straddles the panel's edge.
const HANDLE_OFFSET = 4;
const WIDTH_KEY = "cs-builder-panel-width";
const DRAGGING = "visual-builder__panel-resize-handle--dragging";
const BUSY = "visual-builder__page--busy";

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
    // A user's reload comes back collapsed; one the editor caused for an SSR edit keeps the form open,
    // and the page waits for the panel before it can be edited again.
    const reload = takeEditorReload();

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

    const openForm = () =>
        panel.contentWindow?.postMessage(
            { source: "cs-builder-host", type: "open-form" },
            new URL(panel.src).origin
        );

    // Opens the collapsed form from the site's Start Editing slot, which the site placed clear of its content.
    let toggle: HTMLButtonElement | undefined;
    if (Config.get().editInVisualBuilderButton.enable) {
        toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = classNames(
            "visual-builder__panel-toggle",
            dockStyles()["visual-builder__panel-toggle"],
            "visual-builder__start-editing-btn",
            visualBuilderStyles()["visual-builder__start-editing-btn"],
            startEditingPositionClass()
        );
        toggle.setAttribute("aria-label", "Open the Visual Editor form");
        toggle.title = "Open the Visual Editor form";
        render(h(FormIcon, {}), toggle);
        toggle.addEventListener("click", openForm);
        document.body.append(toggle);
    }

    // The builder hides its cursor and outlines when the pointer leaves the page, and the dock (handle, open button) is not the page.
    // Over the panel's cross-origin frame the page gets no events at all, so the panel reports it.
    let offPage = false;
    const setOffPage = (next: boolean) => {
        if (offPage === next || !panel.isConnected) return;
        offPage = next;
        document.documentElement.dispatchEvent(
            new MouseEvent(next ? "mouseleave" : "mouseenter")
        );
    };
    const onDock = (target: EventTarget | null) =>
        handle.contains(target as Node) || !!toggle?.contains(target as Node);
    document.addEventListener("mousemove", ({ target }) =>
        setOffPage(busy || onDock(target))
    );

    // While the panel updates the page (an SSR edit on its way), the page is stale: wait, do not edit it.
    let busy = false;
    // Once the editor has started reloading the page it stays waiting until the page goes: the old page can
    // outlast the panel's own grace while the server renders the new one.
    let reloading = false;
    const setBusy = (next: boolean) => {
        if (!next && reloading) return;
        busy = next;
        document.documentElement.classList.toggle(BUSY, next);
        document.documentElement.classList.toggle(dockStyles()[BUSY], next);
        if (next) setOffPage(true);
    };
    setBusy(reload.byEditor);
    // Fires as the reload starts; the old page then stays up while the server renders the new one.
    window.addEventListener("beforeunload", () => {
        if (!panel.isConnected || !isEditorReloading()) return;
        setBusy(true);
        reloading = true;
    });
    // Capture, registered before the builder's own listeners: a busy page neither shows the edit cursor over a
    // field nor focuses one.
    for (const type of ["click", "mousemove"] as const) {
        window.addEventListener(
            type,
            (event) => {
                if (!busy || !panel.isConnected || onDock(event.target)) return;
                if (type === "click") event.preventDefault();
                event.stopImmediatePropagation();
            },
            { capture: true }
        );
    }
    let width = 0;
    let reopening = reload.byEditor && reload.formOpen;
    // Collapsed until the panel says its side form shows; the site then keeps its full width.
    // Undefined until the panel first reports, so the open button waits for something that can answer it.
    let open: boolean | undefined = reopening || undefined;
    window.addEventListener("pagehide", () => rememberFormOpen(open === true));
    // While the panel shows a modal it spans the window, so the modal centres over the site; the page stays put.
    let modal = false;
    const layout = () => {
        panel.style.width = modal ? "100vw" : `${open ? width : 0}px`;
        panel.style.borderLeftWidth = open && !modal ? "" : "0";
        document.documentElement.style.marginRight = open ? `${width}px` : "";
        handle.hidden = !open || modal;
        if (toggle) toggle.hidden = open !== false || modal;
    };
    const resizeTo = (next: number) => {
        width = clamp(next);
        handle.style.right = `${width - HANDLE_OFFSET}px`;
        handle.setAttribute("aria-valuenow", String(width));
        localStorage.setItem(WIDTH_KEY, String(width));
        layout();
    };
    resizeTo(Number(localStorage.getItem(WIDTH_KEY)) || MIN_WIDTH);

    window.addEventListener("message", ({ data, source }: MessageEvent) => {
        if (
            source !== panel.contentWindow ||
            data?.source !== "cs-builder-panel"
        )
            return;
        if (data.type === "pointer-over-panel") setOffPage(true);
        if (data.type === "form-visibility") {
            // The reloaded panel boots closed; reopen it instead of collapsing the page under the user.
            if (reopening && !data.open) {
                reopening = false;
                openForm();
                return;
            }
            reopening = false;
            open = Boolean(data.open);
        }
        if (data.type === "modal-visibility") modal = Boolean(data.open);
        if (data.type === "canvas-busy") setBusy(Boolean(data.busy));
        layout();
    });

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
