import {
    createSingularEditButton,
    createMultipleEditButton,
} from "./utils";
import { IConfig, IEntryValue, IInitData } from "./utils/types";
import morphdom from "morphdom";
import { handleInitData } from "./utils/handleUserConfig";
import { userInitData } from "./utils/defaults";

export default class LivePreview {
    /**
     * @hideconstructor
     */

    private config: IConfig = {
        shouldReload: true,
        enable: true,
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
            url: "https://app.contentstack.com:443"
        },
        stackSdk: {
            config: {
                live_preview: {},
            },
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


    constructor(
        initData: Partial<IInitData> = userInitData,
    ) {
        handleInitData(initData, this.config);


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

    private addEditStyleOnHover = (e: MouseEvent) => {
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
                    this.tooltip?.setAttribute(
                        "current-data-cslp",
                        cslpTag
                    );
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
    };

    private scrollHandler = () => {
        if (!this.tooltip) return;

        const cslpTag = this.tooltip.getAttribute("current-data-cslp");

        if (cslpTag) {
            const [content_type_uid, entry_uid, locale, ...field] = cslpTag.split(".");

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
                                locale
                            },
                        },
                        "*"
                    );
            } else {
                const protocol =
                    String(this.config.clientUrlParams.protocol) + "://";
                let host = String(this.config.clientUrlParams.host);
                if (host.endsWith('/')) {
                    host = host.slice(0,-1)
                }
                const port = ":" + String(this.config.clientUrlParams.port);

                const redirectUrl = `${protocol}${host}${port}/#!/stack/${this.config.stackDetails.apiKey
                    }/content-type/${content_type_uid}/${locale ?? 'en-us'}/entry/${entry_uid}/edit?preview-url=${window.location.origin
                    }&preview-field=${field.join(".")}`;

                window.open(redirectUrl, "_blank");
            }
        }
    };

    private linkClickHandler = () => {
        if (!this.tooltip) return;

        const hrefAttribute = this.tooltip.getAttribute("current-href");

        if (hrefAttribute) {
            window.location.href = hrefAttribute;
        }
    };

    private handleUserChange = (entryEditParams: IEntryValue) => {
        // here we provide contentTypeUid and EntryUid to the StackDelivery SDK.
        this.config.stackSdk.config.live_preview = {
            ...this.config.stackSdk.config.live_preview,
            ...entryEditParams,

        }
        this.config.onChange();
    };

    setOnChangeCallback = (onChangeCallback: () => void): void => {
        this.config.onChange = onChangeCallback;
    };

    private updateDocumentBody (receivedBody: string) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(receivedBody, "text/html");
        morphdom(document.body, doc.body);
        this.createCslpTooltip()
    }

    private resolveIncomingMessage(e: MessageEvent) {
        if (typeof e.data !== "object") return;
        const { type, from, data } = e.data;

        if (from !== "live-preview") return;

        switch (type) {
            case "client-data-send": {
                if (this.config.shouldReload) {
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

    private createCslpTooltip() {
        if (!document.getElementById("cslp-tooltip")) {
            const tooltip = document.createElement("button");
            tooltip.classList.add("cslp-tooltip");
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
        this.updateTooltipPosition()
    }

    // Request parent for data sync when document loads
    private requestDataSync = () => {
        this.handleUserChange({
            hash: "init",
        });

        // add edit tooltip
        this.createCslpTooltip()

        window.parent.postMessage(
            {
                from: "live-preview",
                type: "init",
                data: {
                    config: {
                        shouldReload: this.config.shouldReload,
                        href: window.location.href
                    },
                },
            },
            "*"
        );

        // set timeout for client side (use to show warning: You are not editing this page)
        if (!this.config.shouldReload) {
            setInterval(() => {
                window.parent.postMessage(
                    {
                        from: "live-preview",
                        type: "check-entry-page",
                        data: {
                            href: window.location.href
                        },
                    },
                    "*"
                );
            }, 1500)

        }
    };

    private updateTooltipPosition = () => {
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
    };

    // remove attributes when livePreview is false
    private removeDataCslp() {
        const nodes = document.querySelectorAll("[data-cslp]");

        nodes.forEach((node) => {
            node.removeAttribute("data-cslp");
        });
    }
}
