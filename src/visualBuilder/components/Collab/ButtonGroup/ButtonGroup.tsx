/** @jsxImportSource preact */
import { css } from "goober";
import React from "preact/compat";
import cn from "classnames";

export type ButtonGroupProps = {
    /**
     * Provides the class names to be appended to this prop.
     */
    className?: string;
    /**
     * Add child elements defined within a component.
     */
    children?: React.ReactNode;
    /**
     * Pass the CSS properties for the button group.
     */
    style?: React.CSSProperties;
    /**
     * Pass an ID that you can use for testing purposes. It is applied as a data attribute (data-test-id).
     */
    testId?: string;
};

const StyledButtonGroup = css`
    display: flex;
    & > button {
        margin-right: 1rem;
        &:last-child {
            margin-right: 0;
        }
    }
`;
const ButtonGroup = (props: ButtonGroupProps) => {
    const { className, children, style, testId, ...otherProps } = props;
    const classNames = cn(StyledButtonGroup, className);

    return (
        <div
            className={classNames}
            style={style}
            data-test-id={testId}
            {...otherProps}
        >
            {children}
        </div>
    );
};

ButtonGroup.defaultProps = {
    testId: "cs-button-group",
} as Partial<ButtonGroupProps>;

export default ButtonGroup;
