import { hasWindow } from "../utils";

export function inIframe(): boolean {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

export function inVisualEditor(): boolean{
    try {
        return inIframe() && window?.name == 'visual-editor'
    } catch (e) {
        return false;
    }
}

export function isOpeningInNewTab(): boolean {
    try {
        if(hasWindow()) {
            return !!window.opener;
        }
        return false;
    } catch (e) {
        return false;
    }
}
