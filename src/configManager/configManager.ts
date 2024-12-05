import { DeepSignal, deepSignal } from "deepsignal";
import type { IConfig, IInitData } from "../types/types";
import { getDefaultConfig, getUserInitData } from "./config.default";
import { handleInitData } from "./handleUserConfig";
import { has as lodashHas, set as lodashSet } from "lodash-es";

const deepWrapper = (obj: any) => {
    if (new Set([Object, Array]).has(obj.constructor)) {
        return deepSignal(obj);
    } else {
        return obj;
    }
}

class Config {
    static config: {
        state: DeepSignal<IConfig>;
    } = {
        state: deepWrapper(getDefaultConfig()),
    };

    static replace(userInput: Partial<IInitData> = getUserInitData()): void {
        handleInitData(userInput);
    }

    static set(key: string, value: any): void {
        if (!lodashHas(this.config.state, key)) {
            throw new Error(`Invalid key: ${key}`);
        }
        lodashSet(this.config.state, key, value);
    }

    static get(): DeepSignal<IConfig> {
        return this.config.state;
    }

    static reset(): void {
        lodashSet(this.config, "state", getDefaultConfig());
    }
}

export default Config;

/**
 * Updates the configuration from the URL parameters.
 * It will receive live_preview containing the hash, content_type_uid and entry_uid.
 */

export function updateConfigFromUrl(): void {
    const searchParams = new URLSearchParams(window.location.search);
    setConfigFromParams(searchParams.toString());
}

/**
 * Sets the live preview hash, content_type_uid and entry_uid
 * from the query param to config.
 *
 * @param params query param in an object form, query string.
 *
 * @example
 * ```js
 * setConfigFromParams({
 *      live_preview: "hash",
 *      content_type_uid: "content_type_uid",
 *      entry_uid: "entry_uid",
 * });
 * ```
 *
 * @example
 * ```js
 * setConfigFromParams("?live_preview=hash&content_type_uid=content_type_uid&entry_uid=entry_uid");
 * ```
 * Basically anything that can be passed to `URLSearchParams` constructor.
 */

export function setConfigFromParams(
    params: ConstructorParameters<typeof URLSearchParams>[0] = {}
): void {
    const urlParams = new URLSearchParams(params);
    const live_preview = urlParams.get("live_preview");
    const content_type_uid = urlParams.get("content_type_uid");
    const entry_uid = urlParams.get("entry_uid");

    const stackSdkLivePreview = Config.get().stackSdk.live_preview;

    if (live_preview) {
        Config.set("hash", live_preview);
        stackSdkLivePreview.hash = live_preview;
        stackSdkLivePreview.live_preview = live_preview;
    }

    if (content_type_uid) {
        Config.set("stackDetails.contentTypeUid", content_type_uid);
        stackSdkLivePreview.content_type_uid = content_type_uid;
    }

    if (entry_uid) {
        Config.set("stackDetails.entryUid", entry_uid);
        stackSdkLivePreview.entry_uid = entry_uid;
    }

    Config.set("stackSdk.live_preview", stackSdkLivePreview);
}
