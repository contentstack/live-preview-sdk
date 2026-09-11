import { JSDOM } from "jsdom";
import {
    getEntryIdentifiersInCurrentPage,
    getEntryIdentifiersSignature,
} from "../getEntryIdentifiersInCurrentPage";

const dom = new JSDOM(`
<div>
    <nav class="menu"><ul class="nav-ul header-ul"><li class="nav-li"><a data-cslp="header.bltdaa9dd393f0b2e35.en-us.navigation_menu.0.label" aria-current="page" class="active active" href="/">Home</a></li><li class="nav-li"><a data-cslp="header.bltdaa9dd393f0b2e35.en-us.navigation_menu.1.label" class="" href="/about-us">About Us</a></li><li class="nav-li"><a data-cslp="header.bltdaa9dd393f0b2e35.en-us.navigation_menu.2.label" class="" href="/blog">Blog</a></li><li class="nav-li"><a data-cslp="header.bltdaa9dd393f0b2e35.en-us.navigation_menu.3.label" class="" href="/contact-us">Contact Us</a></li><li class="nav-li"><a class="" href="/page-test">Page test</a></li></ul></nav>
    <h1 data-cslp="page.bltf5bb5f8fb088a332.en-us.page_components.0.hero_banner.banner_title" class="hero-title">From here as well updated</h1>
    <div class="copyright cslp-edit-mode" data-cslp="footer.blt1cfcd36cefdd1ec6.en-us.copyright"><p>Copyright © 2022. LogoIpsum. All rights reserved.</p></div>
</div>
`);

const domWithDuplicate = new JSDOM(`
  <div>
    <h1 data-cslp="page.bltf5bb5f8fb088a332.en-us.page_components.0.hero_banner.banner_title" class="hero-title">From here as well updated</h1>
    <h1 data-cslp="page.bltf5bb5f8fb088a332.en-us.page_components.0.hero_banner.banner_title" class="hero-title">From here as well updated</h1>
  </div>
`);

const domWithNoCslp = new JSDOM(`
  <div>
    <h1 class="hero-title">From here as well updated</h1>
  </div>
`);

describe("getEntryIdentifiersInCurrentPage", () => {
    test("should return an empty array if no elements with data-cslp attribute are found", () => {
        document.body.innerHTML = "";
        const result = getEntryIdentifiersInCurrentPage();
        expect(result.entriesInCurrentPage).toEqual([]);
    });
    test("should return all entries in current page", () => {
        document.body.innerHTML = dom.window.document.body.innerHTML;
        const { entriesInCurrentPage } = getEntryIdentifiersInCurrentPage();
        expect(entriesInCurrentPage.length).toBe(3);
    });

    test("should return one entry if there are more than one element with same entry", () => {
        document.body.innerHTML =
            domWithDuplicate.window.document.body.innerHTML;
        const { entriesInCurrentPage } = getEntryIdentifiersInCurrentPage();
        expect(entriesInCurrentPage.length).toBe(1);
    });

    test("should return empty array if there are no cslp", () => {
        document.body.innerHTML = domWithNoCslp.window.document.body.innerHTML;
        const { entriesInCurrentPage } = getEntryIdentifiersInCurrentPage();
        expect(entriesInCurrentPage.length).toBe(0);
        expect(entriesInCurrentPage).toEqual([]);
    });

    test("should filter out elements with empty data-cslp attribute and not break", () => {
        document.body.innerHTML = `
            <div>
                <h1 data-cslp="">Empty CSLP</h1>
                <h2 data-cslp>Empty CSLP</h2>
                <h1 data-cslp="page.bltf5bb5f8fb088a332.en-us.page_components.0.hero_banner.banner_title">Valid CSLP</h1>
            </div>
        `;
        const { entriesInCurrentPage } = getEntryIdentifiersInCurrentPage();
        expect(entriesInCurrentPage.length).toBe(1);
        expect(entriesInCurrentPage[0].entryUid).toBe("bltf5bb5f8fb088a332");
    });
});

describe("getEntryIdentifiersInCurrentPage locale handling", () => {
    test("should keep the same entry in two locales as two results", () => {
        document.body.innerHTML = `
            <h1 data-cslp="page.blt1.en-us.title">EN</h1>
            <h1 data-cslp="page.blt1.fr-fr.title">FR</h1>
        `;
        const { entriesInCurrentPage } = getEntryIdentifiersInCurrentPage();
        expect(entriesInCurrentPage).toEqual([
            { entryUid: "blt1", contentTypeUid: "page", locale: "en-us" },
            { entryUid: "blt1", contentTypeUid: "page", locale: "fr-fr" },
        ]);
    });
});

describe("getEntryIdentifiersSignature", () => {
    test("should be order independent and change with the set", () => {
        const a = { entryUid: "blt1", contentTypeUid: "page", locale: "en-us" };
        const b = {
            entryUid: "blt2",
            contentTypeUid: "header",
            locale: "en-us",
        };
        expect(getEntryIdentifiersSignature([a, b])).toBe(
            getEntryIdentifiersSignature([b, a])
        );
        expect(getEntryIdentifiersSignature([a])).not.toBe(
            getEntryIdentifiersSignature([a, b])
        );
        expect(getEntryIdentifiersSignature([])).toBe("");
    });
});
