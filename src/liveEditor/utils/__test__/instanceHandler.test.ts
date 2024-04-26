import { CslpData } from "../../../cslp/types/cslp.types";
import liveEditorPostMessage from "../liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../types/postMessage.types";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "./../instanceHandlers";

jest.mock("../liveEditorPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: jest.fn().mockImplementation((eventName: string) => {
                if (eventName === "delete-instance") return Promise.resolve();
                return Promise.resolve();
            }),
            on: jest.fn(),
        },
    };
});

describe("instanceHandlers", () => {
    test("handleDeleteInstance", async () => {
        const mockFieldMetadata: CslpData = {
            entry_uid: "",
            content_type_uid: "mockContentTypeUid",
            cslpValue: "",
            locale: "",
            fieldPath: "mockFieldPath",
            fieldPathWithIndex: "",
            multipleFieldMetadata: {
                index: 0,
                parentDetails: {
                    parentPath: "",
                    parentCslpValue: "",
                },
            },
            instance: {
                fieldPathWithIndex: "",
            },
        };

        await handleDeleteInstance(mockFieldMetadata);

        expect(liveEditorPostMessage?.send).toBeCalledTimes(1);
        expect(liveEditorPostMessage?.send).toBeCalledWith(
            LiveEditorPostMessageEvents.DELETE_INSTANCE,
            {
                data:
                    mockFieldMetadata.fieldPathWithIndex +
                    "." +
                    mockFieldMetadata.multipleFieldMetadata.index,
                fieldMetadata: mockFieldMetadata,
            }
        );
    });

    test("handleMoveInstance", async () => {
        const mockFieldMetadata: CslpData = {
            entry_uid: "",
            content_type_uid: "mockContentTypeUid",
            cslpValue: "",
            locale: "",
            fieldPath: "mockFieldPath",
            fieldPathWithIndex: "",
            multipleFieldMetadata: {
                index: 0,
                parentDetails: {
                    parentPath: "",
                    parentCslpValue: "",
                },
            },
            instance: {
                fieldPathWithIndex: "",
            },
        };

        await handleMoveInstance(mockFieldMetadata, "previous");
        expect(liveEditorPostMessage?.send).toBeCalledWith(
            LiveEditorPostMessageEvents.MOVE_INSTANCE,
            {
                data:
                    mockFieldMetadata.fieldPathWithIndex +
                    "." +
                    mockFieldMetadata.multipleFieldMetadata.index,
                direction: "previous",
                fieldMetadata: mockFieldMetadata,
            }
        );

        handleMoveInstance(mockFieldMetadata, "next");

        expect(liveEditorPostMessage?.send).toBeCalledWith(
            LiveEditorPostMessageEvents.MOVE_INSTANCE,
            {
                data:
                    mockFieldMetadata.fieldPathWithIndex +
                    "." +
                    mockFieldMetadata.multipleFieldMetadata.index,
                direction: "next",
                fieldMetadata: mockFieldMetadata,
            }
        );
    });
});
