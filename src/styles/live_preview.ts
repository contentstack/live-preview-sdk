import { glob } from "goober";

// HACK TO GET SYNTAX HIGHLIGHTING
const css = glob;

css`
    .cslp-edit-mode {
        outline: 1px dashed #6c5ce7 !important;
        position: relative !important;
    }

    button#cslp-tooltip {
        background: transparent;
        height: 35px;
        width: 72px;
        position: fixed;
        z-index: 200 !important;
        top: -100%;
        border: 0;
        display: flex;
        padding: 0;
    }

    div#cslp-tooltip-inner-container {
        padding: 0;
        display: flex;
        outline: none;
        border: none;
        margin: 0;
        height: 35px;
        width: 72px;
        background: white;
        font-weight: 400 !important;
        color: #718096 !important;
        transition: background 0.2s;
        text-align: center !important;
        border-radius: 8px !important;
        font-size: 14px !important;
        justify-content: space-around;
        align-items: center;
        box-shadow: 0px 8px 20px 0px #2222221a;
        box-sizing: border-box;
    }

    div#cslp-tooltip-inner-container div {
        display: flex;
        justify-content: space-around;
        border-radius: 6px !important;
        cursor: pointer;
    }

    div#cslp-tooltip-inner-container div.cslp-tooltip-child:hover {
        background: #edf2f7;
    }

    div#cslp-tooltip-inner-container div.cslp-tooltip-child:active:hover {
        background: #c7d0e1;
    }

    div#cslp-tooltip-inner-container > div {
        display: flex;
        justify-content: space-evenly;
        white-space: nowrap;
        width: 70px;
    }

    div#cslp-tooltip-inner-container .cslp-tooltip-child.singular {
        padding: 9px 1px;
    }

    div.multiple div.cslp-tooltip-child {
        padding: 9px;
    }

    div.multiple div.cslp-tooltip-child:before {
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

    div.multiple div.cslp-tooltip-child:hover:before {
        opacity: 1;
    }
`;
