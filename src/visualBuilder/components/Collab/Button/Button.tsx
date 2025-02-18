/** @jsxImportSource preact */
import React from "preact/compat";
import { JSX } from "preact";
import classNames from "classnames";
import Icon, { IconProps } from "../Icon/Icon";
import { iconComponents } from "../../icons/CollabIcons";
import { collabStyles } from "../../../collab.style";

type IconName = keyof typeof iconComponents;

interface ButtonProps {
    buttonType?: "primary" | "secondary" | "tertiary" | "destructive";
    children?: React.ReactNode;
    className?: string;
    testId?: string;
    onClick?: JSX.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
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

    const combinedClassName = classNames(
        collabStyles()["collab-button--basestyle"],
        collabStyles()["collab-button--type"][buttonType],
        collabStyles()["collab-button--size"][size],
        icon && collabStyles()["collab-button--icon-allignment"][iconAlignment],
        disabled && collabStyles()["collab-button--disabled"],
        className,

        `collab-button collab-button--${buttonType} collab-button--${size} ${
            icon ? `collab-button--icon-${iconAlignment}` : ""
        } ${disabled ? "collab-button--disabled" : ""}`
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
            <div
                className={classNames(
                    "flex-center",
                    collabStyles()["flex-center"]
                )}
            >
                <div
                    className={classNames(
                        "flex-v-center",
                        collabStyles()["flex-v-center"],
                        {
                            [`${collabStyles()["collab-button--size"]["regular"]} collab-button--regular`]:
                                size !== "small",
                        }
                    )}
                >
                    {nestedChildren}
                </div>
            </div>
        </Element>
    );
};

export default Button;
