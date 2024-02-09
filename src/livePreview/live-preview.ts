import packageJson from "../../package.json";
import { inIframe } from "../common/inIframe";
import { getUserInitData } from "../configManager/config.default";
import Config, { updateConfigFromUrl } from "../configManager/configManager";
import { addCslpOutline, extractDetailsFromCslp } from "../cslp/cslpdata";
import { VisualEditor } from "../liveEditor";
import { PublicLogger } from "../logger/logger";
import {
    IEditButtonPosition,
    IInitData,
    ILivePreviewModeConfig,
    ILivePreviewWindowType,
} from "../types/types";
import { addLivePreviewQueryTags } from "../utils";
import {
    createMultipleEditButton,
    createSingularEditButton,
    getEditButtonPosition,
} from "./editButton/editButton";
import livePreviewPostMessage from "./eventManager/livePreviewEventManager";
import {
    useHistoryPostMessageEvent,
    useOnEntryUpdatePostMessageEvent,
} from "./eventManager/postMessageEvent.hooks";

export default class LivePreview {
    /**
     * @hideconstructor
     */

    private tooltip: HTMLButtonElement | null = null; // this tooltip is responsible to redirect user to Contentstack edit page

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
        updateConfigFromUrl();
        const config = Config.get();

        this.addEditStyleOnHover = this.addEditStyleOnHover.bind(this);
        this.generateRedirectUrl = this.generateRedirectUrl.bind(this);
        this.scrollHandler = this.scrollHandler.bind(this);
        this.linkClickHandler = this.linkClickHandler.bind(this);
        this.setOnChangeCallback = this.setOnChangeCallback.bind(this);
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

            window.addEventListener("scroll", this.updateTooltipPosition);
            // render the hover outline only when edit button enable
            if (
                config.editButton.enable ||
                config.mode >= ILivePreviewModeConfig.EDITOR
            ) {
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
        const updateTooltipPosition: Parameters<typeof addCslpOutline>["1"] = ({
            cslpTag,
            highlightedElement,
        }) => {
            if (this.updateTooltipPosition()) {
                this.tooltip?.setAttribute("current-data-cslp", cslpTag);
                this.tooltip?.setAttribute(
                    "current-href",
                    highlightedElement.getAttribute("href") ?? ""
                );
            }
        };

        const config = Config.get();
        if (
            (config.windowType === ILivePreviewWindowType.PREVIEW ||
                config.windowType === ILivePreviewWindowType.INDEPENDENT) &&
            config.editButton.enable
        ) {
            addCslpOutline(e, updateTooltipPosition);
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
            const { content_type_uid, entry_uid, locale, fieldPathWithIndex } =
                extractDetailsFromCslp(cslpTag);

            if (inIframe()) {
                livePreviewPostMessage?.send("scroll", {
                    field: fieldPathWithIndex,
                    content_type_uid,
                    entry_uid,
                    locale,
                });
            } else {
                try {
                    // Redirect to Contentstack edit page
                    const redirectUrl = this.generateRedirectUrl(
                        content_type_uid,
                        locale,
                        entry_uid,
                        fieldPathWithIndex
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

    private createCslpTooltip = () => {
        const config = Config.get();

        if (
            config.mode >= ILivePreviewModeConfig.EDITOR &&
            config.windowType === ILivePreviewWindowType.EDITOR
        ) {
            return;
        }

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

        //! TODO: we replaced the handleOnChange() with this.
        //! I don't think we need this. Confirm and remove it.
        config.onChange();

        // add edit tooltip
        this.createCslpTooltip();

        livePreviewPostMessage
            ?.send<{
                contentTypeUid: string;
                entryUid: string;
                windowType: ILivePreviewWindowType;
            }>("init", {
                config: {
                    shouldReload: config.ssr,
                    href: window.location.href,
                    sdkVersion: packageJson.version,
                },
            })
            .then((data) => {
                const {
                    contentTypeUid,
                    entryUid,
                    windowType = ILivePreviewWindowType.PREVIEW,
                } = data;

                const stackDetails = Config.get().stackDetails;

                stackDetails.contentTypeUid = contentTypeUid;
                stackDetails.entryUid = entryUid;

                Config.set("stackDetails", stackDetails);
                Config.set("windowType", windowType);
            });

        // set timeout for client side (use to show warning: You are not editing this page)
        if (!config.ssr) {
            setInterval(() => {
                livePreviewPostMessage?.send("check-entry-page", {
                    href: window.location.href,
                });
            }, 1500);
        }

        useHistoryPostMessageEvent();
        useOnEntryUpdatePostMessageEvent();
    }

    private updateTooltipPosition() {
        const { elements } = Config.get();
        if (!elements.highlightedElement || !this.tooltip) return false;

        const config = Config.get();

        const currentRectOfElement =
            elements.highlightedElement.getBoundingClientRect();
        const currentRectOfParentOfElement =
            this.tooltip.parentElement?.getBoundingClientRect();

        if (currentRectOfElement && currentRectOfParentOfElement) {
            let {
                upperBoundOfTooltip,
                // eslint-disable-next-line prefer-const
                leftBoundOfTooltip,
            }: IEditButtonPosition = getEditButtonPosition(
                elements.highlightedElement,
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
                elements.highlightedElement.style.zIndex || "200";
            this.tooltip.style.left = leftBoundOfTooltip + "px";

            if (this.tooltipChild.singular && this.tooltipChild.multiple) {
                if (elements.highlightedElement.hasAttribute("href")) {
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
