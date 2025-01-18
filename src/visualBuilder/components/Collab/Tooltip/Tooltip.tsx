/** @jsxImportSource preact */
import React from "preact/compat";
import { useState, useRef, useEffect } from "preact/hooks";
import { collabStyles } from "../../../visualBuilder.style";
import classNames from "classnames";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
}

export default function Tooltip({
    content,
    children,
    position = "bottom",
    className = "",
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const positionTooltip = () => {
            if (!isVisible || !tooltipRef.current || !targetRef.current) return;

            const targetRect = targetRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const margin = 8;

            const positions = {
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

            const coords = positions[position];
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
}
