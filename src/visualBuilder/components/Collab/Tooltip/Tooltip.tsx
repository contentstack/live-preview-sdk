/** @jsxImportSource preact */
import React from "preact/compat";
import { useState, useRef, useEffect } from "preact/hooks";
import { collabStyles } from "../../../collab.style";
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
    const tooltipRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const positionTooltip = (): void => {
            if (!isVisible || !tooltipRef.current || !targetRef.current) return;

            const targetRect: DOMRect =
                targetRef.current.getBoundingClientRect();
            const tooltipRect: DOMRect =
                tooltipRef.current.getBoundingClientRect();
            const margin: number = 8;

            const positions: Positions = {
                bottom: {
                    top: targetRect.bottom + margin,
                    left:
                        targetRect.left +
                        (targetRect.width - tooltipRect.width) / 2,
                },
                top: {
                    top: targetRect.top - tooltipRect.height - margin,
                    left:
                        targetRect.left +
                        (targetRect.width - tooltipRect.width) / 2,
                },
                left: {
                    top:
                        targetRect.top +
                        (targetRect.height - tooltipRect.height) / 2,
                    left: targetRect.left - tooltipRect.width - margin,
                },
                right: {
                    top:
                        targetRect.top +
                        (targetRect.height - tooltipRect.height) / 2,
                    left: targetRect.right + margin,
                },
            };

            const coords: PositionCoords = positions[position];
            Object.assign(tooltipRef.current.style, {
                top: `${coords.top}px`,
                left: `${coords.left}px`,
            });
        };

        positionTooltip();
        window.addEventListener("scroll", positionTooltip);
        window.addEventListener("resize", positionTooltip);

        return () => {
            window.removeEventListener("scroll", positionTooltip);
            window.removeEventListener("resize", positionTooltip);
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
                        collabStyles()["collab-tooltip"]
                    )}
                    role="tooltip"
                    aria-hidden={!isVisible}
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
