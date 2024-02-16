import { PublicLogger } from "../logger/logger";
import {
    OnEntryChangeCallbackUID,
    OnEntryChangeCallback,
} from "./types/onEntryChangeCallback.type";

export function removeFromOnChangeSubscribers(
    callbackStack: {
        [callbackUid: OnEntryChangeCallbackUID]: OnEntryChangeCallback;
    },
    callback: OnEntryChangeCallbackUID | OnEntryChangeCallback
): void {
    if (typeof callback === "string") {
        if (!callbackStack[callback]) {
            PublicLogger.warn("No subscriber found with the given id.");
        }
        delete callbackStack[callback];
    } else if (typeof callback === "function") {
        const isCallbackDeleted = Object.entries<() => void>(
            callbackStack
        ).some(([uid, func]) => {
            if (func === callback) {
                delete callbackStack[uid];
                return true;
            }
            return false;
        });

        if (!isCallbackDeleted) {
            PublicLogger.warn("No subscriber found with the given callback.");
        }
    }
}
