import { createSingularEditButton, createMultipleEditButton } from "./utils";
import { PublicLogger } from "./utils/public-logger";
import { IConfig, IEntryValue, IInitData } from "./utils/types";
import morphdom from "morphdom";
import { handleInitData } from "./utils/handleUserConfig";
import { userInitData } from "./utils/defaults";

export default class LivePreview {
    /**
     * @hideconstructor
     */

    private config: IConfig = {
        ssr: true,
        enable: false,
        cleanCslpOnProduction: true,

        stackDetails: {
            apiKey: "",
            environment: "",
            contentTypeUid: "",
            entryUid: "",
        },

        clientUrlParams: {
            protocol: "https",
            host: "app.contentstack.com",
            port: 443,
            url: "https://app.contentstack.com:443",
        },
        stackSdk: {
            live_preview: {},
            headers: {
                api_key: "",
            },
            environment: "",
        },

        onChange: () => {
            // this is intentional
        },
    };

    private tooltip: HTMLButtonElement | null = null; // this tooltip is responsible to redirect user to Contentstack edit page
    private currentElementBesideTooltip: HTMLElement | null = null; // this element helps to move tooltip with the scroll

    private tooltipChild: {
        singular: HTMLDivElement | null;
        multiple: HTMLDivElement | null;
    } = {
        singular: null,
        multiple: null,
    };
    private tooltipCurrentChild: "multiple" | "singular" = "singular";

    constructor(initData: Partial<IInitData> = userInitData) {
        handleInitData(initData, this.config);

        this.addEditStyleOnHover = this.addEditStyleOnHover.bind(this);
        this.generateRedirectUrl = this.generateRedirectUrl.bind(this);
        this.scrollHandler = this.scrollHandler.bind(this);
        this.linkClickHandler = this.linkClickHandler.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.setOnChangeCallback = this.setOnChangeCallback.bind(this);
        this.updateDocumentBody = this.updateDocumentBody.bind(this);
        this.resolveIncomingMessage = this.resolveIncomingMessage.bind(this);
        this.createCslpTooltip = this.createCslpTooltip.bind(this);
        this.requestDataSync = this.requestDataSync.bind(this);
        this.updateTooltipPosition = this.updateTooltipPosition.bind(this);
        this.removeDataCslp = this.removeDataCslp.bind(this);

        // @ts-ignore
        if (initData.debug) {
            PublicLogger.debug(
                "Contentstack Live Preview Debugging mode: config --",
                this.config
            );
        }

        if (this.config.enable) {
            if (
                typeof document !== undefined &&
                document.readyState === "complete"
            ) {
                this.requestDataSync();
            } else {
                window.addEventListener("load", this.requestDataSync);
            }
            window.addEventListener("message", this.resolveIncomingMessage);
            window.addEventListener("scroll", this.updateTooltipPosition);
            window.addEventListener("mouseover", this.addEditStyleOnHover);
        } else if (this.config.cleanCslpOnProduction) {
            this.removeDataCslp();
        }
    }

    private addEditStyleOnHover(e: MouseEvent) {
        let trigger = true;
        const eventTargets = e.composedPath();

        for (const eventTarget of eventTargets) {
            const element = eventTarget as HTMLElement;
            if (element.nodeName === "BODY") break;
            if (typeof element?.getAttribute !== "function") continue;

            const cslpTag = element.getAttribute("data-cslp");

            if (trigger && cslpTag) {
                if (this.currentElementBesideTooltip)
                    this.currentElementBesideTooltip.classList.remove(
                        "cslp-edit-mode"
                    );
                element.classList.add("cslp-edit-mode");
                this.currentElementBesideTooltip = element;

                if (this.updateTooltipPosition()) {
                    this.tooltip?.setAttribute("current-data-cslp", cslpTag);
                    this.tooltip?.setAttribute(
                        "current-href",
                        element.getAttribute("href") ?? ""
                    );
                }

                trigger = false;
            } else if (!trigger) {
                element.classList.remove("cslp-edit-mode");
            }
        }
    }

    private generateRedirectUrl(
        content_type_uid: string,
        locale = "en-us",
        entry_uid: string,
        preview_field: string
    ): string {
        if (!this.config.stackDetails.apiKey) {
            throw `To use edit tags, you must provide the stack API key. Specify the API key while initializing the Live Preview SDK.

                ContentstackLivePreview.init({
                    ...,
                    stackDetails: {
                        apiKey: 'your-api-key'
                    },
                    ...
                })`;
        }

        const protocol = String(this.config.clientUrlParams.protocol);
        const host = String(this.config.clientUrlParams.host);
        const port = String(this.config.clientUrlParams.port);

        const urlHash = `!/stack/${
            this.config.stackDetails.apiKey
        }/content-type/${content_type_uid}/${
            locale ?? "en-us"
        }/entry/${entry_uid}/edit`;

        const url = new URL(`${protocol}://${host}`);
        url.port = port;
        url.hash = urlHash;
        url.searchParams.append("preview-field", preview_field);
        url.searchParams.append("preview-url", window.location.origin);

        return `${url.origin}/${url.hash}${url.search}`;
    }

    private scrollHandler() {
        if (!this.tooltip) return;

        const cslpTag = this.tooltip.getAttribute("current-data-cslp");

        if (cslpTag) {
            const [content_type_uid, entry_uid, locale, ...field] =
                cslpTag.split(".");

            // check if opened inside an iframe
            if (window.location !== window.parent.location) {
                window.parent.postMessage(
                    {
                        from: "live-preview",
                        type: "scroll",
                        data: {
                            field: field.join("."),
                            content_type_uid,
                            entry_uid,
                            locale,
                        },
                    },
                    "*"
                );
            } else {
                try {
                    const redirectUrl = this.generateRedirectUrl(
                        content_type_uid,
                        locale,
                        entry_uid,
                        field.join(".")
                    );

                    window.open(redirectUrl, "_blank");
                } catch (error) {
                    PublicLogger.error(error);
                }
            }
        }
    }

    private linkClickHandler() {
        if (!this.tooltip) return;
        const hrefAttribute = this.tooltip.getAttribute("current-href");

        if (hrefAttribute) {
            window.location.assign(hrefAttribute);
        }
    }

    private handleUserChange(entryEditParams: IEntryValue) {
        // here we provide contentTypeUid and EntryUid to the StackDelivery SDK.
        this.config.stackSdk.live_preview = {
            ...this.config.stackSdk.live_preview,
            ...entryEditParams,
            live_preview: entryEditParams.hash,
        };
        this.config.onChange();
    }

    setOnChangeCallback(onChangeCallback: () => void): void {
        this.config.onChange = onChangeCallback;
    }

    private updateDocumentBody(receivedBody: string) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(receivedBody, "text/html");
        morphdom(document.body, doc.body);
        this.createCslpTooltip();
    }

    private resolveIncomingMessage(e: MessageEvent) {
        if (typeof e.data !== "object") return;
        const { type, from, data } = e.data;

        if (from !== "live-preview") return;

        switch (type) {
            case "client-data-send": {
                if (this.config.ssr) {
                    const body = data.body;
                    if (body) this.updateDocumentBody(body);
                } else {
                    this.handleUserChange(data);
                }
                break;
            }
            case "init-ack": {
                const { contentTypeUid, entryUid } = data;

                this.config.stackDetails.contentTypeUid = contentTypeUid;
                this.config.stackDetails.entryUid = entryUid;
                break;
            }
            case "history": {
                switch (data.type) {
                    case "forward": {
                        window.history.forward();
                        break;
                    }
                    case "backward": {
                        window.history.back();
                        break;
                    }
                    case "reload": {
                        window.history.go();
                    }
                }
                break;
            }
        }
    }

    private createCslpTooltip = () => {
        if (!document.getElementById("cslp-tooltip")) {
            const tooltip = document.createElement("button");
            tooltip.classList.add("cslp-tooltip");
            tooltip.setAttribute("data-test-id", "cs-cslp-tooltip");
            tooltip.id = "cslp-tooltip";
            window.document.body.insertAdjacentElement("beforeend", tooltip);
            this.tooltipChild.singular = createSingularEditButton(
                this.scrollHandler
            );
            this.tooltipChild.multiple = createMultipleEditButton(
                this.scrollHandler,
                this.linkClickHandler
            );

            tooltip.innerHTML = "";
            tooltip.appendChild(this.tooltipChild.singular);
            this.tooltip = tooltip;
        }
        this.updateTooltipPosition();
    };

    // Request parent for data sync when document loads
    private requestDataSync() {
        this.handleUserChange({
            live_preview: "init", // this is the hash of the live preview
        });

        // add edit tooltip
        this.createCslpTooltip();

        window.parent.postMessage(
            {
                from: "live-preview",
                type: "init",
                data: {
                    config: {
                        shouldReload: this.config.ssr,
                        href: window.location.href,
                    },
                },
            },
            "*"
        );

        // set timeout for client side (use to show warning: You are not editing this page)
        if (!this.config.ssr) {
            setInterval(() => {
                window.parent.postMessage(
                    {
                        from: "live-preview",
                        type: "check-entry-page",
                        data: {
                            href: window.location.href,
                        },
                    },
                    "*"
                );
            }, 1500);
        }
    }

    private updateTooltipPosition() {
        if (!this.currentElementBesideTooltip || !this.tooltip) return false;

        const currentRectOfElement =
            this.currentElementBesideTooltip.getBoundingClientRect();
        const currentRectOfParentOfElement =
            this.tooltip.parentElement?.getBoundingClientRect();

        if (currentRectOfElement && currentRectOfParentOfElement) {
            let top = currentRectOfElement.top - 40;
            const left = currentRectOfElement.left - 5;

            // if scrolled and element is still visible, make sure tooltip is also visible
            if (top < 0) {
                if (currentRectOfElement.top < 0)
                    top = currentRectOfElement.top;
                else top = 0;
            }

            this.tooltip.style.top = top + "px";
            this.tooltip.style.zIndex =
                this.currentElementBesideTooltip.style.zIndex || "200";
            this.tooltip.style.left = left + "px";

            if (this.tooltipChild.singular && this.tooltipChild.multiple) {
                if (this.currentElementBesideTooltip.hasAttribute("href")) {
                    if (this.tooltipCurrentChild !== "multiple") {
                        this.tooltip.innerHTML = "";
                        this.tooltip.appendChild(this.tooltipChild.multiple);
                        this.tooltipCurrentChild = "multiple";
                    }
                } else if (this.tooltipCurrentChild !== "singular") {
                    this.tooltip.innerHTML = "";
                    this.tooltip.appendChild(this.tooltipChild.singular);
                    this.tooltipCurrentChild = "singular";
                }
            }

            return true;
        }

        return false;
    }

    // remove attributes when livePreview is false
    private removeDataCslp() {
        const nodes = document.querySelectorAll("[data-cslp]");

        nodes.forEach((node) => {
            node.removeAttribute("data-cslp");
        });
    }
}
