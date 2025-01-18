/** @jsxImportSource preact */
import React from "preact/compat";
import SkeletonTile from "../../SkeletonTile/SkeletonTile";
import { collabStyles } from "../../../../visualBuilder.style";
import classNames from "classnames";

const ThreadBodyLoader = () => {
    return (
        <div
            className={classNames(
                "collab-thread-body-comment--loader",
                collabStyles()["collab-thread-body-comment--loader"]
            )}
        >
            <div style={{ display: "flex" }}>
                <SkeletonTile
                    numberOfTiles={1}
                    tileHeight={32}
                    tileWidth={32}
                    tileBottomSpace={0}
                    tileTopSpace={0}
                    tileleftSpace={0}
                    tileRadius={50}
                />
                <SkeletonTile
                    numberOfTiles={2}
                    tileHeight={10}
                    tileWidth={130}
                    tileBottomSpace={7}
                    tileTopSpace={3}
                    tileleftSpace={10}
                />
            </div>
            <SkeletonTile
                numberOfTiles={1}
                tileHeight={14}
                tileWidth={300}
                tileBottomSpace={5}
                tileTopSpace={0}
                tileleftSpace={0}
            />
            <SkeletonTile
                numberOfTiles={1}
                tileHeight={14}
                tileWidth={230}
                tileBottomSpace={0}
                tileTopSpace={0}
                tileleftSpace={0}
            />
        </div>
    );
};

export default ThreadBodyLoader;
