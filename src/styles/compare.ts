import { glob } from "goober";

export const loadCompareGlobalStyle = () => {
    const css = glob;
    css`
        .green {
            background: rgba(0, 122, 82, 0.2);
            border-bottom: 2px solid rgba(0, 122, 82);
        }

        .red {
            background: rgba(214, 36, 0, 0.2);
            text-decoration: line-through 2px solid rgba(214, 36, 0, 1);
        }

        .void-green {
            background: rgba(0, 122, 82, 0.2);
            outline: 2px solid rgba(0, 122, 82);
        }

        .void-red {
            background: rgba(214, 36, 0, 0.2);
            outline: 2px solid rgba(214, 36, 0, 1);
        }
    `;
};
