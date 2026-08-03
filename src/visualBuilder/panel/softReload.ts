import { PublicLogger } from "../../logger/logger";
import { hideOverlay } from "../generators/generateOverlay";
import { PANEL_ID } from "./panelElement";

/**
 * Refreshes a server-rendered page without navigating it.
 *
 * With the builder docked, a real reload is expensive in exactly the wrong
 * way: the panel is part of this document, so "refresh the canvas" also kills
 * the builder, its form state, and the broker wiring, and everything has to
 * boot again. Instead this fetches the current URL (which already carries the
 * live_preview params, so the server answers with fresh preview content),
 * parses it, and patches only what changed into the live DOM.
 *
 * Morphing rather than replacing is what keeps the page's own framework
 * alive: React and friends hold references to the DOM nodes they hydrated,
 * so as long as those nodes survive and only their text and attributes
 * change, their event listeners keep working. A wholesale innerHTML swap
 * would leave the framework managing detached nodes — static page, dead
 * interactivity.
 *
 * Known ceilings, all deliberate:
 * - Children are matched by position. A structural change (a component added
 *   mid-list) replaces the tail subtrees instead of minimally diffing them.
 *   That is still correct, just heavier; idiomorph-style id matching is the
 *   upgrade path if it ever matters.
 * - Scripts are never re-executed. A content save does not change the
 *   bundle; inline JSON payloads (Next's __NEXT_DATA__) are text-synced so
 *   the document stays consistent.
 * - If any of this goes sideways the browser reload button remains the
 *   universal escape hatch, and any fetch/parse failure falls back to a real
 *   reload on its own.
 */

/** Nodes this SDK (or the panel) added to the page. The server knows nothing
 * about them, so the fetched document must never cause their removal — and
 * the panel iframe in particular must not even be MOVED, because reparenting
 * an iframe reloads it. */
function isOurs(node: Node): boolean {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const el = node as Element;
    if (el.id === PANEL_ID) return true;
    for (const cls of Array.from(el.classList)) {
        if (cls.startsWith("visual-builder")) return true;
    }
    return false;
}

function syncAttributes(oldEl: Element, newEl: Element): void {
    for (const attr of Array.from(newEl.attributes)) {
        if (oldEl.getAttribute(attr.name) !== attr.value) {
            oldEl.setAttribute(attr.name, attr.value);
        }
    }
    for (const attr of Array.from(oldEl.attributes)) {
        if (!newEl.hasAttribute(attr.name)) {
            oldEl.removeAttribute(attr.name);
        }
    }
}

function morphElement(oldEl: Element, newEl: Element): void {
    syncAttributes(oldEl, newEl);
    morphChildren(oldEl, newEl);
}

function morphChildren(oldParent: Element, newParent: Element): void {
    const oldNodes = Array.from(oldParent.childNodes).filter(
        (node) => !isOurs(node)
    );
    const newNodes = Array.from(newParent.childNodes);
    const max = Math.max(oldNodes.length, newNodes.length);

    for (let i = 0; i < max; i++) {
        const oldNode = oldNodes[i];
        const newNode = newNodes[i];

        if (!newNode) {
            oldNode.parentNode?.removeChild(oldNode);
            continue;
        }
        if (!oldNode) {
            // importNode of a DOMParser document never executes scripts — they
            // carry the parser-inserted "already started" flag — so adopting a
            // new subtree is safe by default.
            oldParent.appendChild(document.importNode(newNode, true));
            continue;
        }

        const sameKind =
            oldNode.nodeType === newNode.nodeType &&
            (oldNode.nodeType !== Node.ELEMENT_NODE ||
                (oldNode as Element).tagName === (newNode as Element).tagName);
        if (!sameKind) {
            oldParent.replaceChild(document.importNode(newNode, true), oldNode);
            continue;
        }

        if (
            oldNode.nodeType === Node.TEXT_NODE ||
            oldNode.nodeType === Node.COMMENT_NODE
        ) {
            if (oldNode.nodeValue !== newNode.nodeValue) {
                oldNode.nodeValue = newNode.nodeValue;
            }
            continue;
        }

        if (oldNode.nodeType === Node.ELEMENT_NODE) {
            const oldEl = oldNode as Element;
            const newEl = newNode as Element;

            if (oldEl.tagName === "SCRIPT") {
                // Never re-execute. Inline data payloads (type application/json,
                // e.g. __NEXT_DATA__) are synced as text so anything that reads
                // the document later sees the truth.
                const type = oldEl.getAttribute("type") || "";
                if (
                    type.includes("json") &&
                    oldEl.textContent !== newEl.textContent
                ) {
                    oldEl.textContent = newEl.textContent;
                }
                continue;
            }

            if (oldEl.tagName === "IFRAME") {
                // Any DOM surgery on an iframe reloads it; the ones the page
                // itself renders are left exactly as they are.
                continue;
            }

            morphElement(oldEl, newEl);
        }
    }
}

/**
 * Drops a canvas field selection that is no longer being edited.
 *
 * Routed through the SDK's own teardown rather than removing the clone by hand,
 * so the resize observer, the field toolbar, and the real element's visibility
 * are all restored the way the SDK expects. Same path the builder already uses
 * when it asks the canvas to drop focus.
 */
function clearStaleCanvasSelection(): void {
    try {
        hideOverlay({
            visualBuilderContainer: document.querySelector(
                ".visual-builder__container"
            ),
            visualBuilderOverlayWrapper: document.querySelector(
                ".visual-builder__overlay__wrapper"
            ),
            focusedToolbar: document.querySelector(
                ".visual-builder__focused-toolbar"
            ),
            // The teardown only calls `unobserve` on this, and unobserving a node
            // that was never observed does nothing. A throwaway keeps this module
            // from having to reach for the VisualBuilder instance's own observer.
            resizeObserver: new ResizeObserver(() => {}),
            noTrigger: true,
        });
    } catch (e) {
        // Losing the selection is not worth failing the refresh over.
    }
}

/**
 * Fetches the current URL and patches the changed parts into the live page.
 * Falls back to a real reload when the fetch or the morph cannot be trusted.
 */
export async function softReloadPage(): Promise<void> {
    // Selecting a text field on the canvas leaves an editable clone in place for
    // as long as that field stays selected, and the SDK hides the real element
    // behind it. So the clone, not the page, is what the user is looking at.
    //
    // Two different situations, and an earlier version of this conflated them.
    // If the clone has focus the user is typing, and morphing underneath would
    // fight them, so leave it alone: their own blur triggers another refresh a
    // moment later. If the clone is merely lying around unfocused, refusing to
    // morph means the canvas silently stops updating for the rest of the
    // session, which is far worse than the flicker it was guarding against.
    // Clear the stale selection instead, which un-hides the real element, then
    // refresh normally.
    const editable = document.querySelector<HTMLElement>(
        ".visual-builder__pseudo-editable-element, [data-cslp][contenteditable='true']"
    );
    if (editable) {
        if (
            editable.contains(document.activeElement) ||
            editable === document.activeElement
        ) {
            return;
        }
        clearStaleCanvasSelection();
    }

    try {
        const response = await fetch(window.location.href, {
            cache: "no-store",
            credentials: "same-origin",
            headers: { Accept: "text/html" },
        });
        if (!response.ok) {
            throw new Error(`fetch answered ${response.status}`);
        }

        const parsed = new DOMParser().parseFromString(
            await response.text(),
            "text/html"
        );

        // Next.js ships a flash-of-unstyled-content guard (body{display:none})
        // that its boot script removes after hydration. This document is past
        // that point, so morphing the guard back in would blank the page.
        parsed
            .querySelectorAll("[data-next-hide-fouc]")
            .forEach((el) => el.remove());

        // The head is deliberately left alone apart from the title: same
        // build, same stylesheets and bundles. The documentElement's
        // attributes are not synced either — the panel's page inset lives in
        // its inline style.
        if (parsed.title && parsed.title !== document.title) {
            document.title = parsed.title;
        }

        syncAttributes(document.body, parsed.body);
        morphChildren(document.body, parsed.body);
    } catch (error) {
        PublicLogger.warn(
            "Visual Builder could not refresh the page in place; reloading instead.",
            error
        );
        window.history.go();
    }
}
