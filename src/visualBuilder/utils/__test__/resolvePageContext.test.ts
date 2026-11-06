import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Config from "../../../configManager/configManager";
import type { IPageContext } from "../../../types/types";
import { resolvePageContext } from "../resolvePageContext";

vi.mock("../../../configManager/configManager");

const SITE_CONTEXT: IPageContext = {
    entryUid: "entry-from-site",
    contentTypeUid: "ct-from-site",
};
const GLOBAL_CONTEXT: IPageContext = {
    entryUid: "entry-from-global",
    contentTypeUid: "ct-from-global",
};

function givenSetPageContext(pageContext: IPageContext | null) {
    vi.mocked(Config.get).mockReturnValue({
        pageContext,
    } as ReturnType<typeof Config.get>);
}

function givenMetaTags() {
    document.head.innerHTML =
        '<meta name="contentstack:entry-uid" content="entry-from-meta">' +
        '<meta name="contentstack:content-type-uid" content="ct-from-meta">';
}

describe("resolvePageContext precedence", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        delete window.__CS_PAGE_CONTEXT__;
        document.head.innerHTML = "";
    });

    it("prefers setPageContext() over the page global and meta tags, so the entry the site set at runtime is the one Start Editing and the init handshake use", () => {
        givenSetPageContext(SITE_CONTEXT);
        window.__CS_PAGE_CONTEXT__ = GLOBAL_CONTEXT;
        givenMetaTags();

        const { entryUid, contentTypeUid } = resolvePageContext();

        expect(entryUid).toBe("entry-from-site");
        expect(contentTypeUid).toBe("ct-from-site");
    });

    it("prefers the page global over meta tags when setPageContext() was not called, so a script-set context beats static markup", () => {
        givenSetPageContext(null);
        window.__CS_PAGE_CONTEXT__ = GLOBAL_CONTEXT;
        givenMetaTags();

        const { entryUid, contentTypeUid } = resolvePageContext();

        expect(entryUid).toBe("entry-from-global");
        expect(contentTypeUid).toBe("ct-from-global");
    });

    it("falls back to meta tags when no script set a context, so sites that can only render <meta> still name their entry", () => {
        givenSetPageContext(null);
        givenMetaTags();

        const { entryUid, contentTypeUid } = resolvePageContext();

        expect(entryUid).toBe("entry-from-meta");
        expect(contentTypeUid).toBe("ct-from-meta");
    });
});
