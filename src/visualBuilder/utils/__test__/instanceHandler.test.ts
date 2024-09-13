import { CslpData } from "../../../cslp/types/cslp.types";
import visualBuilderPostMessage from "../visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "./../instanceHandlers";

vi.mock("../visualBuilderPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: vi.fn().mockImplementation((eventName: string) => {
                if (eventName === "delete-instance") return Promise.resolve();
                return Promise.resolve();
            }),
            on: vi.fn(),
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

        expect(visualBuilderPostMessage?.send).toBeCalledTimes(1);
        expect(visualBuilderPostMessage?.send).toBeCalledWith(
            VisualBuilderPostMessageEvents.DELETE_INSTANCE,
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
        expect(visualBuilderPostMessage?.send).toBeCalledWith(
            VisualBuilderPostMessageEvents.MOVE_INSTANCE,
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

        expect(visualBuilderPostMessage?.send).toBeCalledWith(
            VisualBuilderPostMessageEvents.MOVE_INSTANCE,
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
