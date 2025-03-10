/** @jsxImportSource preact */
import React from "preact/compat";
import classNames from "classnames";
import { collabStyles } from "../../../collab.style";

type AsyncLoaderProps = {
    className?: string;
    color?: "primary" | "secondary" | "tertiary" | "destructive";
    testId?: string;
};

const AsyncLoader = ({
    className,
    color = "primary",
    testId = "collab-async-loader",
    ...otherProps
}: AsyncLoaderProps) => {
    const combinedClassName = classNames(
        collabStyles()["collab-button--loader--animation"],
        collabStyles()["collab-button--loading--color"][color],
        "collab-button--loader--animation",
        `collab-button--loading--${color}`
    );
    return (
        <div
            className={classNames(
                "collab-button--loader",
                collabStyles()["collab-button--loader"],
                className
            )}
            {...otherProps}
            data-testid={testId}
        >
            <div className={combinedClassName} />
            <div className={combinedClassName} />
            <div className={combinedClassName} />
        </div>
    );
};

export default AsyncLoader;
