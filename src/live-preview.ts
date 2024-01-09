import packageJson from "../package.json";
import { VisualEditor } from "./liveEditor";
import {
    IEditButtonPosition,
    IEditEntrySearchParams,
    IInitData,
    ILivePreviewModeConfig,
    ILivePreviewReceivePostMessages,
} from "./types/types";
import {
    addLivePreviewQueryTags,
    createMultipleEditButton,
    createSingularEditButton,
    getEditButtonPosition,
} from "./utils";
import Config from "./utils/configHandler";
import { getUserInitData } from "./utils/defaults";
import { PublicLogger } from "./utils/public-logger";
import { replaceDocumentBody, updateDocumentBody } from "./utils/replaceHtml";

export default class LivePreview {
    /**
     * @hideconstructor
     */

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

    constructor(initData: Partial<IInitData> = getUserInitData()) {
        Config.replace(initData);
        const config = Config.get();

        this.addEditStyleOnHover = this.addEditStyleOnHover.bind(this);
        this.generateRedirectUrl = this.generateRedirectUrl.bind(this);
        this.scrollHandler = this.scrollHandler.bind(this);
        this.linkClickHandler = this.linkClickHandler.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.setOnChangeCallback = this.setOnChangeCallback.bind(this);
        this.resolveIncomingMessage = this.resolveIncomingMessage.bind(this);
        this.createCslpTooltip = this.createCslpTooltip.bind(this);
        this.requestDataSync = this.requestDataSync.bind(this);
        this.updateTooltipPosition = this.updateTooltipPosition.bind(this);
        this.removeDataCslp = this.removeDataCslp.bind(this);

        // @ts-ignore
        if (initData.debug) {
            PublicLogger.debug(
                "Contentstack Live Preview Debugging mode: config --",
                config
            );
        }

        if (config.enable) {
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
            // render the hover outline only when edit button enable
            if (config.editButton.enable) {
                window.addEventListener("mouseover", this.addEditStyleOnHover);
            }

            if (config.ssr) {
                window.addEventListener("load", (e) => {
                    const allATags = document.querySelectorAll("a");
                    allATags.forEach((tag) => {
                        const docOrigin: string = document.location.origin;
                        if (tag.href && tag.href.includes(docOrigin)) {
                            const newUrl = addLivePreviewQueryTags(tag.href);
                            tag.href = newUrl;
                        }
                    });
                });

                // Setting the query params to all the click events related to current domain
                window.addEventListener("click", (event: any) => {
                    const target: any = event.target;
                    const targetHref: string | any = target.href;
                    const docOrigin: string = document.location.origin;
                    if (
                        targetHref &&
                        targetHref.includes(docOrigin) &&
                        !targetHref.includes("live_preview")
                    ) {
                        const newUrl = addLivePreviewQueryTags(target.href);
                        event.target.href = newUrl || target.href;
                    }
                });
            }

            if (config.mode >= ILivePreviewModeConfig.EDITOR) {
                new VisualEditor();
            }
        } else if (config.cleanCslpOnProduction) {
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
        const config = Config.get();
        if (!config.stackDetails.apiKey) {
            throw `To use edit tags, you must provide the stack API key. Specify the API key while initializing the Live Preview SDK.

                ContentstackLivePreview.init({
                    ...,
                    stackDetails: {
                        apiKey: 'your-api-key'
                    },
                    ...
                })`;
        }

        if (!config.stackDetails.environment) {
            throw `To use edit tags, you must provide the preview environment. Specify the preview environment while initializing the Live Preview SDK.

                ContentstackLivePreview.init({
                    ...,
                    stackDetails: {
                        environment: 'Your-environment'
                    },
                    ...
                })`;
        }

        const protocol = String(config.clientUrlParams.protocol);
        const host = String(config.clientUrlParams.host);
        const port = String(config.clientUrlParams.port);
        const environment = String(config.stackDetails.environment);

        const urlHash = `!/stack/${
            config.stackDetails.apiKey
        }/content-type/${content_type_uid}/${
            locale ?? "en-us"
        }/entry/${entry_uid}/edit`;

        const url = new URL(`${protocol}://${host}`);
        url.port = port;
        url.hash = urlHash;
        url.searchParams.append("preview-field", preview_field);
        url.searchParams.append("preview-locale", locale ?? "en-us");
        url.searchParams.append("preview-environment", environment);

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

    private handleUserChange(editEntrySearchParams: IEditEntrySearchParams) {
        const config = Config.get();
        // here we provide contentTypeUid and EntryUid to the StackDelivery SDK.
        const stackSdkLivePreviewConfig = {
            ...config.stackSdk.live_preview,
            ...editEntrySearchParams,
            live_preview: editEntrySearchParams.hash,
        };
        Config.set("stackSdk.live_preview", stackSdkLivePreviewConfig);
        config.onChange();
    }

    setOnChangeCallback(onChangeCallback: () => void): void {
        Config.set("onChange", onChangeCallback);
    }

    /**
     * It is the live preview hash.
     * This hash could be used when data is fetched manually.
     */
    get hash(): string {
        return Config.get().hash;
    }

    /**
     * Sets the live preview hash from the query param which is
     * accessible via `hash` property.
     * @param params query param in an object form
     */
    setConfigFromParams(
        params: ConstructorParameters<typeof URLSearchParams>[0] = {}
    ): void {
        if (typeof params !== "object")
            throw new TypeError(
                "Live preview SDK: query param must be an object"
            );

        const urlParams = new URLSearchParams(params);
        const live_preview = urlParams.get("live_preview");

        if (live_preview) {
            Config.set("hash", live_preview);
        }
    }

    private resolveIncomingMessage(
        e: MessageEvent<ILivePreviewReceivePostMessages>
    ) {
        if (typeof e.data !== "object") return;

        if (e.data.from !== "live-preview") return;

        const config = Config.get();

        switch (e.data.type) {
            case "client-data-send": {
                const { contentTypeUid, entryUid } = config.stackDetails;
                const { hash } = e.data.data;

                this.setConfigFromParams({ live_preview: hash });

                if (config.ssr) {
                    // Get the content from the server and replace the body

                    const fetch_url = new URL(window.location.href);

                    fetch_url.searchParams.append("live_preview", hash);
                    fetch_url.searchParams.append(
                        "content_type_uid",
                        contentTypeUid
                    );
                    fetch_url.searchParams.append("entry_uid", entryUid);

                    fetch(fetch_url.toString(), {
                        method: "GET",
                    })
                        .then((res) => res.text())
                        .then((res) => {
                            updateDocumentBody(document, res, {
                                onPostOperation: this.createCslpTooltip,
                                shouldReRunScripts: config.runScriptsOnUpdate,
                            });
                        });
                } else {
                    this.handleUserChange({
                        content_type_uid: contentTypeUid,
                        entry_uid: entryUid,
                        hash: hash,
                    });
                }
                break;
            }
            case "init-ack": {
                const { contentTypeUid, entryUid } = e.data.data;

                config.stackDetails.contentTypeUid = contentTypeUid;
                config.stackDetails.entryUid = entryUid;
                break;
            }
            case "history": {
                switch (e.data.data.type) {
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
            case "document-body-post-scripts-loaded": {
                const { body } = e.data.data;
                replaceDocumentBody(body, this.createCslpTooltip);
            }
        }
    }

    private createCslpTooltip = () => {
        const config = Config.get();
        if (
            !document.getElementById("cslp-tooltip") &&
            config.editButton.enable
        ) {
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
        const config = Config.get();
        this.handleUserChange({
            live_preview: "init", // this is the hash of the live previewd
        });

        // add edit tooltip
        this.createCslpTooltip();

        window.parent.postMessage(
            {
                from: "live-preview",
                type: "init",
                data: {
                    config: {
                        shouldReload: config.ssr,
                        href: window.location.href,
                        sdkVersion: packageJson.version,
                    },
                },
            },
            "*"
        );

        // set timeout for client side (use to show warning: You are not editing this page)
        if (!config.ssr) {
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

        const config = Config.get();

        const currentRectOfElement =
            this.currentElementBesideTooltip.getBoundingClientRect();
        const currentRectOfParentOfElement =
            this.tooltip.parentElement?.getBoundingClientRect();

        if (currentRectOfElement && currentRectOfParentOfElement) {
            let {
                upperBoundOfTooltip,
                // eslint-disable-next-line prefer-const
                leftBoundOfTooltip,
            }: IEditButtonPosition = getEditButtonPosition(
                this.currentElementBesideTooltip,
                config.editButton.position
            );

            // if scrolled and element is still visible, make sure tooltip is also visible
            if (upperBoundOfTooltip < 0) {
                if (currentRectOfElement.top < 0)
                    upperBoundOfTooltip = currentRectOfElement.top;
                else upperBoundOfTooltip = 0;
            }

            this.tooltip.style.top = upperBoundOfTooltip + "px";
            this.tooltip.style.zIndex =
                this.currentElementBesideTooltip.style.zIndex || "200";
            this.tooltip.style.left = leftBoundOfTooltip + "px";

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
            node.removeAttribute("data-cslp-button-position");
        });
    }
}
