import Config from "../../configManager/configManager";

// Meta tags are kept as a fallback because:
// - Next.js App Router's metadata/generateMetadata() and Nuxt's useHead() produce
//   <meta> tags natively — there is no built-in hook for injecting window globals.
// - Strict CSP policies (no unsafe-inline) block inline <script> tags, but never meta tags.
export function resolvePageContext(): {
    entryUid: string | undefined;
    contentTypeUid: string | undefined;
} {
    const configCtx = Config.get().pageContext;
    return {
        entryUid:
            configCtx?.entryUid ??
            window.__CS_PAGE_CONTEXT__?.entryUid ??
            document
                .querySelector('meta[name="contentstack:entry-uid"]')
                ?.getAttribute("content") ??
            undefined,
        contentTypeUid:
            configCtx?.contentTypeUid ??
            window.__CS_PAGE_CONTEXT__?.contentTypeUid ??
            document
                .querySelector('meta[name="contentstack:content-type-uid"]')
                ?.getAttribute("content") ??
            undefined,
    };
}
