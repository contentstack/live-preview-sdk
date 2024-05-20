export function registerCompareElement() {
    class Compare extends HTMLSpanElement {
        constructor() {
            super();
        }
    }

    customElements.define("cs-compare", Compare);
}
