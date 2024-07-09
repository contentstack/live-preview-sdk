import {
    createSingularEditButton,
    createMultipleEditButton,
    addLivePreviewQueryTags,
    shouldRenderEditButton,
    getEditButtonPosition,
} from "./utils";
import { PublicLogger } from "./utils/public-logger";
import {
    IConfig,
    IEditButtonPosition,
    IEditEntrySearchParams,
    IInitData,
    ILivePreviewReceivePostMessages,
} from "./utils/types";
import { handleInitData } from "./utils/handleUserConfig";
import { userInitData } from "./utils/defaults";
import packageJson from "../package.json";

export default class LivePreview {
    /**
     * @hideconstructor
     */

    private config: IConfig = {
        ssr: true,
        enable: true,
        runScriptsOnUpdate: false,
        cleanCslpOnProduction: true,
        hash: "",

        editButton: {
            enable: true,
            exclude: [],
            position: "top",
            includeByQueryParameter: true,
        },
        stackDetails: {
            apiKey: "",
            environment: "",
            branch: "",
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
            environment: "",
        },

        onChange: () => {
            // this is intentional
        },
    };

    private tooltip: HTMLButtonElement | null = null; // this tooltip is responsible to redirect user to Contentstack edit page
    private currentElementBesideTooltip: HTMLElement | null = null; // this element helps to move tooltip with the scroll
    private isHoveringOnTooltip = false;
    private hideInterval: ReturnType<typeof setInterval> | null = null;

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
        this.removeEditButtonStyle = this.removeEditButtonStyle.bind(this);
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
        this.toggleHoveringOnEditButton =
            this.toggleHoveringOnEditButton.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);

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
            // render the hover outline only when edit button enable
            if (this.config.editButton.enable) {
                window.addEventListener("mouseover", this.addEditStyleOnHover);
            }

            if (this.config.ssr) {
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
                // in case where the Edit button is not available in the body element
                if (!document.getElementById("cslp-tooltip")) {
                    this.createCslpTooltip();
                }
                if (this.hideInterval) {
                    clearInterval(this.hideInterval);
                    this.hideInterval = null;
                }
                if (this.currentElementBesideTooltip) {
                    this.currentElementBesideTooltip.classList.remove(
                        "cslp-edit-mode"
                    );
                    this.currentElementBesideTooltip.removeEventListener(
                        "mouseleave",
                        this.removeEditButtonStyle
                    );
                }
                element.classList.add("cslp-edit-mode");
                this.currentElementBesideTooltip = element;
                this.currentElementBesideTooltip.addEventListener(
                    "mouseleave",
                    this.removeEditButtonStyle
                );

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

    private removeEditButtonStyle(e: MouseEvent) {
        if (!this.currentElementBesideTooltip || !this.tooltip) return false;
        let trigger = true;
        const eventTargets = e.composedPath();

        for (const eventTarget of eventTargets) {
            const element = eventTarget as HTMLElement;
            if (element.nodeName === "BODY") break;
            if (typeof element?.getAttribute !== "function") continue;

            const cslpTag = element.getAttribute("data-cslp");

            if (trigger && cslpTag) {
                this.hideInterval = setInterval(this.hideTooltip, 500);
                trigger = false;
            } else if (!trigger) {
                element.classList.remove("cslp-edit-mode");
            }
        }
    }

    private hideTooltip() {
        if (
            !this.currentElementBesideTooltip ||
            !this.tooltip ||
            this.isHoveringOnTooltip
        )
            return false;
        this.currentElementBesideTooltip.classList.remove("cslp-edit-mode");
        this.currentElementBesideTooltip.removeEventListener(
            "mouseleave",
            this.removeEditButtonStyle
        );
        this.currentElementBesideTooltip = null;
        this.tooltip.style.top = "-100%";
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

        if (!this.config.stackDetails.environment) {
            throw `To use edit tags, you must provide the preview environment. Specify the preview environment while initializing the Live Preview SDK.

                ContentstackLivePreview.init({
                    ...,
                    stackDetails: {
                        environment: 'Your-environment'
                    },
                    ...
                })`;
        }

        const protocol = String(this.config.clientUrlParams.protocol);
        const host = String(this.config.clientUrlParams.host);
        const port = String(this.config.clientUrlParams.port);
        const environment = String(this.config.stackDetails.environment);
        const branch = String(this.config.stackDetails.branch || "main");

        const urlHash = `!/stack/${
            this.config.stackDetails.apiKey
        }/content-type/${content_type_uid}/${
            locale ?? "en-us"
        }/entry/${entry_uid}/edit`;

        const url = new URL(`${protocol}://${host}`);
        url.port = port;
        url.hash = urlHash;
        if (this.config.stackDetails.branch) {
            url.searchParams.append("branch", branch);
        }
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
        // here we provide contentTypeUid and EntryUid to the StackDelivery SDK.
        this.config.stackSdk.live_preview = {
            ...this.config.stackSdk.live_preview,
            ...editEntrySearchParams,
            live_preview: editEntrySearchParams.hash,
        };
        this.config.onChange();
    }

    setOnChangeCallback(onChangeCallback: () => void): void {
        this.config.onChange = onChangeCallback;
    }

    /**
     * It is the live preview hash.
     * This hash could be used when data is fetched manually.
     */
    get hash(): string {
        return this.config.hash;
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
            this.config.hash = live_preview;
        }
    }

    private resolveIncomingMessage(
        e: MessageEvent<ILivePreviewReceivePostMessages>
    ) {
        if (typeof e.data !== "object") return;

        if (e.data.from !== "live-preview") return;

        switch (e.data.type) {
            case "client-data-send": {
                const { contentTypeUid, entryUid } = this.config.stackDetails;
                const { hash } = e.data.data;

                this.setConfigFromParams({ live_preview: hash });

                if (!this.config.ssr) {
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

                this.config.stackDetails.contentTypeUid = contentTypeUid;
                this.config.stackDetails.entryUid = entryUid;
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
            default: {
                // ensure that the switch statement is exhaustive
                const exhaustiveCheck: never = e.data;
                return exhaustiveCheck; // TODO: add debug message while we are in development mode.
            }
        }
    }

    private createCslpTooltip = () => {
        if (
            !document.getElementById("cslp-tooltip") &&
            this.config.editButton.enable
        ) {
            const tooltip = document.createElement("button");
            const tooltipInnerContainer = document.createElement("div");
            tooltipInnerContainer.classList.add("cslp-tooltip-inner-container");
            tooltip.classList.add("cslp-tooltip");
            tooltip.classList.add("cslp-tooltip");
            tooltip.setAttribute("data-test-id", "cs-cslp-tooltip");
            tooltip.id = "cslp-tooltip";
            tooltipInnerContainer.id = "cslp-tooltip-inner-container";
            tooltip.addEventListener("mouseover", () => {
                this.toggleHoveringOnEditButton(true);
            });
            tooltip.addEventListener("mouseleave", (e: MouseEvent) => {
                this.toggleHoveringOnEditButton(false);
                this.removeEditButtonStyle(e);
            });
            window.document.body.insertAdjacentElement("beforeend", tooltip);
            this.tooltipChild.singular = createSingularEditButton(
                this.scrollHandler
            );
            this.tooltipChild.multiple = createMultipleEditButton(
                this.scrollHandler,
                this.linkClickHandler
            );

            tooltipInnerContainer.innerHTML = "";
            tooltipInnerContainer.appendChild(this.tooltipChild.singular);
            tooltip.appendChild(tooltipInnerContainer);
            this.tooltip = tooltip;
        }
        this.updateTooltipPosition();
    };

    private toggleHoveringOnEditButton = (isHoveringOnTooltip: boolean) => {
        this.isHoveringOnTooltip = isHoveringOnTooltip;
    };

    // Request parent for data sync when document loads
    private requestDataSync() {
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
                        sdkVersion: packageJson.version,
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
            let {
                upperBoundOfTooltip,
                // eslint-disable-next-line prefer-const
                leftBoundOfTooltip,
            }: IEditButtonPosition = getEditButtonPosition(
                this.currentElementBesideTooltip,
                this.config.editButton.position
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
                        const tooltipInnerContainer =
                            this.tooltip.querySelector(
                                "div.cslp-tooltip-inner-container"
                            );
                        if (tooltipInnerContainer) {
                            tooltipInnerContainer.innerHTML = "";
                            tooltipInnerContainer.appendChild(
                                this.tooltipChild.multiple
                            );
                            this.tooltipCurrentChild = "multiple";
                        }
                    }
                } else if (this.tooltipCurrentChild !== "singular") {
                    const tooltipInnerContainer = this.tooltip.querySelector(
                        "div.cslp-tooltip-inner-container"
                    );
                    if (tooltipInnerContainer) {
                        tooltipInnerContainer.innerHTML = "";
                        tooltipInnerContainer.appendChild(
                            this.tooltipChild.singular
                        );
                        this.tooltipCurrentChild = "singular";
                    }
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
