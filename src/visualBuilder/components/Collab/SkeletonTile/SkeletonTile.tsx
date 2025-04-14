/** @jsxImportSource preact */
import React from "preact/compat";
import { collabStyles } from "../../../collab.style";
import classNames from "classnames";

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
            data-testid={testId}
            height={svgHeight}
            width={svgWidth}
            className={classNames(
                "collab-skeletonTileSvgClass",
                collabStyles()["collab-skeletonTileSvgClass"]
            )}
            fill="#EDF1F7"
        >
            {Array.from({ length: numberOfTiles }).map((_, index) => (
                <g key={index}>
                    <rect
                        data-testid="rect"
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

SkeletonTile.defaultProps = {
    testId: "collab-skeletonTile",
} as Partial<SkeletonTileProps>;

export default SkeletonTile;
