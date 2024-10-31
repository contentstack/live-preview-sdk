import { CslpData } from "../../../cslp/types/cslp.types";
import { getFieldData } from "../getFieldData";
import visualBuilderPostMessage from "../visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";

vi.mock("../../utils/visualBuilderPostMessage", async () => {
    return {
        __esModule: true,
        default: {
            send: vi.fn().mockImplementation((eventName: string) => {
                if (eventName === "get-field-data")
                    return Promise.resolve({
                        fieldData: "hello",
                    });
                return Promise.resolve();
            }),
        },
    };
});

/** @ts-expect-error variant is an optional field */
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
        const fieldData = await getFieldData(mockFieldMetadata);
        expect(fieldData).toBe("hello");

        expect(visualBuilderPostMessage?.send).lastCalledWith(
            VisualBuilderPostMessageEvents.GET_FIELD_DATA,
            {
                entryPath: "",
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

        expect(visualBuilderPostMessage?.send).toHaveBeenCalledTimes(1);
    });
});
