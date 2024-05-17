import postRobot from "post-robot";
import { loadCompareGlobalStyle } from "./styles/compare";

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

export function handleWebCompare() {
    loadCompareGlobalStyle();
    postRobot.on("send-current-base-route", async () => {
        return { url: window.location.href.split("?")[0] };
    });

    postRobot.on("send-cslp-data", async () => {
        const elements = Array.from(document.querySelectorAll("[data-cslp]"));
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
        const elements = Array.from(document.querySelectorAll("[data-cslp]"));
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
}
