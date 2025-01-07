import { visualBuilderStyles } from "../visualBuilder.style";
import classNames from "classnames";

const CollabIndicator = () => {
    return (
        <button
            className={classNames(
                "visual-builder__collab-indicator",
                visualBuilderStyles()["visual-builder__collab-indicator"]
            )}
        >
            1
        </button>
    );
};

export default CollabIndicator;
