import React from "preact/compat";
import {
    act,
    cleanup,
    fireEvent,
    getByTestId,
    render,
} from "@testing-library/preact";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import AddInstanceButtonComponent from "../addInstanceButton";
import visualBuilderPostMessageActual from "../../utils/visualBuilderPostMessage";
import { getDiscussionIdByFieldMetaData } from "../../utils/getDiscussionIdByFieldMetaData";

const visualBuilderPostMessage = vi.mocked(visualBuilderPostMessageActual);

vi.mock("../../utils/visualBuilderPostMessage", async () => {
    return {
        default: {
            send: vi.fn().mockImplementation((_eventName: string) => {
                return Promise.resolve({});
            }),
            on: vi.fn(),
        },
    };
});

describe("AddInstanceButtonComponent", () => {
    afterEach(cleanup);

    test("renders button with proper class and icon", async () => {
        const onClickCallback = vi.fn();
        await act(() => {
            render(
                <AddInstanceButtonComponent
                    value={[]}
                    fieldSchema={singleLineFieldSchema}
                    // @ts-expect-error mocking fieldMetadata
                    fieldMetadata={{}}
                    index={0}
                    onClick={onClickCallback}
                    label="Add instance"
                    // @ts-expect-error mocking signal
                    loading={{ value: false }}
                />
            );
        });
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        expect(buttonElement).toBeInTheDocument();
        expect(buttonElement).toHaveClass("visual-builder__add-button");

        expect(buttonElement.querySelector("svg")).toBeTruthy();
        expect(buttonElement.querySelector("path")).toBeTruthy();
    });

    test("sends add-instance message when clicked", async () => {
        const onClickCallback = vi.fn();
        await act(() => {
            render(
                <AddInstanceButtonComponent
                    value={[]}
                    fieldSchema={singleLineFieldSchema}
                    // @ts-expect-error mocking fieldMetadata
                    fieldMetadata={{}}
                    index={0}
                    onClick={onClickCallback}
                    label="Add instance"
                    // @ts-expect-error mocking signal
                    loading={{ value: false }}
                />
            );
        });
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        await act(() => {
            fireEvent.click(buttonElement);
        });
        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            "add-instance",
            {
                fieldMetadata: {},
                index: 0,
            }
        );
    });

    test("calls onClick callback when clicked", async () => {
        const onClickCallback = vi.fn();
        await act(() => {
            render(
                <AddInstanceButtonComponent
                    value={[]}
                    fieldSchema={singleLineFieldSchema}
                    // @ts-expect-error mocking fieldMetadata
                    fieldMetadata={{}}
                    index={0}
                    onClick={onClickCallback}
                    label="Add instance"
                    // @ts-expect-error mocking signal
                    loading={{ value: false }}
                />
            );
        });
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        await act(() => {
            fireEvent.click(buttonElement);
        });
        expect(onClickCallback).toHaveBeenCalled();
    });
});
