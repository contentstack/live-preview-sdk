import { JSDOM } from "jsdom";
import { getEntryUidFromCurrentPage } from "../getEntryUidFromCurrentPage";

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

describe("getFieldType", () => {
    test("should return all entries in current page", () => {
        document.body.innerHTML = dom.window.document.body.innerHTML;
        const { entryUidsInCurrentPage } = getEntryUidFromCurrentPage();
        expect(entryUidsInCurrentPage.length).toBe(3);
    });

    test("should return one entry if there are more than one element with same entry", () => {
        document.body.innerHTML =
            domWithDuplicate.window.document.body.innerHTML;
        const { entryUidsInCurrentPage } = getEntryUidFromCurrentPage();
        expect(entryUidsInCurrentPage.length).toBe(1);
    });

    test("should return empty array if there are no cslp", () => {
        document.body.innerHTML = domWithNoCslp.window.document.body.innerHTML;
        const { entryUidsInCurrentPage } = getEntryUidFromCurrentPage();
        expect(entryUidsInCurrentPage.length).toBe(0);
        expect(entryUidsInCurrentPage).toEqual([]);
    });
});
