import { getFieldSchemaMap } from "../../../__test__/data/fieldSchemaMap";
import { FieldSchemaMap } from "../fieldSchemaMap";
import { LiveEditorPostMessageEvents } from "../types/postMessage.types";

vi.mock("../../utils/liveEditorPostMessage", async () => {
    const { getFieldSchemaMap } = await vi.importActual<
        typeof import("../../../__test__/data/fieldSchemaMap")
    >("../../../__test__/data/fieldSchemaMap.ts");
    const fieldSchemaMap = getFieldSchemaMap();
    return {
        __esModule: true,
        default: {
            send: vi.fn().mockImplementation((eventName: string) => {
                if (
                    eventName === LiveEditorPostMessageEvents.GET_FIELD_SCHEMA
                ) {
                    return Promise.resolve({
                        fieldSchemaMap: fieldSchemaMap.all_fields,
                    });
                }
                return Promise.resolve();
            }),
            on: vi.fn(),
        },
    };
});

describe("field Schema map", () => {
    beforeAll(() => {
        FieldSchemaMap.clear();
    });

    afterEach(() => {
        FieldSchemaMap.clear();
    });

    test("should set the field schema map", () => {
        FieldSchemaMap.setFieldSchema(
            "test_ct",
            getFieldSchemaMap().all_fields
        );
        expect(FieldSchemaMap.hasFieldSchema("test_ct", "title")).toBeTruthy();
    });

    test("should clear the field schema map", () => {
        FieldSchemaMap.setFieldSchema(
            "test_ct",
            getFieldSchemaMap().all_fields
        );
        expect(FieldSchemaMap.hasFieldSchema("test_ct", "title")).toBeTruthy();

        FieldSchemaMap.clear();
        expect(FieldSchemaMap.hasFieldSchema("test_ct", "title")).toBeFalsy();
    });

    test("should return true if the field schema maps are equal", () => {
        FieldSchemaMap.setFieldSchema(
            "test_ct",
            getFieldSchemaMap().all_fields
        );
        expect(
            FieldSchemaMap.areFieldSchemaEqual(
                getFieldSchemaMap().all_fields.title,
                getFieldSchemaMap().all_fields.title
            )
        ).toBeTruthy();
    });

    test("should return false if the field schema maps are not equal", () => {
        FieldSchemaMap.setFieldSchema(
            "test_ct",
            getFieldSchemaMap().all_fields
        );
        expect(
            FieldSchemaMap.areFieldSchemaEqual(
                getFieldSchemaMap().all_fields.title,
                getFieldSchemaMap().all_fields.single_line
            )
        ).toBeFalsy();
    });

    test("should return true if the field schema map has the field schema", () => {
        FieldSchemaMap.setFieldSchema(
            "test_ct",
            getFieldSchemaMap().all_fields
        );
        expect(FieldSchemaMap.hasFieldSchema("test_ct", "title")).toBeTruthy();
    });
    test("should return false if the field schema map does not have the field schema", () => {
        FieldSchemaMap.setFieldSchema(
            "test_ct",
            getFieldSchemaMap().all_fields
        );
        expect(
            FieldSchemaMap.hasFieldSchema("test_ct", "field_does_not_exist")
        ).toBeFalsy();
    });

    test("should return the field schema if it exists in the field schema map", async () => {
        FieldSchemaMap.setFieldSchema(
            "test_ct",
            getFieldSchemaMap().all_fields
        );
        const fieldSchema = await FieldSchemaMap.getFieldSchema(
            "test_ct",
            "title"
        );
        expect(fieldSchema).toEqual(getFieldSchemaMap().all_fields.title);
    });

    test("should get the field schema from event if it does not exist in the field schema map", async () => {
        const fieldSchema = await FieldSchemaMap.getFieldSchema(
            "test_ct",
            "title"
        );
        expect(fieldSchema).toEqual(getFieldSchemaMap().all_fields.title);
    });
});
