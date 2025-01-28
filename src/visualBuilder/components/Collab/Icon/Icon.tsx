/** @jsxImportSource preact */
import React from "preact/compat";
import { JSX } from "preact";
import Tooltip from "../Tooltip/Tooltip";
import { iconComponents } from "../../icons/CollabIcons";
import classNames from "classnames";
import { collabStyles } from "../../../visualBuilder.style";

type IconName = keyof typeof iconComponents;

export interface IconProps {
    icon: IconName;
    tooltipContent?: string;
    className?: string;
    withTooltip?: boolean;
    onClick?: JSX.MouseEventHandler<HTMLDivElement>;
    testId?: string;
}

const Icon = (props: IconProps) => {
    const {
        icon,
        tooltipContent,
        className,
        withTooltip,
        onClick,
        testId,
        ...otherProps
    } = props;

    const IconComponent = iconComponents[icon];

    return withTooltip && tooltipContent ? (
        <div data-testid={testId}>
            <Tooltip
                content={tooltipContent}
                position="bottom"
                testId="collab-icon-tooltip"
            >
                <div
                    className={classNames(
                        "collab-icon-wrapper",
                        collabStyles()["collab-icon-wrapper"]
                    )}
                    onClick={onClick}
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
            </Tooltip>
        </div>
    ) : (
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
                <div>
                    <IconComponent
                        className={classNames(
                            "collab-icon",
                            collabStyles()["collab-icon"],
                            className
                        )}
                    />
                </div>
            ) : null}
        </div>
    );
};

Icon.defaultProps = {
    testId: "collab-icon",
} as Partial<IconProps>;

export default Icon;
