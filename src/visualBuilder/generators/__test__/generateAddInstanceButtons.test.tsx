import React from "preact/compat";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import {
    getAddInstanceButtons,
    generateAddInstanceButton,
} from "../generateAddInstanceButtons";
import AddInstanceButtonComponentActual from "../../components/addInstanceButton";

const AddInstanceButtonComponent = vi.mocked(AddInstanceButtonComponentActual);

vi.mock("../../components/addInstanceButton", async () => {
    return {
        default: vi.fn().mockImplementation(() => {
            return (
                <button data-testid="add-instance-button">
                    Add instance button
                </button>
            );
        }),
    };
});

describe("generateAddInstanceButton", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should generate and return a button", () => {
        const button = generateAddInstanceButton({
            fieldSchema: singleLineFieldSchema,
            value: "",
            // @ts-expect-error mock field metadata
            fieldMetadata: { hello: "world" },
            onClick: vi.fn(),
            // @ts-expect-error mocking preact signal
            loading: { value: false },
            index: 0,
            label: "Add Instance",
        });
        expect(button).toBeInstanceOf(HTMLButtonElement);
    });

    test("should call the AddInstanceButtonComponent with the correct props", () => {
        generateAddInstanceButton({
            fieldSchema: singleLineFieldSchema,
            value: "",
            // @ts-expect-error mock field metadata
            fieldMetadata: { hello: "world" },
            onClick: vi.fn(),
            // @ts-expect-error mocking preact signal
            loading: { value: false },
            index: 0,
            label: "Add Instance",
        });
        const args = AddInstanceButtonComponent.mock.calls[0][0];
        expect(args).toStrictEqual({
            fieldSchema: singleLineFieldSchema,
            value: "",
            fieldMetadata: { hello: "world" },
            onClick: expect.any(Function),
            loading: { value: false },
            index: 0,
            label: "Add Instance",
        });
    });
});

describe("getAddInstanceButtons", () => {
    let wrapper: HTMLDivElement;

    beforeEach(() => {
        wrapper = document.createElement("div");
        wrapper.innerHTML = `
            <button class="visual-builder__add-button"></button>
            <button class="visual-builder__add-button"></button>
        `;

        document.body.appendChild(wrapper);
    });

    afterEach(() => {
        document.body.removeChild(wrapper);
    });

    test("should return null if there are less than 2 buttons and we didn't ask for every buttons", () => {
        wrapper.innerHTML = `
            <button class="visual-builder__add-button"></button>
        `;
        const result = getAddInstanceButtons(wrapper);
        expect(result).toBeNull();
    });

    test("should return an array with previous and next buttons if there are 2 or more buttons", () => {
        const result = getAddInstanceButtons(wrapper);
        expect(result).toHaveLength(2);
        expect(result?.[0]).toBeInstanceOf(HTMLButtonElement);
        expect(result?.[1]).toBeInstanceOf(HTMLButtonElement);
    });

    test("should return all buttons if getAllButtons is true", () => {
        wrapper.innerHTML = `
      <button class="visual-builder__add-button"></button>
      <button class="visual-builder__add-button"></button>
      <button class="visual-builder__add-button"></button>
      <button class="visual-builder__add-button"></button>
    `;
        const result = getAddInstanceButtons(wrapper, true);
        expect(result).toHaveLength(4);
        expect(result![0]).toBeInstanceOf(HTMLButtonElement);
        expect(result![1]).toBeInstanceOf(HTMLButtonElement);
    });
});
