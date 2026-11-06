import { dockPanel } from "../dock";
import { dockStyles } from "../dock.style";
import Config from "../../../configManager/configManager";
import { visualBuilderStyles } from "../../visualBuilder.style";

const PANEL_URL = "https://visual-builder.contentstack.com/panel/index.html";
const panels = () =>
    document.querySelectorAll<HTMLIFrameElement>(
        "iframe.visual-builder__panel"
    );
const toggle = () =>
    document.querySelector<HTMLButtonElement>(
        "button.visual-builder__panel-toggle"
    )!;
const resizeHandle = () =>
    document.querySelector<HTMLElement>(
        ".visual-builder__panel-resize-handle"
    )!;
/** What the panel tells the page about its side form, which sizes the dock. */
const formShows = (
    open: boolean,
    source: Window | null = panels()[0].contentWindow
) =>
    window.dispatchEvent(
        new MessageEvent("message", {
            data: { source: "cs-builder-panel", type: "form-visibility", open },
            source,
        })
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
        formShows(true);

        // Visual Editor's DEFAULT_SIDEBAR_WIDTH: a 72px tab rail and 400px of form.
        expect(panels()[0].style.width).toBe("472px");
    });

    test("pushes the page aside by the panel's width instead of covering it", () => {
        dockPanel(PANEL_URL);
        formShows(true);

        expect(document.documentElement.style.marginRight).toBe(
            panels()[0].style.width
        );
    });

    test("docks only once", () => {
        dockPanel(PANEL_URL);
        dockPanel(PANEL_URL);

        expect(panels()).toHaveLength(1);
    });

    describe("collapsed until the side form opens", () => {
        test("starts collapsed: the page keeps its full width and the panel takes none", () => {
            dockPanel(PANEL_URL);

            expect(document.documentElement.style.marginRight).toBe("");
            expect(panels()[0].style.width).toBe("0px");
            expect(resizeHandle().hidden).toBe(true);
        });

        test("opens to the side form's width when the panel says the form shows", () => {
            dockPanel(PANEL_URL);

            formShows(true);

            expect(panels()[0].style.width).toBe("472px");
            expect(document.documentElement.style.marginRight).toBe("472px");
            expect(resizeHandle().hidden).toBe(false);
        });

        test("collapses again when the form closes, and gives the page its width back", () => {
            dockPanel(PANEL_URL);
            formShows(true);

            formShows(false);

            expect(panels()[0].style.width).toBe("0px");
            expect(document.documentElement.style.marginRight).toBe("");
            expect(resizeHandle().hidden).toBe(true);
        });

        test("ignores that from any window but the panel", () => {
            dockPanel(PANEL_URL);

            formShows(true, window);

            expect(panels()[0].style.width).toBe("0px");
        });

        test("stays collapsed when the window resizes", () => {
            dockPanel(PANEL_URL);

            window.dispatchEvent(new Event("resize"));

            expect(document.documentElement.style.marginRight).toBe("");
        });
    });

    describe("over the whole window while the panel shows a modal", () => {
        const modalShows = (
            open: boolean,
            source: Window | null = panels()[0].contentWindow
        ) =>
            window.dispatchEvent(
                new MessageEvent("message", {
                    data: {
                        source: "cs-builder-panel",
                        type: "modal-visibility",
                        open,
                    },
                    source,
                })
            );

        test("spreads the panel over the window, so the modal centres over the site", () => {
            dockPanel(PANEL_URL);
            formShows(true);

            modalShows(true);

            expect(panels()[0].style.width).toBe("100vw");
            expect(resizeHandle().hidden).toBe(true);
        });

        test("leaves the page where it is underneath", () => {
            dockPanel(PANEL_URL);
            formShows(true);

            modalShows(true);

            expect(document.documentElement.style.marginRight).toBe("472px");
        });

        test("goes back to the dock when the modal closes", () => {
            dockPanel(PANEL_URL);
            formShows(true);
            modalShows(true);

            modalShows(false);

            expect(panels()[0].style.width).toBe("472px");
            expect(resizeHandle().hidden).toBe(false);
        });

        test("covers the window from a collapsed dock too, and collapses again after", () => {
            dockPanel(PANEL_URL);
            formShows(false);

            modalShows(true);
            expect(panels()[0].style.width).toBe("100vw");
            expect(document.documentElement.style.marginRight).toBe("");
            expect(toggle().hidden).toBe(true);

            modalShows(false);
            expect(panels()[0].style.width).toBe("0px");
            expect(toggle().hidden).toBe(false);
        });

        test("ignores that from any window but the panel", () => {
            dockPanel(PANEL_URL);
            formShows(true);

            modalShows(true, window);

            expect(panels()[0].style.width).toBe("472px");
        });
    });

    // It takes the site's Start Editing slot: the site already chose where that button may cover its page.
    describe("the open button, where the site puts Start Editing", () => {
        afterEach(() => Config.reset());

        test("appears once the panel is up and its form is closed", () => {
            dockPanel(PANEL_URL);
            // Before the panel boots nothing would answer a click.
            expect(toggle().hidden).toBe(true);

            formShows(false);

            expect(toggle().hidden).toBe(false);
            expect(toggle().type).toBe("button");
            expect(toggle().getAttribute("aria-label")).toBeTruthy();
        });

        test("looks like Start Editing, as an icon with no label", () => {
            dockPanel(PANEL_URL);
            formShows(false);

            expect(
                toggle().classList.contains(
                    visualBuilderStyles()["visual-builder__start-editing-btn"]
                )
            ).toBe(true);
            expect(toggle().querySelector("svg")).not.toBeNull();
            expect(toggle().textContent?.trim()).toBe("");
        });

        test.each(["top-left", "top-right", "bottom-left"] as const)(
            "sits where the site placed Start Editing (%s)",
            (position) => {
                Config.set("editInVisualBuilderButton.position", position);

                dockPanel(PANEL_URL);

                expect(
                    toggle().classList.contains(
                        visualBuilderStyles()[
                            `visual-builder__start-editing-btn__${position}`
                        ]
                    )
                ).toBe(true);
            }
        );

        test("sits bottom right by default, as Start Editing does", () => {
            dockPanel(PANEL_URL);

            expect(
                toggle().classList.contains(
                    visualBuilderStyles()[
                        "visual-builder__start-editing-btn__bottom-right"
                    ]
                )
            ).toBe(true);
        });

        test("never shows on a site that turned Start Editing off; the canvas Form button still opens the form", () => {
            Config.set("editInVisualBuilderButton.enable", false);
            dockPanel(PANEL_URL);

            formShows(false);

            expect(toggle()).toBeNull();
        });

        test("hides while the form shows", () => {
            dockPanel(PANEL_URL);

            formShows(true);

            expect(toggle().hidden).toBe(true);
        });

        test("asks the panel, and only the panel's origin, to open its form", () => {
            dockPanel(PANEL_URL);
            formShows(false);
            const post = vi
                .spyOn(panels()[0].contentWindow!, "postMessage")
                .mockImplementation(() => {});

            toggle().click();

            expect(post).toHaveBeenCalledWith(
                { source: "cs-builder-host", type: "open-form" },
                "https://visual-builder.contentstack.com"
            );
        });
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

        test("hides them over the open button too, which sits on the page", () => {
            dockPanel(PANEL_URL);
            formShows(false);
            const seen = pageEvents();

            // The button holds an icon, so the move lands on its svg.
            moveOver(toggle().querySelector("svg")!);

            expect(seen).toEqual(["mouseleave"]);
        });

        test("shows the clickable pointer on the open button", () => {
            dockPanel(PANEL_URL);

            expect(
                toggle().classList.contains(
                    dockStyles()["visual-builder__panel-toggle"]
                )
            ).toBe(true);
            const rules = [...document.querySelectorAll("style#_goober")]
                .map((style) => style.textContent)
                .join("")
                .replace(/\s/g, "");
            expect(rules).toContain(
                `.${dockStyles()["visual-builder__panel-toggle"]}{cursor:pointer`
            );
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
