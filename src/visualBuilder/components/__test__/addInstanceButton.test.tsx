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
import {
    clearAllEntryFieldLockInfo,
    setEntryFieldLockInfo,
} from "../../utils/fieldLockStore";

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
                    onFieldLockRefused={vi.fn()}
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
                    onFieldLockRefused={vi.fn()}
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
                    onFieldLockRefused={vi.fn()}
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
    test("calls onFieldLockRefused instead of onClick when the lock is refused", async () => {
        visualBuilderPostMessage!.send.mockResolvedValueOnce({
            fieldLockRefused: true,
        });
        const onClickCallback = vi.fn();
        const onFieldLockRefused = vi.fn();
        await act(() => {
            render(
                <AddInstanceButtonComponent
                    value={[]}
                    fieldSchema={singleLineFieldSchema}
                    // @ts-expect-error mocking fieldMetadata
                    fieldMetadata={{}}
                    index={0}
                    onClick={onClickCallback}
                    onFieldLockRefused={onFieldLockRefused}
                    label="Add instance"
                    // @ts-expect-error mocking signal
                    loading={{ value: false }}
                />
            );
        });
        await act(() => {
            fireEvent.click(
                getByTestId(document.body, "visual-builder-add-instance-button")
            );
        });
        expect(onFieldLockRefused).toHaveBeenCalled();
        expect(onClickCallback).not.toHaveBeenCalled();
    });
    describe("a collaborator inside the container", () => {
        const fieldMetadata = {
            entry_uid: "e1",
            locale: "en-us",
            fieldPathWithIndex: "group",
        };
        const lockIn = (path: string) =>
            setEntryFieldLockInfo(
                { entryUid: "e1", locale: "en-us" },
                {
                    [path]: {
                        user: { uid: "u2", name: "Watcher" },
                        ttl: "2030-01-01",
                        isLocked: true,
                        isOwn: false,
                    },
                }
            );
        const renderButton = async () => {
            await act(() => {
                render(
                    <AddInstanceButtonComponent
                        value={[]}
                        fieldSchema={singleLineFieldSchema}
                        // @ts-expect-error partial fieldMetadata
                        fieldMetadata={fieldMetadata}
                        index={0}
                        onClick={vi.fn()}
                        onFieldLockRefused={vi.fn()}
                        // @ts-expect-error mocking signal
                        loading={{ value: false }}
                    />
                );
            });
            return getByTestId(
                document.body,
                "visual-builder-add-instance-button"
            );
        };

        afterEach(() => clearAllEntryFieldLockInfo());

        test("is disabled with the holder in the tooltip", async () => {
            lockIn("group.1.title");
            const button = await renderButton();
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute(
                "data-tooltip",
                "This field is locked by Watcher"
            );
        });

        test("re-enables when the lock goes", async () => {
            lockIn("group.1");
            const button = await renderButton();
            await act(() =>
                setEntryFieldLockInfo({ entryUid: "e1", locale: "en-us" }, {})
            );
            expect(button).not.toBeDisabled();
            expect(button).toHaveAttribute("data-tooltip", "Add section");
        });
    });
});
