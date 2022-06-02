/* eslint-disable no-useless-escape */

import morphdom from "morphdom";

export function rerunScriptsInDocument(): void {
    const scriptsInTheDOM = document.querySelectorAll("script");
    let scriptsLeftToExecute = scriptsInTheDOM.length;

    let scriptIndex = 0;

    function isScriptRemaining() {
        return scriptIndex < scriptsInTheDOM.length;
    }

    function decrementNumberOfScriptsLeft() {
        scriptsLeftToExecute--;

        if (scriptsLeftToExecute === 0) {
            window.parent.postMessage(
                {
                    from: "live-preview",
                    type: "document-body-post-scripts-loaded",
                    data: {
                        body: document.body.outerHTML,
                    },
                },
                "*"
            );
        }
    }

    function postScriptExecute() {
        scriptIndex++;
        decrementNumberOfScriptsLeft();
        executeNextScript();
    }
    function executeNextScript() {
        if (isScriptRemaining()) {
            const currentScript = scriptsInTheDOM[scriptIndex];

            const parent = currentScript.parentNode;
            const newScript = document.createElement("script");

            if (currentScript.src) {
                newScript.onerror = postScriptExecute;
                newScript.onload = postScriptExecute;
                newScript.src = currentScript.src;
            } else {
                newScript.text = currentScript.text;
                postScriptExecute();
            }
            parent?.replaceChild(newScript, currentScript);
        }
    }

    if (scriptsInTheDOM.length) {
        executeNextScript();
    }
}

export async function updateDocumentBody(
    document: Document,
    receivedHTML: string,
    options: {
        shouldReRunScripts: boolean;
        onPostOperation: () => void;
    }
): Promise<void> {
    const { shouldReRunScripts, onPostOperation } = options;

    if (!shouldReRunScripts) {
        replaceDocumentBody(receivedHTML, onPostOperation);
    } else {
        const existingIframes = document.querySelectorAll(
            "iframe#contentstack-live-preview-iframe"
        );

        existingIframes.forEach((existingFrame) => {
            existingFrame.remove();
        });

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.id = "contentstack-live-preview-iframe";

        // escape backticks and script tags
        const SCRIPT_AND_BACKTICKS = /(<\s*\/\s*script\s*>)|(`)/gm;

        const escapedHTML = receivedHTML.replace(
            SCRIPT_AND_BACKTICKS,
            (_substring, _scriptTag, backTick) => {
                if (backTick) {
                    return "\\`";
                } else {
                    return "<\\/script>";
                }
            }
        );

        iframe.srcdoc = `
        <head>
        <script>
            function prepareIframeForScriptRerun() {
                const responseHTML = \`${escapedHTML}\`;

                const html = document.getElementsByTagName("html").item(0);

                const rerunScriptsInDocument = ${rerunScriptsInDocument}

                if (html) {
                    html.innerHTML = responseHTML;
                    rerunScriptsInDocument();
                }
            }
            prepareIframeForScriptRerun()
        <\/script>
        </head>`;

        document.body.appendChild(iframe);
    }
}

export function replaceDocumentBody(
    newBody: string,
    onPostOperation?: () => void
): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(newBody, "text/html");

    morphdom(document.body, doc.body);
    if (onPostOperation) {
        onPostOperation();
    }
}
