import { css } from "goober";

const tooltipBaseStyle = `
    pointer-events: all;
    svg {
        pointer-events: none;
    }
    &:before {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 20px;
        margin-bottom: 24px;
        padding: 12px;
        border-radius: 4px;
        width: max-content;
        max-width: 200px;
        color: #fff;
        font-family: Inter;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
        line-height: 132%; /* 0.99rem */
        letter-spacing: 0.015rem;
        background: #767676;
    }
    &:after {
        content: "";
        position: absolute;
        bottom: 25px;
        /* the arrow */
        border: 10px solid #000;
        border-color: #767676 transparent transparent transparent;
    }
`;

export function visualBuilderStyles() {
    return {
        "visual-builder__container": css`
            --outline-transition: all 0.15s ease-in;
            font-family: "Inter", sans-serif;
        `,
        "visual-builder__cursor": css`
            visibility: hidden;
            height: 0;

            &.visible {
                visibility: visible;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 2147483647 !important;

                color: #fff;

                height: auto;
                padding: 0 10px;

                display: flex;
                align-items: center;
                justify-content: center;

                pointer-events: none !important;
                position: fixed !important;
                cursor: none;
            }
        `,
        "visual-builder__overlay__wrapper": css`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            visibility: hidden;
            z-index: 199;

            pointer-events: none;

            &.visible {
                visibility: visible;
            }
        `,
        "visual-builder__overlay--outline": css`
            position: absolute;
            outline: 4px solid #715cdd;
            transition: var(--outline-transition);
        `,
        "visual-builder__overlay": css`
            background: rgba(0, 0, 0, 0.3);
            box-sizing: content-box;
            pointer-events: all;
            position: absolute;
            transition: var(--outline-transition);
        `,
        "visual-builder__add-button": css`
            position: absolute;
            pointer-events: all;

            background: #ffffff;
            color: #475161;

            border-radius: 4px;
            border: 1px solid #6c5ce7;

            height: 32px;
            min-width: 32px;
            max-width: 180px;
            padding: 8px 6px;
            transform: translate(-50%, -50%);

            font-weight: 600;
            color: #6c5ce7;
            overflow: hidden;

            z-index: 200;

            display: grid;
            grid-template-columns: min-content 0fr;
            align-content: center;
            gap: 0;

            transition:
                grid-template-columns 0.25s,
                left 0.15s ease-in,
                top 0.15s ease-in,
                gap 0.15s ease-in;

            &:has(.visual-builder__add-button-label):hover {
                grid-template-columns: min-content 1fr;
                gap: 8px;
                padding: 8px 16px;
            }

            svg {
                fill: #6c5ce7;
            }

            &:disabled {
                border-color: #bbbec3;
                cursor: not-allowed;
            }

            &:disabled svg {
                fill: #bbbec3;
            }
        `,
        "visual-builder__add-button-label": css`
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `,
        "visual-builder__start-editing-btn": css`
            z-index: 1000;
            text-decoration: none;
            position: fixed;
            bottom: 30px;
            right: 30px;
            box-shadow:
                0px 4px 15px 0px rgba(108, 92, 231, 0.2),
                0px 3px 14px 3px rgba(0, 0, 0, 0.12),
                0px 8px 10px 1px rgba(0, 0, 0, 0.14);
            display: inline-flex;
            padding: 0.5rem 1rem;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;

            border-radius: 4px;
            border: 1px solid transparent;
            background: #6c5ce7;
            transition:
                background-color 0.15s ease-in-out,
                border-color 0.15s ease-in-out,
                box-shadow 0.15s ease-in-out,
                -webkit-box-shadow 0.15s ease-in-out;

            &:hover {
                background-color: #5d50be;
            }
            &:focus {
                outline: none;
                box-shadow: 0 0 0 2px #ada4f4;
            }
            & > span {
                color: #fff;
                /* Body/P1 Bold */
                font-size: 1rem;
                font-family: Inter;
                font-weight: 600;
                line-height: 150%;
                letter-spacing: 0.01rem;
                text-transform: capitalize;
            }

            & > svg {
                color: #fff;
                font-size: 1rem;
                font-family: Inter;
                font-weight: 600;
                line-height: 150%;
                letter-spacing: 0.01rem;
                text-transform: capitalize;
            }
        `,
        "visual-builder__cursor-icon": css`
            height: 40px;
            width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #5d50be;
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 0;
        `,
        "visual-builder__cursor-pointer": css`
            position: absolute;
            top: -8px;
            left: -8px;
        `,
        "visual-builder__cursor-icon--loader": css`
            animation: visual-builder__spinner 1s linear infinite;
        `,
        "visual-builder__focused-toolbar": css`
            position: absolute;
            transform: translateY(-100%);
            z-index: 200;
            gap: 8px;
            width: 0;
            display: flex;
            align-items: end;
            transition: var(--outline-transition);
        `,
        "visual-builder__focused-toolbar__field-label-wrapper__current-field": css`
            padding: 4px 8px !important;
            background: #6c5ce7;
            color: #fff;
            z-index: 1;
            border-radius: 2px !important;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: fit-content;

            &:disabled {
                filter: contrast(0.7);
            }

            .visual-builder__focused-toolbar__text {
                padding-right: 3px;
                height: 16px;
            }
        `,
        "visual-builder__focused-toolbar__field-label-wrapper__parent-field": css`
            pointer-events: none;
            color: #5d50be;
            padding: 4px !important;
            margin-bottom: 3px;
            display: none;
            width: fit-content;
            position: absolute;
            z-index: 1000;
        `,
        "field-label-dropdown-open": css`
            .visual-builder__focused-toolbar__field-label-wrapper__parent-field {
                pointer-events: all;
                visibility: visible;
                display: initial;
            }

            .visual-builder__button--secondary:hover {
                background-color: #6c5ce7;
                color: #f9f8ff;
            }
        `,
        "visual-builder__focused-toolbar__field-label-wrapper": css`
            display: flex;
            flex-direction: column-reverse;
            position: relative;
        `,
        "visual-builder__focused-toolbar__field-label-container": css`
            display: flex;
            column-gap: 0.5rem;
            align-items: center;
        `,
        "visual-builder__button": css`
            background-color: transparent;
            border: 1px solid transparent;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 600;
            line-height: 100%;
            padding: 8px 16px;
            text-align: center;
            transition:
                color 0.15s ease-in-out,
                background-color 0.15s ease-in-out,
                border-color 0.15s ease-in-out,
                box-shadow 0.15s ease-in-out;
            // vertical-align: middle;
        `,
        "visual-builder__button--primary": css`
            background-color: #6c5ce7;
            color: #fff;

            &:hover {
                background-color: #5d50be;
            }
        `,
        "visual-builder__button--secondary": css`
            background-color: #f9f8ff;
            border: 1px solid #6c5ce7;
            color: #6c5ce7;
        `,
        "visual-builder__button--edit": css`
            svg {
                height: 16px;
                width: 16px;

                path {
                    fill: #475161;
                }
            }
        `,
        "visual-builder__button-loader": css`
            svg.loader {
                height: 16px;
                width: 16px;

                path {
                    fill: #ffffff;
                }
            }
        `,
        "visual-builder__button--comment-loader": css`
            svg.loader {
                height: 16px;
                width: 16px;

                path {
                    fill: #475161;
                }
            }
        `,
        "visual-builder__field-icon": css`
            svg {
                height: 16px;
                width: 16px;
                margin-right: 5px;
            }
        `,
        "visual-builder__focused-toolbar__button-group": css`
            display: flex;
            background: #fff;
            border-radius: 2px;
            height: 100%;
            padding: 4px !important;

            &:has(.visual-builder__button) {
                padding: 2px;
                gap: 8px;
            }

            .visual-builder__button:hover {
                background-color: #f5f5f5;

                svg {
                    color: #5D50BE;
                }
            }

            .visual-builder__button {
                background-color: #fff;
                border-color: transparent;
                color: #475161;
                padding: 4px;
                min-width: 32px;
                min-height: 32px;
            }
        `,
        "visual-builder__focused-toolbar__text": css`
            font-family: Inter, "sans-serif";
            font-size: 0.75rem;
            font-style: normal;
            font-weight: 400;
            line-height: 150%;
            letter-spacing: 0.015rem;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-wrap: nowrap;
        `,
        "visual-builder__focused-toolbar__multiple-field-toolbar": css`
            z-index: 200;
            height: 40px;

            svg {
                height: 100%;
                width: 100%;
            }
        `,
        "visual-builder__rotate--90": css`
            transform: rotate(90deg);
        `,
        "visual-builder__focused-toolbar--field-disabled": css`
            pointer-events: none;
            cursor: not-allowed;
            .visual-builder__focused-toolbar__field-label-wrapper__current-field {
                background: #909090;
            }
        `,
        "visual-builder__cursor-disabled": css`
            .visual-builder__cursor-icon {
                background: #909090;
            }

            .visual-builder__cursor-pointer path {
                fill: #909090;
            }
        `,
        "visual-builder__tooltip": css`
            ${tooltipBaseStyle}

            &:before {
                display: none;
            }

            &:hover:before,
            &:hover:after {
                display: block;
            }

            &:after {
                display: none;
            }
        `,

        "visual-builder__tooltip--persistent": css`
            ${tooltipBaseStyle}

            &:before {
                display: block;
            }

            &:after {
                display: block;
            }
        `,
        "visual-builder__empty-block": css`
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1rem;
            min-height: 100px;
        `,
        "visual-builder__empty-block-title": css`
            font-size: 0.95rem;
            font-family: Inter;
            font-weight: 400;
            line-height: 100%;
            color: #647696;
        `,
        "visual-builder__empty-block-add-button": css`
            height: 32px;
            border-radius: 4px;
            background: #f9f8ff;
            border-color: #6c5ce7;
            border-width: 1px;
            padding: 8px 16px 8px 16px;
            font-size: 0.9rem;
            font-family: Inter;
            font-weight: 600;
            color: #6c5ce7;
            padding-block: 0px;
            letter-spacing: 0.01rem;
        `,
        "visual-builder__hover-outline": css`
            position: absolute;
            outline: 2px dashed #6c5ce7;
            transition: var(--outline-transition);
            z-index: 199 !important;
        `,
        "visual-builder__hover-outline--hidden": css`
            visibility: hidden;
        `,
        "visual-builder__hover-outline--unclickable": css`
            pointer-events: none;
        `,
        "visual-builder__hover-outline--disabled": css`
            outline: 2px dashed #909090;
        `,
        "visual-builder__default-cursor--disabled": css`
            cursor: none;
        `,
        "visual-builder__draft-field": css`
            outline: 2px dashed #eb5646;
        `,
        "visual-builder__variant-field": css`
            outline: 2px solid #bd59fa;
        `,
        "visual-builder__pseudo-editable-element": css`
            z-index: 200 !important;
        `,
        // cslp error styles
        "visual-builder__button-error": css`
            background-color: #ffeeeb;
            padding: 0px !important;
            &:hover {
                background-color: #ffeeeb;
            }
        `,
        "visual-builder__focused-toolbar__error": css`
            display: flex;
            justify-content: center;
            align-items: center;
            column-gap: 3px;
            padding: 4px 8px;
        `,
        "visual-builder__focused-toolbar__error-text": css`
            font-weight: 400;
            font-size: 12px;
            line-height: 18px;
            color: #a31b00;
        `,
        "visual-builder__focused-toolbar__error-toolip": css`
            position: absolute;
            width: 400px;
            background-color: red;
            left: 0;
            top: -7px;
            transform: translateY(-100%);
            background-color: #767676;
            border-radius: 4px;
            box-shadow:
                0px 1px 10px 0px #6c5ce733,
                0px 5px 5px 0px #0000001f,
                0px 2px 4px 0px #00000024;
            padding: 12px;
            text-align: left;

            &:before {
                content: "";
                position: absolute;
                bottom: -3px;
                left: 4%;
                transform: translateX(-50%) rotate(45deg);
                width: 10px;
                height: 10px;
                background-color: #767676;
            }

            > p {
                margin: 0;
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                line-height: 21px;
                margin-bottom: 4px;
            }

            > span {
                color: #ffffff;
                font-size: 12px;
                font-weight: 400;
                line-height: 18px;
            }
        `,
        "variant-field-revert-component": css`
            position: relative;
            display: inline-block;
        `,
        "variant-field-revert-component__dropdown-button": css`
            background-color: #bd59fa;
            color: white;
            padding: 0.3125rem 8px;
            font-size: 10px;
            height: 27.2px;
            margin-right: 3px;
            min-width: max-content;
            border: none;
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            column-gap: 4px;
            &:focus {
                outline: none;
            }
        `,
        "variant-field-revert-component__dropdown-content": css`
            position: absolute;
            background-color: #ffffff;
            min-width: max-content;
            box-shadow:
                0 4px 15px 0 rgba(108, 92, 231, 0.2),
                0 3px 14px 3px rgba(0, 0, 0, 0.12),
                0 8px 10px 1px rgba(0, 0, 0, 0.14);
            z-index: 9;
            margin-top: 4px;
            padding: 4px 0px;
        `,
        "variant-field-revert-component__dropdown-content__list-item": css`
            color: black;
            padding: 9.6px 16px;
            text-decoration: none;
            display: block;
            font-size: 0.75rem;
            height: 32px;
            line-height: 2rem;
            display: flex;
            align-items: center;
            cursor: pointer;
            &:hover {
                background-color: #f1f1f1;
            }
            &:hover > span {
                color: #5d50be;
            }
            & > span {
                margin-top: 4px;
                margin-bottom: 4px;
            }
        `,
        "visual-builder__no-cursor-style": css`
            cursor: none !important;
        `,
    };
}

export const VisualBuilderGlobalStyles = `
       @import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

       [data-cslp] [contenteditable="true"] {
            outline: none;
        }
        
        @keyframes visual-builder__spinner {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

`;
