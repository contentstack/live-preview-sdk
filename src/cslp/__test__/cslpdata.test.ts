import { extractDetailsFromCslp } from "../cslpdata";

describe("extractDetailsFromCslp", () => {
    test("should extract details from a CSLP value string with nested multiple field", () => {
        const cslpValue =
            "content_type_uid.entry_uid.locale.field1.field2.0.field3";
        const expected = {
            entry_uid: "entry_uid",
            content_type_uid: "content_type_uid",
            locale: "locale",
            cslpValue:
                "content_type_uid.entry_uid.locale.field1.field2.0.field3",
            fieldPath: "field1.field2.field3",
            fieldPathWithIndex: "field1.field2.0.field3",
            multipleFieldMetadata: {
                parentDetails: {
                    parentPath: "field1.field2",
                    parentCslpValue:
                        "content_type_uid.entry_uid.locale.field1.field2",
                },
                index: 0,
            },
        };
        expect(extractDetailsFromCslp(cslpValue)).toEqual(expected);
    });

    test("should handle a CSLP value string with no multiple field", () => {
        const cslpValue =
            "content_type_uid.entry_uid.locale.field1.field2.field3";
        const expected = {
            entry_uid: "entry_uid",
            content_type_uid: "content_type_uid",
            locale: "locale",
            cslpValue: "content_type_uid.entry_uid.locale.field1.field2.field3",
            fieldPath: "field1.field2.field3",
            fieldPathWithIndex: "field1.field2.field3",
            multipleFieldMetadata: {
                parentDetails: null,
                index: -1,
            },
        };
        expect(extractDetailsFromCslp(cslpValue)).toEqual(expected);
    });

    test("should handle a CSLP value string with one level multiple field", () => {
        const cslpValue = "content_type_uid.entry_uid.locale.field.0";
        const expected = {
            entry_uid: "entry_uid",
            content_type_uid: "content_type_uid",
            locale: "locale",
            cslpValue: "content_type_uid.entry_uid.locale.field.0",
            fieldPath: "field",
            fieldPathWithIndex: "field",
            multipleFieldMetadata: {
                parentDetails: {
                    parentCslpValue: "content_type_uid.entry_uid.locale.field",
                    parentPath: "field",
                },
                index: 0,
            },
        };
        expect(extractDetailsFromCslp(cslpValue)).toEqual(expected);
    });

    test("should handle a CSLP value string with nested group field", () => {
        const cslpValue =
            "content_type_uid.entry_uid.locale.field1.0.field3.field4.3";
        const expected = {
            entry_uid: "entry_uid",
            content_type_uid: "content_type_uid",
            locale: "locale",
            cslpValue:
                "content_type_uid.entry_uid.locale.field1.0.field3.field4.3",
            fieldPath: "field1.field3.field4",
            fieldPathWithIndex: "field1.0.field3.field4",
            multipleFieldMetadata: {
                parentDetails: {
                    parentCslpValue:
                        "content_type_uid.entry_uid.locale.field1.0.field3.field4",
                    parentPath: "field1.0.field3.field4",
                },
                index: 3,
            },
        };
        expect(extractDetailsFromCslp(cslpValue)).toEqual(expected);
    });
});
