import type { IPageContext } from "./types";

declare global {
    interface Window {
        __CS_PAGE_CONTEXT__?: IPageContext;
    }
}

export {};
