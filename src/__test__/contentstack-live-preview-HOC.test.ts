import ContentstackLivePreview from "../contentstack-live-preview-HOC";
import { PublicLogger } from "../utils";

describe("Live preview HOC Callback Pub Sub", () => {
    afterEach(() => {
        ContentstackLivePreview.subscribers = {};
        ContentstackLivePreview.livePreview = null;
    });
    test("should add function to subscribers when onEntryChange is called", () => {
        const onChangeCallback1 = jest.fn();
        const onChangeCallback2 = jest.fn();
        const onChangeCallback3 = jest.fn();
        const onChangeCallback4 = jest.fn();
        const onChangeCallback5 = jest.fn();
        ContentstackLivePreview.onEntryChange(onChangeCallback1);
        ContentstackLivePreview.onEntryChange(onChangeCallback2);
        ContentstackLivePreview.onEntryChange(onChangeCallback3);
        ContentstackLivePreview.onEntryChange(onChangeCallback4);
        ContentstackLivePreview.onEntryChange(onChangeCallback5);

        expect(Object.keys(ContentstackLivePreview.subscribers).length).toBe(5);
    });

    test("should remove function when id is provided", () => {
        const onChangeCallbackToStay = jest.fn();
        const onChangeCallbackToBeRemoved = jest.fn();

        const callbackUidToStay = ContentstackLivePreview.onEntryChange(
            onChangeCallbackToStay
        );
        const callbackUidToBeRemoved = ContentstackLivePreview.onEntryChange(
            onChangeCallbackToBeRemoved
        );

        ContentstackLivePreview.unsbscribeOnEntryChange(callbackUidToBeRemoved);

        expect(Object.keys(ContentstackLivePreview.subscribers).length).toBe(1);
        expect(
            ContentstackLivePreview.subscribers[callbackUidToBeRemoved]
        ).toBeUndefined();
        expect(
            ContentstackLivePreview.subscribers[callbackUidToStay]
        ).toBeDefined();
    });

    test("should remove function when callback is provided", () => {
        const onChangeCallbackToStay = jest.fn();
        const onChangeCallbackToBeRemoved = jest.fn();

        const callbackUidToStay = ContentstackLivePreview.onEntryChange(
            onChangeCallbackToStay
        );
        const callbackUidToBeRemoved = ContentstackLivePreview.onEntryChange(
            onChangeCallbackToBeRemoved
        );

        ContentstackLivePreview.unsbscribeOnEntryChange(
            onChangeCallbackToBeRemoved
        );

        expect(Object.keys(ContentstackLivePreview.subscribers).length).toBe(1);
        expect(
            ContentstackLivePreview.subscribers[callbackUidToBeRemoved]
        ).toBeUndefined();
        expect(
            ContentstackLivePreview.subscribers[callbackUidToStay]
        ).toBeDefined();
    });

    test("should warn user if callback or id is not present", () => {
        const onChangeCallbackToStay = jest.fn();
        const onChangeCallbackToBeRemoved = jest.fn();

        ContentstackLivePreview.onEntryChange(onChangeCallbackToStay);
        const callbackUidToBeRemoved = ContentstackLivePreview.onEntryChange(
            onChangeCallbackToBeRemoved
        );

        const spiedConsole = jest.spyOn(PublicLogger, "warn");

        ContentstackLivePreview.unsbscribeOnEntryChange(
            onChangeCallbackToBeRemoved
        );

        ContentstackLivePreview.unsbscribeOnEntryChange(
            onChangeCallbackToBeRemoved
        );
        ContentstackLivePreview.unsbscribeOnEntryChange(callbackUidToBeRemoved);

        expect(spiedConsole).toHaveBeenCalledTimes(2);
        expect(spiedConsole).toHaveBeenCalledWith(
            "No subscriber found with the given callback."
        );
        expect(spiedConsole).toHaveBeenCalledWith(
            "No subscriber found with the given id."
        );
    });
});
