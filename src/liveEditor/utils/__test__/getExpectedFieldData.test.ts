import { LiveEditorPostMessageEvents } from "../types/postMessage.types";
import { getExpectedFieldData } from "../getExpectedFieldData";

jest.mock("../liveEditorPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: jest.fn().mockImplementation((eventName: string) => {
                if (eventName === LiveEditorPostMessageEvents.GET_FIELD_DATA)
                    return Promise.resolve({
                        fieldData: "I am the correct long expected data",
                    });
                return Promise.resolve();
            }),
        },
    };
});

describe("getExpectedFieldData", () => {
    test("should return the expected field data", async () => {
        const expectedFieldData = await getExpectedFieldData({} as any);
        expect(expectedFieldData).toBe("I am the correct long expected data");
    });
});
