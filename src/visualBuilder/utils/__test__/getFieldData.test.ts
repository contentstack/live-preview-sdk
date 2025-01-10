import { CslpData } from "../../../cslp/types/cslp.types";
import { getFieldData } from "../getFieldData";
import visualBuilderPostMessage from "../visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import { hasPostMessageError } from "../errorHandling";
import { Mock } from "vitest";

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
vi.mock("../../utils/errorHandling", async () => {
    return {
        __esModule: true,
        hasPostMessageError: vi.fn().mockReturnValue(false),
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

describe("getFieldData", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
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

    test("should return an empty string if there is a post message error", async () => {
        (hasPostMessageError as Mock).mockReturnValueOnce(true);

        const fieldData = await getFieldData(mockFieldMetadata);
        expect(fieldData).toBe("");

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

    test("should return the expected field data with entryPath", async () => {
        const fieldData = await getFieldData(mockFieldMetadata, "some/entry/path");
        expect(fieldData).toBe("hello");

        expect(visualBuilderPostMessage?.send).lastCalledWith(
            VisualBuilderPostMessageEvents.GET_FIELD_DATA,
            {
                entryPath: "some/entry/path",
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
