import { h, cloneElement } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow
} from '@floating-ui/dom';
import { visualBuilderStyles } from '../visualBuilder.style';
import classNames from 'classnames';
import { ContentTypeIcon } from './icons';
import { FieldTypeIconsMap } from '../generators/generateCustomCursor';
interface TooltipProps {
  children: JSX.Element;
  content: JSX.Element;
  placement?: 'top-start' | 'bottom-start' | 'left-start' | 'right-start';
}

/**
 * A lightweight, reusable tooltip component for Preact powered by Floating UI.
 *
 * @param {object} props - The component props.
 * @param {preact.ComponentChildren} props.children - The single child element that triggers the tooltip.
 * @param {string | preact.VNode} props.content - The content to display inside the tooltip.
 * @param {'top'|'bottom'|'left'|'right'} [props.placement='top'] - The desired placement of the tooltip.
 */
const Tooltip = ({ children, content, placement = 'top-start' }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    // Create refs for the trigger and the floating tooltip elements
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const arrowRef = useRef(null);

    const showTooltip = () => setIsVisible(true);
    const hideTooltip = () => setIsVisible(false);

    // This effect calculates the tooltip's position whenever it becomes visible
    // or if its content or placement changes.
    useEffect(() => {
        if (!isVisible || !triggerRef.current || !tooltipRef.current) {
            return;
        }

        const trigger = triggerRef.current as HTMLElement;
        const tooltip = tooltipRef.current as HTMLElement;

        computePosition(trigger, tooltip, {
            placement,
            // Middleware runs in order to modify the position
            middleware: [
                offset(8), // Add 8px of space between the trigger and tooltip
                flip(),    // Flip to the opposite side if it overflows
                shift({ padding: 5 }), // Shift to keep it in view
                ...(arrowRef.current ? [arrow({ element: arrowRef.current as HTMLElement })] : []), // Handle arrow positioning
            ],
        }).then(({ x, y, placement, middlewareData }) => {
            // Apply the calculated coordinates to the tooltip element
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });

            // Position the arrow element
            if (middlewareData.arrow && arrowRef.current) {
                const { x: arrowX, y: arrowY } = middlewareData.arrow;
                const side = placement.split('-')[0];
                const staticSide = {
                    top: 'bottom',
                    right: 'left',
                    bottom: 'top',
                    left: 'right',
                }[side] as string;

                const arrowElement = arrowRef.current as HTMLElement;
                
                // Reset all positioning properties
                Object.assign(arrowElement.style, {
                    left: '',
                    top: '',
                    right: '',
                    bottom: '',
                });

                // For placements like top-start, bottom-start, etc., we want the arrow 
                // to be centered on the tooltip rather than pointing at the trigger center
                if (placement.includes('-start') || placement.includes('-end')) {
                    const tooltipRect = tooltip.getBoundingClientRect();
                    
                    if (side === 'top' || side === 'bottom') {
                        // For top/bottom placements, center the arrow horizontally
                        arrowElement.style.left = `${tooltipRect.width / 2 - 4}px`; // 4px = half arrow width
                        if (arrowY != null) {
                            arrowElement.style.top = `${arrowY}px`;
                        }
                    } else {
                        // For left/right placements, center the arrow vertically
                        arrowElement.style.top = `${tooltipRect.height / 2 - 4}px`; // 4px = half arrow height
                        if (arrowX != null) {
                            arrowElement.style.left = `${arrowX}px`;
                        }
                    }
                } else {
                    // For regular placements (top, bottom, left, right), use floating-ui's positioning
                    if (arrowX != null) {
                        arrowElement.style.left = `${arrowX}px`;
                    }
                    if (arrowY != null) {
                        arrowElement.style.top = `${arrowY}px`;
                    }
                }

                // Position arrow to overlap the tooltip's border
                (arrowElement.style as any)[staticSide] = '-4px';
            }
        });

    }, [isVisible, placement, content]);

    // We need to clone the child element to attach our ref and event listeners.
    // This ensures we don't wrap the child in an extra <div>.
    const triggerWithListeners = cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
        'aria-describedby': 'lightweight-tooltip' // for accessibility
    });

    return (
        <>
            {triggerWithListeners}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    id="lightweight-tooltip"
                    className={classNames("tooltip-container", visualBuilderStyles()["tooltip-container"])}
                >
                    {content}
                    <div ref={arrowRef} className={classNames("tooltip-arrow", visualBuilderStyles()["tooltip-arrow"])}></div>
                </div>
            )}
        </>
    );
};

function ToolbarTooltipContent({contentTypeName, referenceFieldName}: {contentTypeName: string, referenceFieldName: string}) {
  return (
    <div className={classNames("toolbar-tooltip-content", visualBuilderStyles()["toolbar-tooltip-content"])}>
      {
        referenceFieldName && (
          <div className={classNames("toolbar-tooltip-content-item", visualBuilderStyles()["toolbar-tooltip-content-item"])}>
            <div dangerouslySetInnerHTML={{__html: FieldTypeIconsMap.reference}} className={classNames("visual-builder__field-icon", visualBuilderStyles()["visual-builder__field-icon"])}/>
            <p>{referenceFieldName}</p>
          </div>
        )
      }
      {
        contentTypeName && (
          <div className={classNames("toolbar-tooltip-content-item", visualBuilderStyles()["toolbar-tooltip-content-item"])}>
            <ContentTypeIcon />
            <p>{contentTypeName}</p>
          </div>
        )
      }
    </div>
  )
}

export function ToolbarTooltip({children, data, disabled = false}: {children: JSX.Element, data: {contentTypeName: string, referenceFieldName: string}, disabled?: boolean}) {
  if (disabled) {
    return children;
  }
  const { contentTypeName, referenceFieldName } = data;
  return (
    <Tooltip content={<ToolbarTooltipContent contentTypeName={contentTypeName} referenceFieldName={referenceFieldName} />}>
      {children}
    </Tooltip>
  )
}

export default Tooltip;