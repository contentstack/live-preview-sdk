import { CslpData } from "../../../cslp/types/cslp.types";
import { getExpectedFieldData } from "../getExpectedFieldData";
import liveEditorPostMessage from "../visualBuilderPostMessage";
import { LiveEditorPostMessageEvents } from "../types/postMessage.types";

vi.mock("../../utils/liveEditorPostMessage", async () => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("./../../../__test__/data/contentType")
    >("./../../../__test__/data/contentType");

    const contentTypes = getAllContentTypes();
    return {
        __esModule: true,
        default: {
            send: vi.fn().mockImplementation((eventName: string) => {
                if (eventName === "init")
                    return Promise.resolve({
                        contentTypes,
                    });
                return Promise.resolve();
            }),
        },
    };
});

const mockFieldMetadata: CslpData = {
    entry_uid: "bltapikey",
    content_type_uid: "all_fields",
    locale: "en-us",
    cslpValue: "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.0",
    fieldPath: "multi_line_textbox_multiple_",
    fieldPathWithIndex: "multi_line_textbox_multiple_",
    multipleFieldMetadata: {
        parentDetails: {
            parentPath: "multi_line_textbox_multiple_",
            parentCslpValue:
                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_",
        },
        index: 0,
    },
    instance: {
        fieldPathWithIndex: "multi_line_textbox_multiple_.0",
    },
};

describe("getExpectedFieldData", () => {
    test("should return the expected field data", async () => {
        const expectedFieldData = await getExpectedFieldData(mockFieldMetadata);
        expect(expectedFieldData).toBe("");

        expect(liveEditorPostMessage?.send).lastCalledWith(
            LiveEditorPostMessageEvents.GET_FIELD_DATA,
            {
                fieldMetadata: {
                    entry_uid: "bltapikey",
                    content_type_uid: "all_fields",
                    locale: "en-us",
                    cslpValue:
                        "all_fields.bltapikey.en-us.multi_line_textbox_multiple_.0",
                    fieldPath: "multi_line_textbox_multiple_",
                    fieldPathWithIndex: "multi_line_textbox_multiple_",
                    multipleFieldMetadata: {
                        parentDetails: {
                            parentPath: "multi_line_textbox_multiple_",
                            parentCslpValue:
                                "all_fields.bltapikey.en-us.multi_line_textbox_multiple_",
                        },
                        index: 0,
                    },
                    instance: {
                        fieldPathWithIndex: "multi_line_textbox_multiple_.0",
                    },
                },
            }
        );

        expect(liveEditorPostMessage?.send).toHaveBeenCalledTimes(1);
    });
});
