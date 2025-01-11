/** @jsxImportSource preact */
import React from "preact/compat";
import { css } from "goober";
import classNames from "classnames";
import Icon, { IconProps } from "../Icon/Icon";
import { iconComponents } from "../../icons/index";
import { collabStyles } from "../../../visualBuilder.style";

type IconName = keyof typeof iconComponents;

interface ButtonProps {
    buttonType?: "primary" | "secondary" | "tertiary" | "destructive";
    children?: React.ReactNode;
    className?: string;
    testId?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    style?: React.CSSProperties;
    href?: string;
    id?: string;
    size?: "large" | "small";
    icon?: IconName;
    iconProps?: Partial<IconProps>;
    iconAlignment?: "left" | "right" | "both";
}

const Button: React.FC<ButtonProps> = ({
    buttonType = "primary",
    children,
    className = "",
    testId,
    onClick,
    disabled = false,
    type = "button",
    style,
    href,
    id,
    size = "large",
    icon,
    iconProps,
    iconAlignment = "left",
}) => {
    const Element = href ? "a" : "button";
    let nestedChildren: React.ReactNode =
        children && React.Children.toArray([children]);

    if (icon) {
        let iconChild = <Icon icon={icon} {...iconProps} />;

        switch (iconAlignment) {
            case "left":
                nestedChildren = React.Children.toArray([
                    iconChild,
                    nestedChildren,
                ]);
                break;
            case "right":
                nestedChildren = React.Children.toArray([
                    nestedChildren,
                    iconChild,
                ]);
                break;
            case "both":
                nestedChildren = React.Children.toArray([
                    iconChild,
                    nestedChildren,
                    iconChild,
                ]);
                break;
            default:
                break;
        }
    }
    const baseStyles = css`
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        font-family: Inter, sans-serif;
        font-size: 1rem;
        font-weight: 600;
        line-height: 1;
        min-height: 2rem;
        min-width: 2rem;
        padding: 0.5rem 1rem;
        position: relative;
        text-align: center;
        transition:
            color 0.15s ease-in-out,
            background-color 0.15s ease-in-out,
            border-color 0.15s ease-in-out,
            box-shadow 0.15s ease-in-out;
        vertical-align: middle;
        cursor: ${disabled ? "not-allowed" : "pointer"};
        opacity: ${disabled ? 0.4 : 1};
        pointer-events: auto;
    `;

    const typeStyles = {
        primary: css`
            background-color: #6c5ce7 !important;
            color: #ffffff;
            &:hover {
                background-color: #5d50be !important;
            }
            &:focus {
                box-shadow: 0px 0px 0px 2px #ada4f4 !important;
            }
            &:active {
                background-color: #3e3871 !important;
            }
        `,
        secondary: css`
            background-color: #f9f8ff !important;
            border: 1px solid #6c5ce7 !important;
            color: #6c5ce7 !important;
            &:hover {
                border-color: #5d50be !important;
                color: #5d50be !important;
            }
            &:focus {
                box-shadow: 0px 0px 0px 2px #ada4f4 !important;
            }
            &:active {
                border-color: #3e3871 !important;
                color: #3e3871 !important;
            }
        `,
        tertiary: css`
            color: #6c5ce7 !important;
            &:hover {
                color: #5d50be !important;
            }
            &:focus {
                box-shadow: 0px 0px 0px 2px #ada4f4 !important;
            }
        `,
        destructive: css`
            background-color: #a31b00 !important;
            color: #ffffff !important;
            &:hover {
                background-color: #701300 !important;
            }
            &:focus {
                box-shadow: 0px 0px 0px 2px #ada4f4 !important;
            }
        `,
    };

    const sizeStyles = {
        large: css`
            font-size: 1rem;
            min-height: 2.5rem;
            max-height: 2.5rem;
        `,
        regular: css`
            margin-top: -1px;
        `,
        small: css`
            font-size: 0.875rem;
            min-height: 2rem;
            max-height: 2rem;
            padding: 0.3125rem 1rem;
        `,
    };
    const iconAlignmentStyles = {
        left: css`
            svg:first-child {
                float: left;
                margin-left: 0;
                margin-right: 0.5rem;
            }
        `,
        right: css`
            svg:first-child {
                float: right;
                margin-left: 0.5rem;
                margin-right: 0;
            }
        `,
        both: css`
            svg:first-child {
                float: left;
                margin-right: 0.5rem;
                margin-left: 0;
            }
            svg:last-child {
                float: right;
                margin-left: 0.5rem;
                margin-right: 0;
            }
        `,
    };

    const combinedClassName = classNames(
        baseStyles,
        typeStyles[buttonType],
        sizeStyles[size],
        icon && iconAlignmentStyles[iconAlignment],
        className
    );
    // Ensure style is valid
    const validStyle = Object.fromEntries(
        Object.entries(style || {}).filter(([_, value]) => value != null)
    );

    return (
        <Element
            className={combinedClassName}
            id={id}
            onClick={onClick}
            type={type}
            style={validStyle as React.CSSProperties}
            disabled={disabled}
            href={href}
            data-testid={testId}
        >
            <div className={collabStyles()["flex-center"]}>
                <div
                    className={classNames(collabStyles()["flex-v-center"], {
                        [sizeStyles.regular]: size !== "small",
                    })}
                >
                    {nestedChildren}
                </div>
            </div>
        </Element>
    );
};

export default Button;
