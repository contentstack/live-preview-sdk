/** @jsxImportSource preact */
import React from "preact/compat";
import { JSX } from "preact";
import { useState } from "preact/hooks";
import Button from "../Button/Button";
import ButtonGroup from "../ButtonGroup/ButtonGroup";
import classNames from "classnames";
import { collabStyles, flexAlignCenter } from "../../../collab.style";
import { IThreadFooter } from "../../../types/collab.types";

const ThreadFooter = ({
    onClose,
    handleOnSaveRef,
    isDisabled,
    editComment,
}: IThreadFooter) => {
    const [loading, setLoading] = useState(false);
    const [isDisabledState, setIsDisabledState] = useState(false);
    const onSubmit: JSX.MouseEventHandler<HTMLButtonElement> = async (
        event
    ) => {
        setLoading(true);
        setIsDisabledState(true);
        event.preventDefault();
        await handleOnSaveRef.current?.();
        setIsDisabledState(false);
        setLoading(false);
    };

    return (
        <div
            className={classNames(
                "collab-thread-footer--wrapper",
                "flex-v-center",
                collabStyles()["collab-thread-footer--wrapper"],
                flexAlignCenter
            )}
        >
            <ButtonGroup>
                <Button
                    type="button"
                    buttonType="tertiary"
                    testId={"thread-cancel-btn"}
                    onClick={() => onClose(false)}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    buttonType="primary"
                    onClick={onSubmit}
                    testId={"thread-save-btn"}
                    disabled={isDisabled || isDisabledState}
                    isLoading={loading}
                >
                    {editComment === "" ? "Post" : "Update"}
                </Button>
            </ButtonGroup>
        </div>
    );
};
export default ThreadFooter;
