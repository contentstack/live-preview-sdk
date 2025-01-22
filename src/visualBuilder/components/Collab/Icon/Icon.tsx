
/** @jsxImportSource preact */
import React from "preact/compat";
import { JSX } from "preact";
import Tooltip from "../Tooltip/Tooltip";
import { iconComponents } from "../../icons/index";
import classNames from "classnames";
import { collabStyles } from "../../../visualBuilder.style";

type IconName = keyof typeof iconComponents;

export interface IconProps {
    icon: IconName;
    tooltipContent?: string;
    className?: string;
    withTooltip?: boolean;
    onClick?: JSX.MouseEventHandler<HTMLDivElement>;
}

const Icon = (props: IconProps) => {
    const {
        icon,
        tooltipContent,
        className,
        withTooltip,
        onClick,
        ...otherProps
    } = props;

    const IconComponent = iconComponents[icon];

    return withTooltip && tooltipContent ? (
        <div data-testid="collab-icon-tooltip">
    <Tooltip content={tooltipContent} position="bottom">
        <div className={classNames("collab-icon-wrapper",collabStyles()["collab-icon-wrapper"])} onClick={onClick} {...otherProps}>
            {IconComponent ? (
                <IconComponent
                    className={classNames("collab-icon-tooltip",collabStyles()["collab-icon-tooltip"], className)}
                    {...otherProps}
                />
            ) : null}
        </div>
    </Tooltip>
    </div>
) : (
    <div className={classNames("collab-icon-wrapper",collabStyles()["collab-icon-wrapper"])} onClick={onClick} {...otherProps}>
        {IconComponent ? (
            <div data-testid="collab-icon">
            <IconComponent
                className={classNames("collab-icon-tooltip",collabStyles()["collab-icon-tooltip"], className)}
                {...otherProps}
            />
            </div>
        ) : null}
    </div>
);

};

export default Icon;
