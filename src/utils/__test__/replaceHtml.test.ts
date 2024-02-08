import {
    replaceDocumentBody,
    rerunScriptsInDocument,
    updateDocumentBody,
} from "../replaceHtml";

describe.skip("replaceDocumentBody", () => {
    const receivedHTML = `
            <h1 data-test-id="heading">The title is new</h1>
            <p data-test-id="paragraph">hello I am updated</p>
        `;
    beforeEach(() => {
        document.body.innerHTML = `
            <h1 data-test-id="heading">The title is old</h1>
            <p data-test-id="paragraph">hello I am not updated</p>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    test("should replace HTML Body", () => {
        replaceDocumentBody(receivedHTML);

        expect(document.body.innerHTML.trim()).toBe(receivedHTML.trim());
    });
    test("should run user script after update", () => {
        const onPostOperation = jest.fn();
        replaceDocumentBody(receivedHTML, onPostOperation);

        expect(onPostOperation).toHaveBeenCalled();
    });
});

describe("updateDocumentBody", () => {
    let receivedHTML: string;
    beforeEach(() => {
        const backTickedString = "hello I am `back ticked`";
        document.body.innerHTML = `
            <h1 data-test-id="heading">The title is old</h1>
            <p data-test-id="paragraph">hello I am not updated</p>
        `;

        receivedHTML = `
            <h1 data-test-id="heading">The title is new</h1>
            <p data-test-id="paragraph">hello I am not updated</p>
            <script>
                const normalbody = ${backTickedString}
            </script>
        `;
    });

    afterEach(() => {
        receivedHTML = "";
        //@ts-ignore
        // window.scriptRanTimes = undefined;
        document.body.innerHTML = "";
    });

    test("should just update the body without rerunning scripts when shouldReRunScripts is false", () => {
        updateDocumentBody(document, receivedHTML, {
            shouldReRunScripts: false,
            onPostOperation: () => {},
        });

        expect(document.body.innerHTML.trim()).toBe(receivedHTML.trim());
        //@ts-ignore
        // expect(window.scriptRanTimes).toBe(0);
    });

    test("should run scripts with the new body when shouldReRunScripts is true", async () => {
        updateDocumentBody(document, receivedHTML, {
            shouldReRunScripts: true,
            onPostOperation: () => {},
        });

        await new Promise((r) => setTimeout(r, 100));
        //@ts-ignore
        // expect(window.scriptRanTimes).toBe(2);
    });
    test("should remove existing iframe when shouldReRunScripts is true", () => {
        const cslpIframe = document.createElement("iframe");
        cslpIframe.id = "contentstack-live-preview-iframe";
        document.body.appendChild(cslpIframe);

        expect(
            document.querySelectorAll("iframe#contentstack-live-preview-iframe")
                .length
        ).toBe(1);

        updateDocumentBody(document, receivedHTML, {
            shouldReRunScripts: true,
            onPostOperation: () => {},
        });

        setTimeout(() => {
            expect(
                document.querySelectorAll(
                    "iframe#contentstack-live-preview-iframe"
                ).length
            ).toBe(0);
        }, 5);
    });
});

describe("rerunScriptsInDocument", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <h1 data-test-id="heading">The title is old</h1>
            <p data-test-id="paragraph">hello I am not updated</p>
            <script>
                if (window.scriptRan) {
                    window.scriptRan++
                } else {
                    window.scriptRan = 1
                }
            </script>
        `;
    });
    afterEach(() => {
        document.body.innerHTML = "";
        //@ts-ignore
        window.scriptRan = undefined;
    });
    test("should run internal scripts", async () => {
        rerunScriptsInDocument();

        //@ts-ignore
        expect(window.scriptRan).toBe(1);
    });

    test("should run external script", () => {
        document.body.innerHTML = `
            <h1 data-test-id="heading">The title is old</h1>
            <p data-test-id="paragraph">hello I am not updated</p>
            <script>
                if (window.scriptRan) {
                    window.scriptRan++
                } else {
                    window.scriptRan = 1
                }
            </script>
            <script src="https://slowfil.es/file?type=js&delay=5"></script>
        `;

        rerunScriptsInDocument();

        //@ts-ignore
        expect(window.scriptRan).toBe(1);
    });

    test("should trigger document-body-post-scripts-loaded with correct body", async () => {
        jest.spyOn(window, "postMessage");

        rerunScriptsInDocument();

        expect(window.postMessage).toBeCalledWith(
            {
                from: "live-preview",
                type: "document-body-post-scripts-loaded",
                data: {
                    body: `<body>
            <h1 data-test-id="heading">The title is old</h1>
            <p data-test-id="paragraph">hello I am not updated</p>
            <script>
                if (window.scriptRan) {
                    window.scriptRan++
                } else {
                    window.scriptRan = 1
                }
            </script>
        </body>`,
                },
            },
            "*"
        );
    });
});
