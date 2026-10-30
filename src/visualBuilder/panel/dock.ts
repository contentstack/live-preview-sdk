const PANEL_WIDTH = "400px";

/** Docks the Visual Editor panel on the right and pushes the page aside so nothing is covered. */
export function dockPanel(panelUrl: string): void {
    if (document.querySelector("iframe.visual-builder__panel")) return;

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
}
