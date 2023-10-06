import ContentstackLivePreview from "../contentstack-live-preview-HOC";
import { PublicLogger } from "../utils/public-logger";
import { IInitData } from "../types/types";
import { sendPostmessageToWindow } from "./utils";
import packageJson from "../../package.json";

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

        ContentstackLivePreview.unsubscribeOnEntryChange(
            callbackUidToBeRemoved
        );

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

        ContentstackLivePreview.unsubscribeOnEntryChange(
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

        ContentstackLivePreview.unsubscribeOnEntryChange(
            onChangeCallbackToBeRemoved
        );

        ContentstackLivePreview.unsubscribeOnEntryChange(
            onChangeCallbackToBeRemoved
        );
        ContentstackLivePreview.unsubscribeOnEntryChange(
            callbackUidToBeRemoved
        );

        expect(spiedConsole).toHaveBeenCalledTimes(2);
        expect(spiedConsole).toHaveBeenCalledWith(
            "No subscriber found with the given callback."
        );
        expect(spiedConsole).toHaveBeenCalledWith(
            "No subscriber found with the given id."
        );
    });
    test("should call the user defined function when entry is changed", async () => {
        ContentstackLivePreview.init({ enable: true, ssr: false });

        const userDefinedOnChangeFunction = jest.fn();
        const userDefinedOnChangeFunctionWithSignedTrue = jest.fn();
        const userDefinedOnChangeFUnctionWithNoInitiator = jest.fn();

        ContentstackLivePreview.onEntryChange(userDefinedOnChangeFunction);
        ContentstackLivePreview.onEntryChange(
            userDefinedOnChangeFunctionWithSignedTrue,
            {
                skipInitialRender: true,
            }
        );
        ContentstackLivePreview.onLiveEdit(
            userDefinedOnChangeFUnctionWithNoInitiator
        );

        await sendPostmessageToWindow("client-data-send", {
            hash: "livePreviewHash1234",
            content_type_uid: "entryContentTypeUid",
        });

        expect(userDefinedOnChangeFunctionWithSignedTrue).toHaveBeenCalledTimes(
            1
        );
        // This function will run twice because, first it will be
        // run when it is was added by onEntryChange()
        // and then it will be run when the entry is changed
        expect(userDefinedOnChangeFunction).toHaveBeenCalledTimes(2);
        expect(
            userDefinedOnChangeFUnctionWithNoInitiator
        ).toHaveBeenCalledTimes(1);
    });
    test("should initialize the live preview when live preview was not initialized", async () => {
        const { window } = global;

        // @ts-ignore
        delete global.window;

        expect(global.window).toBeUndefined();

        ContentstackLivePreview.init({ enable: true });

        expect(ContentstackLivePreview.livePreview).toBeNull();

        // restoring the window
        global.window = window;

        const userFunction = jest.fn();
        // live preview should get initialized on onEntryChange()
        ContentstackLivePreview.onEntryChange(userFunction);

        expect(ContentstackLivePreview.livePreview).toBeDefined();
    });
});

describe("Live preview initialization", () => {
    test("should create a new Live preview object for first time", () => {
        expect(ContentstackLivePreview.livePreview).toBeNull();
        ContentstackLivePreview.init();
        expect(ContentstackLivePreview.livePreview).toBeDefined();
        expect(ContentstackLivePreview.userConfig).toBeNull();
    });
    test("should return old Live preview object when re-initialized", () => {
        const initializedLivePreview = ContentstackLivePreview["livePreview"];
        ContentstackLivePreview.init();
        ContentstackLivePreview.init();
        const reinitializedLivePreview = ContentstackLivePreview["livePreview"];
        expect(reinitializedLivePreview).toBe(initializedLivePreview);
        expect(ContentstackLivePreview.userConfig).toBeNull();
    });
    test("should save the config when window is not available", () => {
        const { window } = global;

        // @ts-ignore
        delete global.window;

        expect(global.window).toBeUndefined();

        const userConfig: Partial<IInitData> = {
            enable: true,
            stackDetails: {
                apiKey: "livePreviewApiKey123",
            },
        };

        expect(ContentstackLivePreview.userConfig).toBeNull();

        ContentstackLivePreview.init(userConfig);

        expect(ContentstackLivePreview.userConfig).toBe(userConfig);

        // restoring the window
        global.window = window;

        const userFunction = jest.fn();
        // live preview should get initialized on onEntryChange()
        ContentstackLivePreview.onEntryChange(userFunction);

        expect(ContentstackLivePreview.userConfig).toBeNull();
    });
});

describe("Live preview version", () => {
    test("should return current version", () => {
        expect(ContentstackLivePreview.getSdkVersion()).toBe(
            packageJson.version
        );
    });
});

describe("Gatsby Data formatter", () => {
    test("should return data in correct format", async () => {
        class stackSdkWithFetch {
            live_preview = {};
            headers = {
                api_key: "",
            };
            content_type_uid = "live_preview_content_type";
            environment = "";

            data = {
                page: {
                    title: "test",
                    description: "world",
                },
            };
            constructor() {}

            toJSON() {
                return this;
            }
            fetch() {
                return Promise.resolve(this.data);
            }
        }

        class stackSdkWithFind {
            live_preview = {};
            headers = {
                api_key: "",
            };
            content_type_uid = "live_preview_content_type";

            environment = "";
            data = [
                [
                    {
                        page: {
                            title: "test",
                            description: "world",
                        },
                    },
                ],
            ];
            constructor() {}

            toJSON() {
                return this;
            }

            find() {
                return Promise.resolve(this.data);
            }
        }

        expect(
            await ContentstackLivePreview.getGatsbyDataFormat(
                new stackSdkWithFetch(),
                "prefix"
            )
        ).toMatchObject({
            prefixLivePreviewContentType: {
                page: { title: "test", description: "world" },
            },
        });

        expect(
            await ContentstackLivePreview.getGatsbyDataFormat(
                new stackSdkWithFind(),
                "prefix"
            )
        ).toMatchObject([
            [
                {
                    prefixLivePreviewContentType: {
                        page: { title: "test", description: "world" },
                    },
                },
            ],
        ]);
    });
});
