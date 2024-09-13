import { vi } from "vitest";
import { PublicLogger } from "../../logger/logger";
import { removeFromOnChangeSubscribers } from "../removeFromOnChangeSubscribers";

describe("removeFromOnChangeSubscribers", () => {
    let callbackStack: any;
    let mockWarn: any;

    beforeEach(() => {
        callbackStack = {
            callback1: vi.fn(),
            callback2: vi.fn(),
        };
        mockWarn = vi.spyOn(PublicLogger, "warn");
    });

    afterEach(() => {
        callbackStack = null;
        vi.clearAllMocks();
    });

    test("should remove subscriber by callback UID if found", () => {
        removeFromOnChangeSubscribers(callbackStack, "callback1");
        expect(callbackStack["callback1"]).toBeUndefined();
        expect(callbackStack["callback2"]).toBeDefined();
    });

    test("should remove subscriber by callback function if found", () => {
        removeFromOnChangeSubscribers(
            callbackStack,
            callbackStack["callback1"]
        );
        expect(callbackStack["callback1"]).toBeUndefined();
        expect(callbackStack["callback2"]).toBeDefined();
    });

    test("should warn and not remove subscriber if no subscriber found with given UID", () => {
        removeFromOnChangeSubscribers(callbackStack, "callback3");
        expect(callbackStack["callback1"]).toBeDefined();
        expect(callbackStack["callback2"]).toBeDefined();
        expect(mockWarn).toHaveBeenCalledTimes(1);
        expect(mockWarn).toHaveBeenCalledWith(
            "No subscriber found with the given id."
        );
    });

    test("should warn and not remove subscriber if no subscriber found with the given function", () => {
        const nonExistentFunction = vi.fn();
        removeFromOnChangeSubscribers(callbackStack, nonExistentFunction);
        expect(callbackStack["callback1"]).toBeDefined();
        expect(callbackStack["callback2"]).toBeDefined();
        expect(mockWarn).toHaveBeenCalledWith(
            "No subscriber found with the given callback."
        );
    });
});
