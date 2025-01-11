/** @jsxImportSource preact */
import React from "preact/compat";
import { useState, useRef, useEffect } from "preact/hooks";
import { css } from "goober";

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

    const tooltipClass = css`
        position: fixed;
        z-index: 1000;
        padding: 8px 12px;
        font-size: 14px;
        color: #f7f9fc;
        background-color: #767676;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        /* Simple fade in */
        opacity: 0;
        animation: simpleFade 0.15s ease-in forwards;

        @keyframes simpleFade {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;

    const wrapperClass = css`
        position: relative;
        display: inline-block;
    `;

    return (
        <div
            ref={targetRef}
            className={`${wrapperClass} ${className}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={tooltipClass}
                    role="tooltip"
                    aria-hidden={!isVisible}
                >
                    {content}
                </div>
            )}
        </div>
    );
}
