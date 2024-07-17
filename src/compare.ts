import postRobot from "post-robot";
import { loadCompareGlobalStyle } from "./styles/compare";
import { registerCompareElement } from "./utils/compare";

const voidElements = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
]);

const LEAF_CSLP_SELECTOR = "[data-cslp]:not(:has([data-cslp]))";

export function handleWebCompare() {
    loadCompareGlobalStyle();
    registerCompareElement();
    postRobot.on("send-current-base-route", async () => {
        return { url: window.location.href.split("?")[0] };
    });

    postRobot.on("send-cslp-data", async () => {
        const elements = Array.from(
            document.querySelectorAll(LEAF_CSLP_SELECTOR)
        );
        const map: Record<string, string> = {};
        for (const element of elements) {
            const cslp = element.getAttribute("data-cslp")!;
            if (
                element.hasAttributes() &&
                voidElements.has(element.tagName.toLowerCase())
            ) {
                let attributes = "";
                for (const attr of element.attributes) {
                    attributes += `${attr.name} -> ${attr.value}\n`;
                }
                map[cslp] = attributes;
            } else {
                map[cslp] = element.innerHTML;
            }
        }
        return map;
    });

    const mergeColors = (className = ".cs-compare--added") => {
        const elements = Array.from(document.querySelectorAll(className));
        for (let i = 1; i < elements.length; i++) {
            const prev = elements[i - 1];
            const next = elements[i];
            if (prev.nextElementSibling === next)
                prev.appendChild(prev.nextSibling!);
        }
    };

    postRobot.on("diff-value", async ({ data }) => {
        const { diff, type } = data;
        const operation = type === "base" ? "removed" : "added";
        const elements = Array.from(
            document.querySelectorAll(LEAF_CSLP_SELECTOR)
        );
        for (const element of elements) {
            const path = element.getAttribute("data-cslp")!;
            if (!diff[path]) continue;

            if (voidElements.has(element.tagName.toLowerCase())) {
                element.classList.add(`cs-compare__void--${operation}`);
            } else {
                element.innerHTML = diff[path];
            }
        }

        mergeColors(`.cs-compare--${operation}`);
    });

    postRobot.on("remove-diff", async () => {
        // unwrap the cs-compare tags
        const elements = Array.from(document.querySelectorAll("cs-compare"));
        for (const element of elements) {
            const parent = element.parentElement!;
            while (element.firstChild) {
                parent.insertBefore(element.firstChild, element);
            }
            parent.removeChild(element);
        }
        // remove classes cs-compare__void--added and cs-compare__void--removed
        const voidElements = Array.from(
            document.querySelectorAll(
                ".cs-compare__void--added, .cs-compare__void--removed"
            )
        );
        for (const element of voidElements) {
            element.classList.remove("cs-compare__void--added");
            element.classList.remove("cs-compare__void--removed");
        }
    });
}
