import Config from "../../configManager/configManager";
import type { IPageContext } from "../../types/types";

type PageContextSource = Partial<IPageContext> | null | undefined;

const PAGE_CONTEXT_META_NAMES: Record<keyof IPageContext, string> = {
    entryUid: "contentstack:entry-uid",
    contentTypeUid: "contentstack:content-type-uid",
    compositionUid: "contentstack:composition-uid",
};

function readMetaTag(name: string): string | undefined {
    return (
        document
            .querySelector(`meta[name="${name}"]`)
            ?.getAttribute("content") ?? undefined
    );
}

// Meta tags are kept as a fallback because:
// - Next.js App Router's metadata/generateMetadata() and Nuxt's useHead() produce
//   <meta> tags natively — there is no built-in hook for injecting window globals.
// - Strict CSP policies (no unsafe-inline) block inline <script> tags, but never meta tags.
function pageContextFromMetaTags(): Partial<IPageContext> {
    return {
        entryUid: readMetaTag(PAGE_CONTEXT_META_NAMES.entryUid),
        contentTypeUid: readMetaTag(PAGE_CONTEXT_META_NAMES.contentTypeUid),
        compositionUid: readMetaTag(PAGE_CONTEXT_META_NAMES.compositionUid),
    };
}

export function resolvePageContext(): {
    entryUid: string | undefined;
    contentTypeUid: string | undefined;
    compositionUid: string | undefined;
} {
    // In order of precedence: setPageContext(), the page global, meta tags.
    const sources: PageContextSource[] = [
        Config.get().pageContext,
        window.__CS_PAGE_CONTEXT__,
        pageContextFromMetaTags(),
    ];
    const firstOf = (field: keyof IPageContext) =>
        sources.find((source) => source?.[field] != null)?.[field] ??
        undefined;

    return {
        entryUid: firstOf("entryUid"),
        contentTypeUid: firstOf("contentTypeUid"),
        // Only from the source that named the entry: a template announced by
        // one script must not be paired with an entry the site set elsewhere.
        compositionUid:
            sources.find((source) => source?.entryUid != null)
                ?.compositionUid ?? undefined,
    };
}
