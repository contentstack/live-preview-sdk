import { numericInputRegex } from "../constants";

describe("numeric input rege", () => {
    test("should allow proper numeric inputs", () => {
        const properNumericInputs = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, -10, -12, 1.2, 1.3365, -45.25, -3.2e25,
            5e24, -9.25e-98, 3e25,
        ];

        for (const properInput of properNumericInputs) {
            expect(numericInputRegex.test(properInput.toString())).toBeTruthy();
        }
    });

    test("should disallow improper numeric inputs", () => {
        const improperNumericInputs = ["--2", "2e.25", "2e+-25", "ee", "12ed"];

        for (const improperInput of improperNumericInputs) {
            expect(
                numericInputRegex.test(improperInput.toString())
            ).toBeFalsy();
        }
    });
});
