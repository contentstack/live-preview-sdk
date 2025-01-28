/** @jsxImportSource preact */
import React from "preact/compat";
import cn from "classnames";
import { collabStyles } from "../../../visualBuilder.style";

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
     * Pass an ID that you can use for testing purposes. It is applied as a data attribute (data-testid).
     */
    testId?: string;
};

const ButtonGroup = (props: ButtonGroupProps) => {
    const { className, children, style, testId, ...otherProps } = props;
    const classNames = cn(
        "collab-button-group",
        collabStyles()["collab-button-group"],
        className
    );

    return (
        <div
            className={classNames}
            style={style}
            data-testid={testId}
            {...otherProps}
        >
            {children}
        </div>
    );
};

ButtonGroup.defaultProps = {
    testId: "collab-button-group",
} as Partial<ButtonGroupProps>;

export default ButtonGroup;
