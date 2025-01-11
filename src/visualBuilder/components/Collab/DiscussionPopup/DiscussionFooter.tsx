/** @jsxImportSource preact */
import React, { useState } from "preact/compat";
import Button from "../Button/Button";
import ButtonGroup from "../ButtonGroup/ButtonGroup";
import classNames from "classnames";
import { collabStyles } from "../../../visualBuilder.style";

interface IDiscussionFooter {
    onClose: () => void;
    handleOnSaveRef: React.MutableRefObject<any>;
    isDisabled: boolean;
    editComment: string;
}

const DiscussionFooter = ({
    onClose,
    handleOnSaveRef,
    isDisabled,
    editComment,
}: IDiscussionFooter) => {
    const [loading, setLoading] = useState(false);
    const onSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        setLoading(true);
        event.preventDefault();
        await handleOnSaveRef.current?.();
        setLoading(false);
    };

    return (
        <div
            className={classNames(
                collabStyles()["collab-discussion-footer--wrapper"],
                collabStyles()["flex-v-center"]
            )}
        >
            <ButtonGroup>
                <Button
                    type="button"
                    buttonType="tertiary"
                    testId={"discussion-cancel-btn"}
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    buttonType="primary"
                    onClick={onSubmit}
                    testId={"discussion-save-btn"}
                    disabled={isDisabled}
                >
                    {editComment === "" ? "Post" : "Update"}
                </Button>
            </ButtonGroup>
        </div>
    );
};
export default DiscussionFooter;
