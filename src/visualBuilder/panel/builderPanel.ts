import Config from "../../configManager/configManager";
import livePreviewPostMessage from "../../livePreview/eventManager/livePreviewEventManager";
import { hideCustomCursor, showCustomCursor } from "../listeners/mouseHover";
import { PublicLogger } from "../../logger/logger";
import { buildVisualBuilderSearchParams } from "../utils/getVisualBuilderRedirectionUrl";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import {
    getPanelElement,
    getPanelWindow,
    isPanelOpen,
    PANEL_ID,
} from "./panelElement";

/**
 * Hosts Visual Builder as a panel docked inside the customer's own page.
 *
 * The usual arrangement is the other way round: Visual Builder is the top-level
 * document and the customer's site loads in an iframe. That only works if the
 * site allows itself to be framed and its session cookie survives a cross-site
 * request, which rules out anything behind SSO. Here the site stays top-level,
 * so it keeps its real session, and the builder UI is the frame instead.
 *
 * The panel holds no credentials of its own — it is served from a separate
 * origin and reaches the API through the authenticated Contentstack window.
 */

const PANEL_FRAME_NAME = "visual-builder-panel";
/**
 * Matches DEFAULT_SIDEBAR_WIDTH in Visual Builder (72px rail + 400px form), so
 * the sideform renders at the width it was designed for instead of being
 * squeezed or leaving a gap.
 */
const DOCK_WIDTH = "472px";
const READY_TIMEOUT_MS = 20000;

/**
 * Marks a page load as "come up with the builder docked".
 *
 * Its own param rather than the `builder=true` one Visual Builder puts on the
 * canvas iframe URL: that one means "I am the canvas inside the builder", which
 * is the opposite arrangement. The SDK's editing UI is gated on
 * `isOpenInBuilder() || isPanelOpen()` instead, so both read correctly.
 *
 * Keying off the URL rather than session storage means a reload or a copied link
 * lands back in the builder.
 */
const PANEL_PARAM = "cs_builder_panel";

/** Namespace for the host handshake. Kept off the EventManager channels on
 * purpose: those cannot be configured until the panel window exists. */
const PANEL_MESSAGE_SOURCE = "cs-builder-panel";
const BROKER_MESSAGE_SOURCE = "cs-builder-broker";

/** Named so the window can be found again after this page reloads. */
const BROKER_WINDOW_NAME = "csBuilderBroker";

/**
 * Fired once the panel is docked and connected. The builder listens for it and
 * turns editing on, which keeps this module free of any import of VisualBuilder
 * (the button imports this module, and VisualBuilder imports the button).
 */
export const BUILDER_PANEL_OPENED_EVENT = "cs:builder-panel-opened";

/**
 * How much of the screen the panel is asking for.
 *
 * `collapsed` is the resting state: only the drawer handle, so the page keeps
 * its full width and the user works on the canvas. `expanded` adds the form
 * column. The `-status` variants are those two with extra transparent frame
 * past the dock, so the panel's syncing notification can sit over the
 * bottom-right of the CANVAS (not inside the dock) while a draft patch is in
 * flight. `overlay` covers the viewport so a modal can centre over the whole
 * screen.
 */
type PanelLayout =
    | "collapsed"
    | "collapsed-status"
    | "expanded"
    | "expanded-status"
    | "overlay";

/**
 * Collapsed, the frame is only big enough for the drawer handle. Nothing else of
 * the builder is on screen, so the page is entirely unobstructed.
 */
const HANDLE_SIZE = "56px";

/** Wide enough for the "Syncing…" pill the strip exists to show. Transient —
 * the panel drops back to `collapsed` when the patch settles. */
const STATUS_STRIP_WIDTH = "240px";

interface IPanelHostMessage {
    source: typeof PANEL_MESSAGE_SOURCE;
    type: "ready" | "layout" | "close";
    layout?: PanelLayout;
}

/**
 * The seam between the dock and the customer's page.
 *
 * Its own element rather than a border or shadow on the frame, for two reasons.
 * The panel cannot draw it: inside a cross-origin iframe anything painted past
 * the shell's left edge is clipped by the frame's viewport, so a 1px outside the
 * dock edge is invisible in the `expanded` layout where the frame *is* the dock.
 * And the frame cannot carry it either, because the frame is wider than the dock
 * in the `-status` and `overlay` layouts, which would leave the line stranded out
 * in the middle of the page.
 *
 * Anchoring to `right: DOCK_WIDTH` sidesteps both. The container's right edge is
 * always the dock's right edge, so the line lands on the dock's left edge in
 * every layout — inside the transparent strip when there is one, and overflowing
 * 1px onto the page when the frame is exactly the dock.
 */
const SEAM_ID = "cs-builder-panel-seam";
const SEAM_COLOR = "rgba(113, 128, 150, 0.3)";
const SEAM_SHADOW = "-2px 0 12px rgba(17, 22, 38, 0.16)";

/** The dock is only on screen in these, so the seam has nothing to sit against
 *  in the collapsed pair — where it would also be handle-height, not full. */
function setSeamVisible(container: HTMLElement, visible: boolean): void {
    const seam = container.querySelector<HTMLElement>(`#${SEAM_ID}`);
    if (seam) seam.style.display = visible ? "block" : "none";
}

export { getPanelWindow, isPanelOpen } from "./panelElement";

/** Whether this page load should come up with the panel already docked. */
export function isPanelRequested(): boolean {
    try {
        return (
            new URLSearchParams(window.location.search).get(PANEL_PARAM) ===
            "true"
        );
    } catch (e) {
        return false;
    }
}

function rememberPanelInUrl(remember: boolean): void {
    const url = new URL(window.location.href);
    if (remember) {
        url.searchParams.set(PANEL_PARAM, "true");
    } else {
        url.searchParams.delete(PANEL_PARAM);
    }
    window.history.replaceState({}, "", url.toString());
}

export function dismissPanel(): void {
    rememberPanelInUrl(false);
    window.location.reload();
}

function getPanelUrl(): string {
    const { editInVisualBuilderButton, clientUrlParams, hash } = Config.get();
    const base = editInVisualBuilderButton.panelUrl || clientUrlParams.url;
    const url = new URL("/toolbar", base);
    const params = buildVisualBuilderSearchParams();
    // Hand back the tracker we are already rendering against, so the builder
    // reuses it instead of minting a new one. Without this an SSR canvas reloads
    // for a fresh hash on every load, and never settles.
    if (hash) {
        params.set("live_preview", hash);
    }
    url.search = params.toString();
    return url.toString();
}

function getBrokerUrl(): string {
    const { editInVisualBuilderButton, clientUrlParams } = Config.get();
    // Defaults to the Contentstack app origin, which is the only origin that
    // holds the user's session. The panel's own origin deliberately does not.
    const base = editInVisualBuilderButton.brokerUrl || clientUrlParams.url;
    return new URL("/broker", base).toString();
}

function getCustomCursor(): HTMLDivElement | null {
    return document.querySelector<HTMLDivElement>(".visual-builder__cursor");
}

function originOf(url: string): string {
    try {
        return new URL(url).origin;
    } catch (e) {
        return "*";
    }
}

/**
 * Opens (or re-finds) the window that performs API calls on the panel's behalf.
 *
 * The panel is served from a credential-free origin, so in a hosted deployment
 * it is a third-party frame and gets no cookies at all — the localhost setup
 * where everything shares `localhost` hides this. Every request therefore goes
 * to a top-level window on the app origin, which is first-party and does have
 * the session.
 *
 * MUST be called synchronously from the click that opens the panel: opening a
 * window needs that user activation. If Visual Builder opened this tab in the
 * first place, its own window is already the broker and no popup is needed.
 */
/**
 * The tab that opened this one, as a broker CANDIDATE. When "Open in new tab"
 * in Visual Builder opened this page, the opener is the builder itself —
 * already authenticated, already first-party — and no popup is needed.
 *
 * Deliberately no referrer check: an https app opening an http site (local
 * dev) sends no referrer at all, and a site can disable referrers outright.
 * Whether the opener really is the Contentstack app is decided by the
 * origin-pinned hello handshake, which a stranger window cannot pass.
 */
function brokerFromOpener(): Window | null {
    try {
        if (window.opener && !window.opener.closed) {
            return window.opener;
        }
    } catch (e) {
        // Cross-origin opener access can throw; the caller falls back.
    }
    return null;
}

const BROKER_PROBE_TIMEOUT_MS = 2500;

/**
 * The first candidate window that passes the broker handshake: the opener
 * (the "Open in new tab" flow), then a broker popup left over from a previous
 * load of this page.
 */
async function findConnectableBroker(): Promise<Window | null> {
    for (const candidate of [brokerFromOpener(), findExistingBrokerWindow()]) {
        if (!candidate || candidate.closed) continue;
        if (
            await waitForBroker(candidate, {
                timeoutMs: BROKER_PROBE_TIMEOUT_MS,
                quiet: true,
            })
        ) {
            return candidate;
        }
    }
    return null;
}

function openBrokerWindow(): Window | null {
    // Fast path for the click flow. The pop-up needs the click's user
    // activation, which expires within seconds — no time for an async probe.
    // The referrer check identifies an app opener synchronously in the hosted
    // (https-everywhere) case; when the referrer is absent the popup opens and
    // is simply redundant beside a capable opener.
    try {
        if (
            window.opener &&
            originOf(document.referrer) === originOf(getBrokerUrl())
        ) {
            return window.opener;
        }
    } catch (e) {
        // Cross-origin opener access can throw; fall through to the popup.
    }

    // Named, so a reload of this page can find the same window again instead of
    // stacking up popups.
    const broker = window.open(
        getBrokerUrl(),
        BROKER_WINDOW_NAME,
        "popup=yes,width=420,height=280"
    );
    if (!broker) {
        PublicLogger.error(
            "Visual Builder could not open its Contentstack window. Allow pop-ups for this site and start editing again."
        );
    }
    return broker;
}

/** Re-finds the broker after a reload without opening anything new. */
function findExistingBrokerWindow(): Window | null {
    try {
        // An empty URL means "give me the existing window with this name", so
        // this does not navigate it and does not count as a pop-up.
        return window.open("", BROKER_WINDOW_NAME);
    } catch (e) {
        return null;
    }
}

function waitForSignal(
    target: Window,
    source: string,
    type: string,
    label: string
): Promise<Window | null> {
    return new Promise((resolve) => {
        const cleanup = () => {
            window.clearTimeout(timer);
            window.removeEventListener("message", onMessage);
        };

        const onMessage = (event: MessageEvent) => {
            if (event.source !== target) return;
            if (event.data?.source !== source) return;
            if (event.data?.type !== type) return;
            cleanup();
            resolve(target);
        };

        const timer = window.setTimeout(() => {
            cleanup();
            PublicLogger.error(`The Visual Builder ${label} did not respond.`);
            resolve(null);
        }, READY_TIMEOUT_MS);

        window.addEventListener("message", onMessage);
    });
}

const BROKER_POLL_INTERVAL_MS = 300;

/**
 * Waits until the broker window answers.
 *
 * Asks rather than listening for an announcement, because there is no ordering
 * we can rely on. A freshly opened broker is a tiny page and reports in long
 * before the panel — a whole builder app — has finished loading, so a one-shot
 * announcement is missed. And a broker re-found after a reload has already
 * booted and will never announce itself again. Polling covers both.
 *
 * This handshake is also the trust decision: both the hello and the reply are
 * pinned to the app origin, so a window that is not the Contentstack app never
 * receives the question and can never answer it. Callers probing candidate
 * windows pass a short quiet timeout.
 */
function waitForBroker(
    broker: Window,
    { timeoutMs = READY_TIMEOUT_MS, quiet = false } = {}
): Promise<boolean> {
    const brokerOrigin = originOf(getBrokerUrl());

    return new Promise((resolve) => {
        const cleanup = () => {
            window.clearInterval(poll);
            window.clearTimeout(timer);
            window.removeEventListener("message", onMessage);
        };

        const onMessage = (event: MessageEvent) => {
            if (event.source !== broker) return;
            if (event.data?.source !== BROKER_MESSAGE_SOURCE) return;
            if (event.data?.type !== "ready") return;
            cleanup();
            resolve(true);
        };
        window.addEventListener("message", onMessage);

        const hello = () => {
            try {
                broker.postMessage(
                    { source: PANEL_MESSAGE_SOURCE, type: "hello" },
                    brokerOrigin
                );
            } catch (e) {
                // Still navigating; the next tick will get through.
            }
        };

        const poll = window.setInterval(hello, BROKER_POLL_INTERVAL_MS);
        const timer = window.setTimeout(() => {
            cleanup();
            if (!quiet) {
                PublicLogger.error(
                    "The Visual Builder Contentstack window did not respond."
                );
            }
            resolve(false);
        }, timeoutMs);
        hello();
    });
}

/**
 * Hands the panel and the broker two ends of a private pipe.
 *
 * Ports are transferable rather than copyable, so once this page has passed them
 * on it cannot listen to either end. The customer's site makes the introduction
 * and is then out of the conversation, which keeps their JS away from API
 * traffic that is none of its business.
 */
async function connectPanelToBroker(
    panel: Window,
    broker: Window
): Promise<boolean> {
    if (!(await waitForBroker(broker))) return false;

    const brokerOrigin = originOf(getBrokerUrl());
    const panelOrigin = originOf(getPanelUrl());

    const channel = new MessageChannel();
    broker.postMessage(
        { source: PANEL_MESSAGE_SOURCE, type: "broker-port" },
        brokerOrigin,
        [channel.port1]
    );
    panel.postMessage(
        { source: PANEL_MESSAGE_SOURCE, type: "broker-port" },
        panelOrigin,
        [channel.port2]
    );
    return true;
}

/**
 * Narrows the page so it reflows beside the dock.
 *
 * ponytail: sets a width on the root element, which handles percentage-based
 * layouts. Anything the page sizes in `vw` still measures the full window and
 * will run under the panel. Fixing that properly needs the page in its own
 * frame, which is the thing this whole approach exists to avoid.
 */
function setPageInset(width: string | null): void {
    const root = document.documentElement;
    if (!width) {
        root.style.removeProperty("width");
        root.style.removeProperty("overflow-x");
        return;
    }
    root.style.width = `calc(100% - ${width})`;
    root.style.overflowX = "hidden";
}

/**
 * Modals need more room than the dock has, so the panel covers the viewport
 * while one is open. The page keeps its narrowed width underneath so dismissing
 * the modal does not reflow the whole site.
 */
export function setPanelLayout(layout: PanelLayout): void {
    const container = getPanelElement();
    if (!container) return;

    if (layout === "overlay") {
        container.style.width = "100%";
        container.style.height = "100vh";
        container.style.background = "transparent";
        container.style.boxShadow = "none";
        setSeamVisible(container, true);
        // The page keeps whatever inset it had, so dismissing the modal does not
        // reflow the whole site.
        return;
    }

    if (layout === "collapsed-status") {
        // Collapsed, but with room for the syncing pill at the bottom of the
        // screen: a transparent right-edge strip, page still at full width.
        // Transient by design — the strip does intercept pointer events over
        // the sliver of page it covers, so it only exists while a patch is
        // in flight.
        container.style.width = STATUS_STRIP_WIDTH;
        container.style.height = "100vh";
        container.style.background = "transparent";
        container.style.boxShadow = "none";
        setSeamVisible(container, false);
        setPageInset(null);
        return;
    }

    if (layout === "expanded-status") {
        // The dock plus a transparent strip past its left edge, so the pill
        // can sit OVER the canvas rather than inside the dock. The page keeps
        // its dock inset — nothing reflows. Same transient pointer-event
        // caveat as collapsed-status, over the strip only.
        container.style.width = `calc(${DOCK_WIDTH} + ${STATUS_STRIP_WIDTH})`;
        container.style.height = "100vh";
        container.style.background = "transparent";
        container.style.boxShadow = "none";
        setSeamVisible(container, true);
        setPageInset(DOCK_WIDTH);
        return;
    }

    const isExpanded = layout === "expanded";
    // Collapsed, the frame shrinks to the drawer handle. A single frame cannot be
    // L-shaped, and the host cannot pass clicks through selectively on a
    // cross-origin frame — so the only way to hand the page back its full area is to
    // stop covering it.
    container.style.width = isExpanded ? DOCK_WIDTH : HANDLE_SIZE;
    container.style.height = isExpanded ? "100vh" : HANDLE_SIZE;
    container.style.background = "transparent";
    container.style.boxShadow = "none";
    setSeamVisible(container, isExpanded);
    setPageInset(isExpanded ? DOCK_WIDTH : null);
}

/** Layout and close requests keep arriving for as long as the panel is docked. */
function listenToPanel(): void {
    window.addEventListener("message", (event: MessageEvent) => {
        const panelWindow = getPanelWindow();
        if (!panelWindow || event.source !== panelWindow) return;

        const data = event.data as IPanelHostMessage;
        if (data?.source !== PANEL_MESSAGE_SOURCE) return;

        if (data.type === "layout" && data.layout) {
            setPanelLayout(data.layout);
        } else if (data.type === "close") {
            dismissPanel();
        }
    });
}

/**
 * Points the builder channels at the panel.
 *
 * Both managers default to `window.parent`, which in a top-level page is the
 * page itself — so without this the SDK would be talking to nobody.
 */
export function retargetChannelsToPanel(panelWindow: Window): void {
    visualBuilderPostMessage?.updateConfig({ target: panelWindow });
    livePreviewPostMessage?.updateConfig({ target: panelWindow });
}

/**
 * Docks the panel and resolves once it is listening. Resolves `null` if it
 * never answers, in which case the caller should carry on without editing
 * rather than leaving the page half wired.
 */
export async function mountPanel(): Promise<Window | null> {
    if (isPanelOpen()) return getPanelWindow();

    const container = document.createElement("div");
    container.id = PANEL_ID;
    // Inline styles throughout: the customer's site ships none of our CSS, and
    // the panel has to sit above whatever z-index their page already uses.
    // Starts collapsed: only the toolbar, page at full width. The panel asks for
    // more room when the form opens.
    Object.assign(container.style, {
        position: "fixed",
        top: "0",
        right: "0",
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        // Above the canvas overlays, which sit a band below max on purpose so the
        // panel and its modals are never painted over by a field highlight.
        zIndex: "2147483000",
        background: "transparent",
        boxShadow: "none",
    } as Partial<CSSStyleDeclaration>);

    const iframe = document.createElement("iframe");
    iframe.src = getPanelUrl();
    iframe.title = "Contentstack Visual Builder";
    // Deliberately not "visual-editor". The SDK reads that name as "the builder
    // is hosting me", which is the opposite of this arrangement.
    iframe.name = PANEL_FRAME_NAME;
    Object.assign(iframe.style, {
        width: "100%",
        height: "100%",
        border: "0",
        display: "block",
    } as Partial<CSSStyleDeclaration>);

    // Starts hidden to match the collapsed frame the container is created at.
    const seam = document.createElement("div");
    seam.id = SEAM_ID;
    Object.assign(seam.style, {
        position: "absolute",
        top: "0",
        bottom: "0",
        right: DOCK_WIDTH,
        width: "1px",
        background: SEAM_COLOR,
        boxShadow: SEAM_SHADOW,
        // Sits over the page in the `expanded` layout, where it overflows the
        // container. Nothing should become unclickable because of a hairline.
        pointerEvents: "none",
        display: "none",
    } as Partial<CSSStyleDeclaration>);

    container.appendChild(iframe);
    container.appendChild(seam);
    document.body.appendChild(container);
    listenToPanel();

    // The first init handshake found no builder and left this behind. Now that
    // one is docking, the offer is stale.
    document.querySelector(".visual-builder__start-editing-btn")?.remove();

    // The custom cursor follows mousemove on the page. Moving onto the panel stops
    // those events without ever leaving the document, so it freezes wherever it was
    // and the user sees two cursors — the real one on the panel, a stranded one on
    // the canvas.
    container.addEventListener("mouseenter", () => {
        hideCustomCursor(getCustomCursor());
    });
    container.addEventListener("mouseleave", () => {
        showCustomCursor(getCustomCursor());
    });

    // "loaded" only means the panel's scripts are running, which is as far as it
    // can get before it has an API connection. Retargeting the canvas channels
    // waits for "ready" — see openBuilderPanel.
    const panelWindow = await waitForSignal(
        iframe.contentWindow as Window,
        PANEL_MESSAGE_SOURCE,
        "loaded",
        "panel"
    );
    if (!panelWindow) {
        container.remove();
        setPageInset(null);
        // Drop the marker so a manual refresh comes back as the plain site
        // instead of retrying a panel that is not answering.
        rememberPanelInUrl(false);
        return null;
    }

    return panelWindow;
}

/**
 * Docks the builder into this page.
 *
 * MUST be called straight from a click. `openBrokerWindow` needs that user
 * activation, and it is called first for exactly that reason — everything after
 * it is async and would lose the activation.
 *
 * Wires up in place rather than reloading: the channels have to point at the
 * panel before the builder runs its init handshake, and doing it here means the
 * page the user was looking at stays exactly as it was.
 */
export async function openBuilderPanel(): Promise<void> {
    if (isPanelOpen()) return;

    const broker = openBrokerWindow();
    const panel = await mountPanel();
    if (!panel) return;

    // Hand over the API pipe before waiting for the canvas handshake. The panel
    // cannot authenticate anything until it has this, and its own boot sequence
    // is what eventually sends "ready".
    if (broker) {
        await connectPanelToBroker(panel, broker);
    }

    await attachCanvas(panel);
}

const PANEL_READY_POLL_INTERVAL_MS = 400;
const PANEL_READY_GIVE_UP_MS = 120000;

/**
 * Waits for the panel's canvas bridge, asking rather than trusting a one-shot
 * announcement — the same shape as waitForBroker, for the same reasons. The
 * bridge's "ready" fires once when its React tree mounts; on a slow boot (cold
 * caches, a broker reconnect) that can be well past any fixed deadline, and if
 * it mounted before we started listening the announcement is already gone.
 * Polling covers both directions.
 */
function waitForPanelReady(panel: Window): Promise<boolean> {
    const panelOrigin = originOf(getPanelUrl());

    return new Promise((resolve) => {
        const cleanup = () => {
            window.clearInterval(poll);
            window.clearTimeout(timer);
            window.removeEventListener("message", onMessage);
        };

        const onMessage = (event: MessageEvent) => {
            if (event.source !== panel) return;
            if (event.data?.source !== PANEL_MESSAGE_SOURCE) return;
            if (event.data?.type !== "ready") return;
            cleanup();
            resolve(true);
        };
        window.addEventListener("message", onMessage);

        const hello = () => {
            try {
                panel.postMessage(
                    { source: PANEL_MESSAGE_SOURCE, type: "canvas-hello" },
                    panelOrigin
                );
            } catch (e) {
                // Still navigating; the next tick will get through.
            }
        };

        const poll = window.setInterval(hello, PANEL_READY_POLL_INTERVAL_MS);
        // A backstop, not a deadline: the panel is visibly docked, so giving up
        // only means editing never turns on — do that loudly and late.
        const timer = window.setTimeout(() => {
            cleanup();
            PublicLogger.error(
                "The Visual Builder panel never finished loading, so editing was not enabled."
            );
            resolve(false);
        }, PANEL_READY_GIVE_UP_MS);
        hello();
    });
}

/**
 * Waits for the panel to say it is listening for canvas events, then points the
 * channels at it and turns editing on.
 */
async function attachCanvas(panel: Window): Promise<void> {
    if (!(await waitForPanelReady(panel))) return;

    retargetChannelsToPanel(panel);
    rememberPanelInUrl(true);
    window.dispatchEvent(new CustomEvent(BUILDER_PANEL_OPENED_EVENT));
}

/**
 * Brings the panel back after a reload, reusing the broker window that is still
 * open rather than opening another. No user activation here, so a pop-up is not
 * an option — if the broker has been closed the panel comes up unable to reach
 * the API and says so.
 */
export async function restorePanel(): Promise<void> {
    const panel = await mountPanel();
    if (!panel) return;

    // The app tab that opened this one is preferred over a popup from a
    // previous session: a tab opened via "Open in new tab" restores against
    // its opener with no popup ever having existed. Candidates are probed
    // with the handshake — no reload-surviving activation exists here, so the
    // wait costs nothing.
    const broker = await findConnectableBroker();
    if (broker) {
        await connectPanelToBroker(panel, broker);
    } else {
        PublicLogger.error(
            "The Visual Builder Contentstack window was closed. Start editing again to reconnect."
        );
    }

    // Deliberately not awaited: the panel is a whole app and can take longer to
    // boot than this page is willing to block. When it eventually answers,
    // attachCanvas retargets the channels and fires BUILDER_PANEL_OPENED_EVENT,
    // and VisualBuilder — constructed in the meantime — redoes its init
    // handshake on the retargeted channel, exactly as it does for a first open.
    void attachCanvas(panel);
}
