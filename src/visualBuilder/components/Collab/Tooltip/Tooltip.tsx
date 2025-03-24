/** @jsxImportSource preact */
import React from "preact/compat";
import { useState, useRef, useEffect } from "preact/hooks";
import { collabStyles } from "../../../collab.style";
import { positionTooltip } from "../../../utils/collabUtils";
import classNames from "classnames";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
    testId?: string;
}

interface PositionCoords {
    top: number;
    left: number;
}

interface Positions {
    bottom: PositionCoords;
    top: PositionCoords;
    left: PositionCoords;
    right: PositionCoords;
}

const Tooltip = (props: TooltipProps): JSX.Element => {
    const {
        content,
        children,
        position = "bottom",
        className,
        testId,
        ...otherProps
    } = props;
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [actualPosition, setActualPosition] = useState<
        "top" | "bottom" | "left" | "right"
    >(position);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    const prevChildrenRef = useRef(children);

    useEffect(() => {
        if (prevChildrenRef.current !== children) {
            setIsVisible(false);
            prevChildrenRef.current = children;
        }
    }, [children]);

    useEffect(() => {
        const updateTooltip = () =>
            positionTooltip(tooltipRef, targetRef, position, setActualPosition);

        updateTooltip();
        window.addEventListener("scroll", updateTooltip);
        window.addEventListener("resize", updateTooltip);

        return () => {
            window.removeEventListener("scroll", updateTooltip);
            window.removeEventListener("resize", updateTooltip);
        };
    }, [isVisible, position]);

    return (
        <div
            ref={targetRef}
            className={classNames(
                "collab-tooltip--wrapper",
                collabStyles()["collab-tooltip--wrapper"],
                className
            )}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            data-testid={testId}
            {...otherProps}
        >
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={classNames(
                        "collab-tooltip",
                        `collab-tooltip--${actualPosition}`,
                        collabStyles()["collab-tooltip"],
                        collabStyles()[`collab-tooltip--${actualPosition}`]
                    )}
                    role="tooltip"
                    aria-hidden={!isVisible}
                    data-position={actualPosition}
                >
                    {content}
                </div>
            )}
        </div>
    );
};

Tooltip.defaultProps = {
    testId: "collab-tooltip",
} as Partial<TooltipProps>;

export default Tooltip;
