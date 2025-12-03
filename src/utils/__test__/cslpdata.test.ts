import { describe, test, expect } from "vitest";
import { extractDetailsFromCslp, CslpData } from "../cslpdata";

describe("extractDetailsFromCslp", () => {
    describe("v1 format (no version prefix)", () => {
        test("should extract details from v1 CSLP value string", () => {
            const cslpValue =
                "content_type_uid.entry_uid.locale.field1.field2.field3";
            const expected: CslpData = {
                entry_uid: "entry_uid",
                content_type_uid: "content_type_uid",
                locale: "locale",
                cslpValue: cslpValue,
                fieldPath: "field1.field2.field3",
            };

            const result = extractDetailsFromCslp(cslpValue);

            expect(result).toEqual(expected);
        });

        test("should handle v1 format with single field", () => {
            const cslpValue = "content_type_uid.entry_uid.locale.field1";
            const expected: CslpData = {
                entry_uid: "entry_uid",
                content_type_uid: "content_type_uid",
                locale: "locale",
                cslpValue: cslpValue,
                fieldPath: "field1",
            };

            const result = extractDetailsFromCslp(cslpValue);

            expect(result).toEqual(expected);
        });

        test("should handle v1 format with empty field path", () => {
            const cslpValue = "content_type_uid.entry_uid.locale";
            const expected: CslpData = {
                entry_uid: "entry_uid",
                content_type_uid: "content_type_uid",
                locale: "locale",
                cslpValue: cslpValue,
                fieldPath: "",
            };

            const result = extractDetailsFromCslp(cslpValue);

            expect(result).toEqual(expected);
        });

        test("should handle v1 format with nested fields", () => {
            const cslpValue =
                "content_type_uid.entry_uid.locale.field1.field2.field3.field4";
            const expected: CslpData = {
                entry_uid: "entry_uid",
                content_type_uid: "content_type_uid",
                locale: "locale",
                cslpValue: cslpValue,
                fieldPath: "field1.field2.field3.field4",
            };

            const result = extractDetailsFromCslp(cslpValue);

            expect(result).toEqual(expected);
        });
    });

    describe("v2 format (with version prefix)", () => {
        test("should extract details from v2 CSLP value string with variant", () => {
            // Note: v2 format splits entryInfo by "_" - first part is entry_uid, second is variant
            const cslpValue =
                "v2:content_type_uid.entry_variant.locale.field1.field2";
            const expected: CslpData = {
                entry_uid: "entry",
                content_type_uid: "content_type_uid",
                variant: "variant",
                locale: "locale",
                cslpValue:
                    "content_type_uid.entry_variant.locale.field1.field2",
                fieldPath: "field1.field2",
            };

            const result = extractDetailsFromCslp(cslpValue);

            expect(result).toEqual(expected);
        });

        test("should handle v2 format with variant and different field path lengths", () => {
            const testCases = [
                {
                    cslpValue:
                        "v2:content_type_uid.entry_variant.locale.field1",
                    expected: {
                        entry_uid: "entry",
                        content_type_uid: "content_type_uid",
                        variant: "variant",
                        locale: "locale",
                        cslpValue:
                            "content_type_uid.entry_variant.locale.field1",
                        fieldPath: "field1",
                    },
                },
                {
                    cslpValue: "v2:content_type_uid.entry_variant.locale",
                    expected: {
                        entry_uid: "entry",
                        content_type_uid: "content_type_uid",
                        variant: "variant",
                        locale: "locale",
                        cslpValue: "content_type_uid.entry_variant.locale",
                        fieldPath: "",
                    },
                },
            ];

            testCases.forEach(({ cslpValue, expected }) => {
                const result = extractDetailsFromCslp(cslpValue);
                expect(result).toEqual(expected);
            });
        });

        test("should handle v2 format when entryInfo has no underscore (variant is undefined)", () => {
            // When entryInfo has no underscore, split("_") returns [entryInfo]
            // So entry_uid = entryInfo, variant = undefined
            const cslpValue = "v2:content_type_uid.entryuid.locale.field1";
            const result = extractDetailsFromCslp(cslpValue);

            expect(result.entry_uid).toBe("entryuid");
            expect(result.content_type_uid).toBe("content_type_uid");
            expect(result.variant).toBeUndefined();
            expect(result.locale).toBe("locale");
            expect(result.fieldPath).toBe("field1");
        });

        test("should handle v2 format when entryInfo contains underscore (splits to entry_uid and variant)", () => {
            // When entryInfo is "entry_uid", split("_") gives ["entry", "uid"]
            // So entry_uid = "entry", variant = "uid"
            const cslpValue = "v2:content_type_uid.entry_uid.locale.field1";
            const expected: CslpData = {
                entry_uid: "entry",
                content_type_uid: "content_type_uid",
                variant: "uid",
                locale: "locale",
                cslpValue: "content_type_uid.entry_uid.locale.field1",
                fieldPath: "field1",
            };

            const result = extractDetailsFromCslp(cslpValue);

            expect(result).toEqual(expected);
        });

        test("should handle v2 format with multiple underscores in entryInfo (only first two parts used)", () => {
            // split("_") on "entry_variant_with_underscores" gives ["entry", "variant", "with", "underscores"]
            // Destructuring [entry_uid, variant] takes only first two: entry_uid = "entry", variant = "variant"
            const cslpValue =
                "v2:content_type_uid.entry_variant_with_underscores.locale.field1";
            const expected: CslpData = {
                entry_uid: "entry",
                content_type_uid: "content_type_uid",
                variant: "variant",
                locale: "locale",
                cslpValue:
                    "content_type_uid.entry_variant_with_underscores.locale.field1",
                fieldPath: "field1",
            };

            const result = extractDetailsFromCslp(cslpValue);

            expect(result).toEqual(expected);
        });

        test("should handle incomplete cslpData (missing required parts)", () => {
            // When cslpData has fewer than 3 parts, some values will be undefined
            const testCases = [
                {
                    cslpValue: "content_type_uid",
                    expected: {
                        content_type_uid: "content_type_uid",
                        entry_uid: undefined,
                        locale: undefined,
                    },
                },
                {
                    cslpValue: "content_type_uid.entry_uid",
                    expected: {
                        content_type_uid: "content_type_uid",
                        entry_uid: "entry_uid",
                        locale: undefined,
                    },
                },
            ];

            testCases.forEach(({ cslpValue, expected }) => {
                const result = extractDetailsFromCslp(cslpValue);
                expect(result.content_type_uid).toBe(expected.content_type_uid);
                expect(result.entry_uid).toBe(expected.entry_uid);
                expect(result.locale).toBe(expected.locale);
            });
        });
    });

    describe("edge cases", () => {
        test("should handle version prefix longer than 2 characters (treated as v1)", () => {
            // When version prefix length > 2, cslpVersion becomes the cslpData
            // "v10:content_type_uid.entry_uid.locale.field1" splits to ["v10", "content_type_uid.entry_uid.locale.field1"]
            // Then cslpData = "v10" (the version part), which doesn't have proper structure
            const testCases = ["v10", "v11", "v99"];

            testCases.forEach((version) => {
                const cslpValue = `${version}:content_type_uid.entry_uid.locale.field1`;
                const result = extractDetailsFromCslp(cslpValue);

                // The implementation treats the version prefix as the cslpData when version length > 2
                expect(result.content_type_uid).toBe(version);
                expect(result.entry_uid).toBeUndefined();
            });
        });

        test("should throw error when cslpData is undefined (no colon and version <= 2 chars)", () => {
            // When there's no colon and version length <= 2, cslpData stays undefined
            // This causes cslpData.split(".") to throw
            const cslpValue = "v2"; // No colon, length = 2

            expect(() => {
                extractDetailsFromCslp(cslpValue);
            }).toThrow();
        });

        test("should handle input without colon separator (treated as v1)", () => {
            // When there's no colon, split(":") returns array with single element
            // cslpVersion = entire string, cslpData = undefined
            // If version length > 2, cslpData = cslpVersion (the whole string)
            const cslpValue = "content_type_uid.entry_uid.locale.field1";
            const result = extractDetailsFromCslp(cslpValue);

            // Should work as v1 format (no version prefix)
            expect(result.content_type_uid).toBe("content_type_uid");
            expect(result.entry_uid).toBe("entry_uid");
            expect(result.locale).toBe("locale");
            expect(result.fieldPath).toBe("field1");
        });

        test("should throw error when input is empty string", () => {
            // Empty string splits to [""], so cslpVersion = "", cslpData = undefined
            // Since version length is 0 (not > 2), cslpData stays undefined
            // Then cslpData.split(".") throws
            const cslpValue = "";

            expect(() => {
                extractDetailsFromCslp(cslpValue);
            }).toThrow();
        });

        test("should handle minimal valid v1 format", () => {
            // Minimum required parts: content_type_uid.entry_uid.locale
            const cslpValue = "ct.entry.locale";
            const expected: CslpData = {
                entry_uid: "entry",
                content_type_uid: "ct",
                locale: "locale",
                cslpValue: cslpValue,
                fieldPath: "",
            };

            const result = extractDetailsFromCslp(cslpValue);

            expect(result).toEqual(expected);
        });

        test("should handle minimal valid v2 format", () => {
            const cslpValue = "v2:ct.entry.locale";
            const result = extractDetailsFromCslp(cslpValue);

            expect(result.entry_uid).toBe("entry");
            expect(result.content_type_uid).toBe("ct");
            expect(result.variant).toBeUndefined();
            expect(result.locale).toBe("locale");
            expect(result.fieldPath).toBe("");
        });
    });
});
