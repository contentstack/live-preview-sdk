const DIFF_WRAPPER = "cs-compare";

export function registerCompareElement() {
    class Compare extends HTMLSpanElement {
        constructor() {
            super();
        }
    }

    if (!customElements.get(DIFF_WRAPPER)) {
        customElements.define(DIFF_WRAPPER, Compare, {
            extends: "span",
        });
    }
}
