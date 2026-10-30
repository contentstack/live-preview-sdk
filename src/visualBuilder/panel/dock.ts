// Visual Editor's DEFAULT_SIDEBAR_WIDTH (72px tab rail + 400px form), so the panel matches the framed editor.
const PANEL_WIDTH = "472px";

/** Docks the Visual Editor panel on the right and pushes the page aside so nothing is covered. */
export function dockPanel(panelUrl: string): HTMLIFrameElement {
    const docked = document.querySelector<HTMLIFrameElement>(
        "iframe.visual-builder__panel"
    );
    if (docked) return docked;

    const panel = document.createElement("iframe");
    panel.className = "visual-builder__panel";
    panel.title = "Visual Editor";
    panel.src = panelUrl;
    Object.assign(panel.style, {
        position: "fixed",
        top: "0px",
        right: "0px",
        width: PANEL_WIDTH,
        height: "100vh",
        border: "none",
        borderLeft: "1px solid #dde3ee",
        zIndex: "2147483647",
    });
    document.body.appendChild(panel);
    document.documentElement.style.marginRight = PANEL_WIDTH;
    return panel;
}
