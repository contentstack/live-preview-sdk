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

            let bestPosition = position;
            let coords = positions[position];

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const wouldBeOutsideViewport = {
                bottom: coords.top + tooltipRect.height > viewportHeight,
                top: coords.top < 0,
                left: coords.left < 0,
                right: coords.left + tooltipRect.width > viewportWidth,
            };

            const horizontalOutOfBounds =
                coords.left < 0 ||
                coords.left + tooltipRect.width > viewportWidth;

            if (wouldBeOutsideViewport[position] || horizontalOutOfBounds) {
                const positionPriority = ["bottom", "top", "right", "left"];

                positionPriority.splice(positionPriority.indexOf(position), 1);
                positionPriority.push(position);

                for (const pos of positionPriority) {
                    const testCoords = positions[pos as keyof Positions];

                    const isVisible =
                        testCoords.top >= 0 &&
                        testCoords.top + tooltipRect.height <= viewportHeight &&
                        testCoords.left >= 0 &&
                        testCoords.left + tooltipRect.width <= viewportWidth;

                    if (isVisible) {
                        bestPosition = pos as
                            | "top"
                            | "bottom"
                            | "left"
                            | "right";
                        coords = testCoords;
                        break;
                    }
                }
            }

            if (coords.left < 0) {
                coords.left = margin;
            } else if (coords.left + tooltipRect.width > viewportWidth) {
                coords.left = viewportWidth - tooltipRect.width - margin;
            }

            if (coords.top < 0) {
                coords.top = margin;
            } else if (coords.top + tooltipRect.height > viewportHeight) {
                coords.top = viewportHeight - tooltipRect.height - margin;
            }

            setActualPosition(
                bestPosition as "top" | "bottom" | "left" | "right"
            );

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
