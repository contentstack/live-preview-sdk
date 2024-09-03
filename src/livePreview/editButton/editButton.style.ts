import { css } from "goober";

export function cslpTagStyles() {
    return {
        "cslp-edit-mode": css`
            outline: 1px dashed #6c5ce7 !important;
            position: relative !important;
        `,
        "cslp-tooltip": css`
            background: transparent;
            height: 35px;
            width: 72px;
            position: fixed;
            z-index: 200 !important;
            top: -100%;
            border: 0;
            display: flex;
            padding: 0;
        `,
        multiple: css`
            & div.cslp-tooltip-child {
                padding: 9px;
            }

            & div.cslp-tooltip-child:before {
                opacity: 0;
                font-size: 12px;
                font-weight: 400;
                pointer-events: none;
                content: attr(data-title);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                position: absolute;
                background: #4a5568;
                top: -30px;
                transition: 0.2s all ease-in-out;
            }

            & div.cslp-tooltip-child:hover:before {
                opacity: 1;
            }
        `,
    } as const;
}
