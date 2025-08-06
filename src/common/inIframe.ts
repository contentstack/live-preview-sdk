export function inIframe(): boolean {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

export function inNewTab(): boolean {
    try {
        return !!window.opener;
    } catch (e) {
        return false;
    }
}
