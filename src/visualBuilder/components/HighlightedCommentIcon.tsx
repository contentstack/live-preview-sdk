import { h } from "preact";
import { VNode } from "preact";
import { ReadCommentIcon } from "./icons";

const HighlightedCommentIcon = (): VNode => {
    return (
        <>
            <ReadCommentIcon />
            <span
                style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                }}
            >
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="5" cy="5" r="4" fill="#EB5646" />
                    <circle
                        cx="5"
                        cy="5"
                        r="4.5"
                        stroke="white"
                        strokeOpacity="0.6"
                    />
                </svg>
            </span>
        </>
    );
};

export default HighlightedCommentIcon;
