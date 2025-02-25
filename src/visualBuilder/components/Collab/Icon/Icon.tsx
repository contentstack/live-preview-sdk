/** @jsxImportSource preact */
import React from "preact/compat";
import { JSX } from "preact";
import Tooltip from "../Tooltip/Tooltip";
import { iconComponents } from "../../icons/CollabIcons";
import classNames from "classnames";
import { collabStyles } from "../../../collab.style";

type IconName = keyof typeof iconComponents;

export interface IconProps {
    icon: IconName;
    tooltipContent?: string;
    className?: string;
    withTooltip?: boolean;
    onClick?: JSX.MouseEventHandler<HTMLDivElement>;
    testId?: string;
}

const IconWrapper = ({
    icon,
    className,
    onClick,
    testId, 
    ...otherProps
}: Omit<IconProps, "withTooltip" | "tooltipContent">) => {
    const IconComponent = iconComponents[icon];

    return (
        <div
            className={classNames(
                "collab-icon-wrapper",
                collabStyles()["collab-icon-wrapper"]
            )}
            onClick={onClick}
            data-testid={testId}
            {...otherProps}
        >
            {IconComponent ? (
                <IconComponent
                    className={classNames(
                        "collab-icon",
                        collabStyles()["collab-icon"],
                        className
                    )}
                />
            ) : null}
        </div>
    );
};

const withTooltip = (Component: typeof IconWrapper) => ({
    withTooltip = false,
    tooltipContent = "",
    testId = "collab-icon",
    ...props
}: IconProps) => {
    return withTooltip && tooltipContent ? (
        <div data-testid={testId}>
            <Tooltip content={tooltipContent} position="bottom" testId="collab-icon-tooltip">
                <Component {...props}  />
            </Tooltip>
        </div>
    ) : (
        
        <Component {...props} testId={testId} />
    );
};

const Icon = withTooltip(IconWrapper);

export default Icon;
