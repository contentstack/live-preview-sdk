import React from "preact/compat";
import { css, keyframes } from "goober";

const progressSlide = keyframes`
  0%, 100% {
    fill: var(--color-base-gray-5); /* Replace with an actual color or CSS variable */
  }
  60% {
    opacity: 0.4;
  }
`;

const skeletonTileSvgClass = css`
    & > g rect {
        animation: ${progressSlide} 1.8s infinite;
    }
`;

export type SkeletonTileProps = {
    numberOfTiles: number;
    tileHeight: number;
    tileWidth: number | string;
    tileBottomSpace: number;
    tileTopSpace: number;
    tileleftSpace: number;
    tileRadius?: number;
    testId?: string;
};

const SkeletonTile: React.FC<SkeletonTileProps> = (props) => {
    const {
        numberOfTiles,
        tileleftSpace,
        tileTopSpace,
        tileHeight,
        tileBottomSpace,
        tileWidth,
        testId,
        tileRadius = 7,
    } = props;

    const svgHeight =
        numberOfTiles * tileHeight +
        numberOfTiles * tileBottomSpace +
        numberOfTiles * tileTopSpace;

    const svgWidth =
        typeof tileWidth === "string" ? tileWidth : tileWidth + tileleftSpace;

    return (
        <svg
            data-test-id={testId}
            height={svgHeight}
            width={svgWidth}
            className={skeletonTileSvgClass}
            fill="#EDF1F7"
        >
            {Array.from({ length: numberOfTiles }).map((_, index) => (
                <g key={index}>
                    <rect
                        x={tileleftSpace}
                        y={
                            index * (tileHeight + tileBottomSpace) +
                            tileTopSpace
                        }
                        rx={tileRadius}
                        width={tileWidth}
                        height={tileHeight}
                    />
                </g>
            ))}
        </svg>
    );
};

export default SkeletonTile;
