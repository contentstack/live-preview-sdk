import { glob } from "goober";

export const loadCompareGlobalStyle = () => {
    const css = glob;
    css`
        cs-compare {
            &.cs-compare--added {
                background: rgba(0, 122, 82, 0.2);
                border-bottom: 2px solid rgba(0, 122, 82);
            }

            &.cs-compare--removed {
                background: rgba(214, 36, 0, 0.2);
                text-decoration: line-through 2px solid rgba(214, 36, 0, 1);
            }
        }
        .cs-compare__void--added {
            background: rgba(0, 122, 82, 0.2);
            outline: 2px solid rgba(0, 122, 82);
        }

        .cs-compare__void--removed {
            background: rgba(214, 36, 0, 0.2);
            outline: 2px solid rgba(214, 36, 0, 1);
        }
    `;
};
