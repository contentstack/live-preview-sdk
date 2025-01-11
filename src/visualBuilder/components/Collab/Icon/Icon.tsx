
/** @jsxImportSource preact */
import React from "preact/compat";
import { JSX } from "preact";
import Tooltip from "../Tooltip/Tooltip";
import { iconComponents } from "../../icons/index";
import { css } from "goober";

type IconName = keyof typeof iconComponents;

export interface IconProps {
    icon: IconName;
    tooltipContent?: string;
    className?: string;
    withTooltip?: boolean;
    onClick?: JSX.MouseEventHandler<HTMLDivElement>;
}

const tooltipClass = css`
    height: 1.25rem;
    width: 1.25rem;
`;

const wrapperClass = css`
    padding: 0 0.5rem;
`;

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
    <Tooltip content={tooltipContent} position="bottom">
        <div className={wrapperClass} onClick={onClick} {...otherProps}>
            {IconComponent ? (
                <IconComponent
                    className={`${tooltipClass} ${className || ""}`}
                    {...otherProps}
                />
            ) : null}
        </div>
    </Tooltip>
) : (
    <div className={wrapperClass} onClick={onClick} {...otherProps}>
        {IconComponent ? (
            <IconComponent
                className={`${tooltipClass} ${className || ""}`}
                {...otherProps}
            />
        ) : null}
    </div>
);

};

export default Icon;
