import classNames from "classnames";
import { getFieldType } from "../utils/getFieldType";
import { FieldDataType, ISchemaFieldMap } from "../utils/types/index.types";
import { visualBuilderStyles } from "../visualBuilder.style";

const modular_block = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.25 3.5625C2.25 2.83763 2.83763 2.25 3.5625 2.25H20.441C21.1659 2.25 21.7535 2.83763 21.7535 3.5625V20.441C21.7535 21.1659 21.1659 21.7535 20.441 21.7535H3.5625C2.83763 21.7535 2.25 21.1659 2.25 20.441V3.5625ZM3.375 12.5643V20.441C3.375 20.5446 3.45895 20.6285 3.5625 20.6285H11.4393V12.5643L3.375 12.5643ZM11.4393 11.4393L3.375 11.4393V3.5625C3.375 3.45895 3.45895 3.375 3.5625 3.375H11.4393V11.4393ZM12.5643 12.5643V20.6285H20.441C20.5446 20.6285 20.6285 20.5446 20.6285 20.441V12.5643L12.5643 12.5643ZM20.6285 11.4393L12.5643 11.4393V3.375H20.441C20.5446 3.375 20.6285 3.45895 20.6285 3.5625V11.4393Z" fill="white"/></svg>`;
const url = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5747 8.4136C15.7945 8.63311 15.7948 8.98927 15.5753 9.2091L9.21902 15.5747C8.99952 15.7946 8.64336 15.7948 8.42353 15.5753C8.2037 15.3558 8.20344 14.9996 8.42294 14.7798L14.7792 8.41419C14.9987 8.19436 15.3549 8.1941 15.5747 8.4136Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.6251 10.0076C7.84477 10.2273 7.84477 10.5835 7.6251 10.8031L4.97197 13.4563C4.23333 14.1949 3.81836 15.1967 3.81836 16.2413C3.81836 17.2859 4.23333 18.2878 4.97197 19.0264C5.71062 19.765 6.71243 20.18 7.75704 20.18C8.27427 20.18 8.78644 20.0781 9.2643 19.8802C9.74216 19.6823 10.1764 19.3921 10.5421 19.0264L13.1952 16.3733C13.4149 16.1536 13.7711 16.1536 13.9907 16.3733C14.2104 16.5929 14.2104 16.9491 13.9907 17.1688L11.3376 19.8219C10.8674 20.2921 10.3092 20.6651 9.69482 20.9196C9.08047 21.174 8.42201 21.305 7.75704 21.305C6.41406 21.305 5.1261 20.7715 4.17648 19.8219C3.22685 18.8723 2.69336 17.5843 2.69336 16.2413C2.69336 14.8984 3.22685 13.6104 4.17648 12.6608L6.8296 10.0076C7.04927 9.78798 7.40543 9.78798 7.6251 10.0076Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.6608 4.17648C13.6104 3.22685 14.8984 2.69336 16.2413 2.69336C17.5843 2.69336 18.8723 3.22685 19.8219 4.17648C20.7715 5.1261 21.305 6.41406 21.305 7.75704C21.305 9.10001 20.7715 10.388 19.8219 11.3376L17.1688 13.9907C16.9491 14.2104 16.5929 14.2104 16.3733 13.9907C16.1536 13.7711 16.1536 13.4149 16.3733 13.1952L19.0264 10.5421C19.765 9.80345 20.18 8.80164 20.18 7.75704C20.18 6.71243 19.765 5.71062 19.0264 4.97197C18.2878 4.23333 17.2859 3.81836 16.2413 3.81836C15.1967 3.81836 14.1949 4.23333 13.4563 4.97197L10.8031 7.6251C10.5835 7.84477 10.2273 7.84477 10.0076 7.6251C9.78798 7.40543 9.78798 7.04927 10.0076 6.8296L12.6608 4.17648Z" fill="white"/></svg>`;
export const FieldTypeIconsMap: Record<
    FieldDataType | "loading" | "empty",
    any
> = {
    singleline: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.94958 7.8294C5.85419 7.6199 5.64077 7.48967 5.41084 7.50064C5.1809 7.51162 4.98086 7.66158 4.90585 7.87921L3.19036 12.8566L2.2835 15.3717C2.17813 15.664 2.32962 15.9863 2.62186 16.0917C2.9141 16.197 3.23643 16.0455 3.34181 15.7533L3.95144 14.0625H7.53908L8.29768 15.7888C8.42266 16.0732 8.75454 16.2025 9.03895 16.0775C9.32336 15.9525 9.4526 15.6206 9.32762 15.3362L8.22073 12.8173L8.21769 12.8105L5.94958 7.8294ZM7.03937 12.9375L5.51002 9.57881L4.35242 12.9375H7.03937Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.625 8.0625C11.625 7.75184 11.3732 7.5 11.0625 7.5C10.7518 7.5 10.5 7.75184 10.5 8.0625V15.5625C10.5 15.8732 10.7518 16.125 11.0625 16.125C11.3731 16.125 11.6249 15.8733 11.625 15.5627C12.0951 15.9158 12.6793 16.125 13.3125 16.125C14.8658 16.125 16.125 14.8658 16.125 13.3125C16.125 11.7592 14.8658 10.5 13.3125 10.5C12.6793 10.5 12.0951 10.7092 11.625 11.0623V8.0625ZM11.625 13.3116C11.625 13.3119 11.625 13.3122 11.625 13.3125C11.625 13.3128 11.625 13.3131 11.625 13.3134C11.6255 14.245 12.3808 15 13.3125 15C14.2445 15 15 14.2445 15 13.3125C15 12.3805 14.2445 11.625 13.3125 11.625C12.3808 11.625 11.6255 12.38 11.625 13.3116Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19.9448 10.5025C20.4222 10.4825 20.8969 10.5844 21.324 10.7988C21.6017 10.9381 21.7138 11.2762 21.5744 11.5538C21.4351 11.8315 21.0971 11.9436 20.8194 11.8043C20.5631 11.6757 20.2783 11.6145 19.9919 11.6265C19.7054 11.6385 19.4267 11.7233 19.1821 11.8729C18.9375 12.0224 18.735 12.2319 18.5938 12.4814C18.4526 12.731 18.3773 13.0124 18.375 13.2991C18.3728 13.5858 18.4436 13.8684 18.5808 14.1201C18.718 14.3719 18.9171 14.5845 19.1593 14.738C19.4015 14.8914 19.6788 14.9806 19.9651 14.9972C20.2513 15.0137 20.5371 14.9571 20.7953 14.8326C21.0752 14.6977 21.4114 14.8151 21.5463 15.095C21.6812 15.3748 21.5637 15.711 21.2839 15.846C20.8534 16.0535 20.3772 16.1479 19.9001 16.1203C19.423 16.0927 18.9609 15.944 18.5572 15.6883C18.1535 15.4325 17.8217 15.0781 17.593 14.6585C17.3643 14.2389 17.2463 13.768 17.2501 13.2901C17.2539 12.8123 17.3794 12.3433 17.6147 11.9274C17.8501 11.5115 18.1875 11.1624 18.5952 10.9131C19.0029 10.6638 19.4673 10.5225 19.9448 10.5025Z" fill="white"/></svg>`,
    multiline: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.8125 6.75C20.8125 7.06066 20.5607 7.3125 20.25 7.3125L12.75 7.3125C12.4393 7.3125 12.1875 7.06066 12.1875 6.75C12.1875 6.43934 12.4393 6.1875 12.75 6.1875L20.25 6.1875C20.5607 6.1875 20.8125 6.43934 20.8125 6.75Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M20.8125 11.25C20.8125 11.5607 20.5607 11.8125 20.25 11.8125H12.75C12.4393 11.8125 12.1875 11.5607 12.1875 11.25C12.1875 10.9393 12.4393 10.6875 12.75 10.6875H20.25C20.5607 10.6875 20.8125 10.9393 20.8125 11.25Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M20.8125 15.75C20.8125 16.0607 20.5607 16.3125 20.25 16.3125L3.75 16.3125C3.43934 16.3125 3.1875 16.0607 3.1875 15.75C3.1875 15.4393 3.43934 15.1875 3.75 15.1875L20.25 15.1875C20.5607 15.1875 20.8125 15.4393 20.8125 15.75Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M20.8125 20.25C20.8125 20.5607 20.5607 20.8125 20.25 20.8125L3.75 20.8125C3.43934 20.8125 3.1875 20.5607 3.1875 20.25C3.1875 19.9393 3.43934 19.6875 3.75 19.6875L20.25 19.6875C20.5607 19.6875 20.8125 19.9393 20.8125 20.25Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.69958 4.0794C6.60419 3.8699 6.39077 3.73967 6.16084 3.75064C5.9309 3.76162 5.73086 3.91158 5.65585 4.12921L3.94036 9.10658L3.0335 11.6217C2.92813 11.914 3.07962 12.2363 3.37186 12.3417C3.6641 12.447 3.98643 12.2955 4.09181 12.0033L4.70145 10.3125H8.28908L9.04768 12.0388C9.17266 12.3232 9.50454 12.4525 9.78895 12.3275C10.0734 12.2025 10.2026 11.8706 10.0776 11.5862L8.97074 9.06732L8.96769 9.06052L6.69958 4.0794ZM7.78938 9.1875L6.26002 5.8288L5.10242 9.1875H7.78938Z" fill="white"/></svg>`,
    html_rte: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.5625 11.4375V5.0625H11.4375V10.7422L10.1108 8.0888C9.82462 7.51646 9.06183 7.39267 8.60936 7.84515L5.017 11.4375H3.5625ZM6.608 11.4375H10.5274L9.2209 8.82459L6.608 11.4375ZM3.375 3.9375C2.85723 3.9375 2.4375 4.35723 2.4375 4.875V11.625C2.4375 12.1428 2.85723 12.5625 3.375 12.5625H11.625C12.1428 12.5625 12.5625 12.1428 12.5625 11.625V4.875C12.5625 4.35723 12.1428 3.9375 11.625 3.9375H3.375Z" fill="white"/><path d="M6.11566 7.73132C6.59375 7.73132 6.98132 7.34375 6.98132 6.86566C6.98132 6.38757 6.59375 6 6.11566 6C5.63757 6 5.25 6.38757 5.25 6.86566C5.25 7.34375 5.63757 7.73132 6.11566 7.73132Z" fill="#475161"/><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5625 6C21.5625 6.31066 21.3107 6.5625 21 6.5625L15 6.5625C14.6893 6.5625 14.4375 6.31066 14.4375 6C14.4375 5.68934 14.6893 5.4375 15 5.4375L21 5.4375C21.3107 5.4375 21.5625 5.68934 21.5625 6Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5625 10.5C21.5625 10.8107 21.3107 11.0625 21 11.0625H15C14.6893 11.0625 14.4375 10.8107 14.4375 10.5C14.4375 10.1893 14.6893 9.9375 15 9.9375L21 9.9375C21.3107 9.9375 21.5625 10.1893 21.5625 10.5Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5625 15C21.5625 15.3107 21.3107 15.5625 21 15.5625L3.75 15.5625C3.43934 15.5625 3.1875 15.3107 3.1875 15C3.1875 14.6893 3.43934 14.4375 3.75 14.4375L21 14.4375C21.3107 14.4375 21.5625 14.6893 21.5625 15Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5625 19.5C21.5625 19.8107 21.3107 20.0625 21 20.0625L3.75 20.0625C3.43934 20.0625 3.1875 19.8107 3.1875 19.5C3.1875 19.1893 3.43934 18.9375 3.75 18.9375L21 18.9375C21.3107 18.9375 21.5625 19.1893 21.5625 19.5Z" fill="white"/></svg>`,
    json_rte: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.67113 7.5005C7.94625 7.5005 7.35863 8.08812 7.35863 8.813V9.87593C7.35863 10.1866 7.61047 10.4384 7.92113 10.4384C8.23179 10.4384 8.48363 10.1866 8.48363 9.87593V8.813C8.48363 8.70944 8.56757 8.6255 8.67113 8.6255H11.4375V15.6584H10.3575C10.0468 15.6584 9.79501 15.9103 9.79501 16.2209C9.79501 16.5316 10.0468 16.7834 10.3575 16.7834H13.9834C14.294 16.7834 14.5459 16.5316 14.5459 16.2209C14.5459 15.9103 14.294 15.6584 13.9834 15.6584H12.5625V8.6255H15.3293C15.4329 8.6255 15.5168 8.70945 15.5168 8.813V9.87593C15.5168 10.1866 15.7687 10.4384 16.0793 10.4384C16.39 10.4384 16.6418 10.1866 16.6418 9.87593V8.813C16.6418 8.08812 16.0542 7.5005 15.3293 7.5005H8.67113Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.97059 2.99805C5.00307 2.99805 3.40809 4.59303 3.40809 6.56055V9.51691C3.40809 10.5707 2.55381 11.425 1.5 11.425V12.55C2.55381 12.55 3.40809 13.4043 3.40809 14.4581V17.4145C3.40809 19.382 5.00307 20.977 6.97059 20.977H7.5V19.852H6.97059C5.6244 19.852 4.53309 18.7607 4.53309 17.4145V14.4581C4.53309 13.4391 4.03059 12.5375 3.25988 11.9875C4.03059 11.4375 4.53309 10.5359 4.53309 9.51691V6.56055C4.53309 5.21435 5.6244 4.12305 6.97059 4.12305H7.5V2.99805H6.97059Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M17.0294 2.99805C18.9969 2.99805 20.5919 4.59303 20.5919 6.56055V9.51691C20.5919 10.5707 21.4462 11.425 22.5 11.425V12.55C21.4462 12.55 20.5919 13.4043 20.5919 14.4581V17.4145C20.5919 19.382 18.9969 20.977 17.0294 20.977H16.5V19.852H17.0294C18.3756 19.852 19.4669 18.7607 19.4669 17.4145V14.4581C19.4669 13.4391 19.9694 12.5375 20.7401 11.9875C19.9694 11.4375 19.4669 10.5359 19.4669 9.51691V6.56055C19.4669 5.21435 18.3756 4.12305 17.0294 4.12305H16.5V2.99805H17.0294Z" fill="white"/></svg>`,
    markdown_rte: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3163 16.1134L11.3051 11.4011L8.9938 15.2831H8.17475L5.87469 11.502V16.1134H4.16928V8.25951H5.67273L8.61232 13.1401L11.507 8.25951H12.9993L13.0217 16.1134H11.3163Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.6875 6C1.6875 5.27513 2.27513 4.6875 3 4.6875H21C21.7249 4.6875 22.3125 5.27513 22.3125 6V18C22.3125 18.7249 21.7249 19.3125 21 19.3125H3C2.27513 19.3125 1.6875 18.7249 1.6875 18V6ZM3 5.8125C2.89645 5.8125 2.8125 5.89645 2.8125 6V18C2.8125 18.1036 2.89645 18.1875 3 18.1875H21C21.1036 18.1875 21.1875 18.1036 21.1875 18V6C21.1875 5.89645 21.1036 5.8125 21 5.8125H3Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M18.1818 12.408H20.1013L17.4168 16.1134L14.7323 12.408H16.6518V8.27225H18.1818V12.408Z" fill="white"/></svg>`,
    select: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 8.8125C2.89645 8.8125 2.8125 8.89645 2.8125 9V10.5C2.8125 10.8107 2.56066 11.0625 2.25 11.0625C1.93934 11.0625 1.6875 10.8107 1.6875 10.5V9C1.6875 8.27513 2.27513 7.6875 3 7.6875H4.5C4.81066 7.6875 5.0625 7.93934 5.0625 8.25C5.0625 8.56066 4.81066 8.8125 4.5 8.8125H3ZM6.9375 8.25C6.9375 7.93934 7.18934 7.6875 7.5 7.6875H10.5C10.8107 7.6875 11.0625 7.93934 11.0625 8.25C11.0625 8.56066 10.8107 8.8125 10.5 8.8125H7.5C7.18934 8.8125 6.9375 8.56066 6.9375 8.25ZM12.9375 8.25C12.9375 7.93934 13.1893 7.6875 13.5 7.6875H16.5C16.8107 7.6875 17.0625 7.93934 17.0625 8.25C17.0625 8.56066 16.8107 8.8125 16.5 8.8125H13.5C13.1893 8.8125 12.9375 8.56066 12.9375 8.25ZM18.9375 8.25C18.9375 7.93934 19.1893 7.6875 19.5 7.6875H21C21.7249 7.6875 22.3125 8.27513 22.3125 9V10.6875C22.3125 10.9982 22.0607 11.25 21.75 11.25C21.4393 11.25 21.1875 10.9982 21.1875 10.6875V9C21.1875 8.89645 21.1036 8.8125 21 8.8125H19.5C19.1893 8.8125 18.9375 8.56066 18.9375 8.25ZM2.25 12.9375C2.56066 12.9375 2.8125 13.1893 2.8125 13.5V15C2.8125 15.1036 2.89645 15.1875 3 15.1875H4.125C4.43566 15.1875 4.6875 15.4393 4.6875 15.75C4.6875 16.0607 4.43566 16.3125 4.125 16.3125H3C2.27513 16.3125 1.6875 15.7249 1.6875 15V13.5C1.6875 13.1893 1.93934 12.9375 2.25 12.9375ZM21.75 13.5C22.0607 13.5 22.3125 13.7518 22.3125 14.0625V15.75C22.3125 16.0607 22.0607 16.3125 21.75 16.3125C21.4393 16.3125 21.1875 16.0607 21.1875 15.75V14.0625C21.1875 13.7518 21.4393 13.5 21.75 13.5ZM5.8125 15.75C5.8125 15.4393 6.06434 15.1875 6.375 15.1875H8.625C8.93566 15.1875 9.1875 15.4393 9.1875 15.75C9.1875 16.0607 8.93566 16.3125 8.625 16.3125H6.375C6.06434 16.3125 5.8125 16.0607 5.8125 15.75ZM10.3125 15.75C10.3125 15.4393 10.5643 15.1875 10.875 15.1875H12C12.3107 15.1875 12.5625 15.4393 12.5625 15.75C12.5625 16.0607 12.3107 16.3125 12 16.3125H10.875C10.5643 16.3125 10.3125 16.0607 10.3125 15.75Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.4457 13.3706C13.3603 12.5628 14.2727 12.036 14.9296 12.5139L21.2889 17.1406C21.9906 17.6511 21.6818 18.7589 20.8172 18.8328L17.7404 19.0958L15.9742 21.6289C15.4779 22.3407 14.3642 22.0543 14.2729 21.1913L13.4457 13.3706ZM14.6089 13.6718L15.3388 20.5732L16.8678 18.3803C17.027 18.1519 17.2796 18.0061 17.557 17.9823L20.2207 17.7547L14.6089 13.6718Z" fill="white"/></svg>`,
    modular_block: modular_block,
    block: modular_block,
    number: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.46172 8.08704C6.45117 8.02147 6.42928 7.9597 6.39813 7.90379C6.35727 7.8301 6.3012 7.7682 6.23536 7.72082C6.16973 7.67343 6.09347 7.63985 6.01084 7.62433C5.94777 7.61236 5.88203 7.61108 5.81629 7.62183C5.78173 7.6274 5.74822 7.63611 5.71607 7.64767L3.47852 8.39352C3.18381 8.49176 3.02453 8.81031 3.12277 9.10503C3.22101 9.39975 3.53956 9.55903 3.83428 9.46079L5.3439 8.95758L5.3439 15.302H4.59375C4.28309 15.302 4.03125 15.5538 4.03125 15.8645C4.03125 16.1752 4.28309 16.427 4.59375 16.427H7.33594C7.6466 16.427 7.89844 16.1752 7.89844 15.8645C7.89844 15.5538 7.6466 15.302 7.33594 15.302H6.4689L6.4689 8.19029C6.4697 8.15613 6.46737 8.12159 6.46172 8.08704Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.51562 9.32004C9.51562 8.35585 10.2973 7.57422 11.2614 7.57422H12.8054C13.6809 7.57422 14.3906 8.28395 14.3906 9.15945V10.9828C14.3906 11.6816 13.9922 12.3191 13.3642 12.6254L12.2817 13.1533C12.2739 13.1571 12.266 13.1607 12.258 13.1641L11.3359 13.562C10.6003 13.8794 10.0831 14.537 9.93348 15.302H13.8281C14.1388 15.302 14.3906 15.5538 14.3906 15.8645C14.3906 16.1752 14.1388 16.427 13.8281 16.427H9.36208C9.03756 16.427 8.77241 16.1679 8.76493 15.8435C8.73182 14.4088 9.57261 13.0976 10.8902 12.5291L11.8003 12.1364L12.8711 11.6142C13.1125 11.4965 13.2656 11.2514 13.2656 10.9828V9.15945C13.2656 8.90527 13.0596 8.69922 12.8054 8.69922H11.2614C10.9186 8.69922 10.6406 8.97717 10.6406 9.32004C10.6406 9.6307 10.3888 9.88254 10.0781 9.88254C9.76746 9.88254 9.51562 9.6307 9.51562 9.32004Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M16.5938 7.62677C16.2831 7.62677 16.0312 7.87861 16.0312 8.18927C16.0312 8.49993 16.2831 8.75177 16.5938 8.75177H19.5938C19.6973 8.75177 19.7812 8.83572 19.7812 8.93927V11.4583H16.5938C16.2831 11.4583 16.0312 11.7101 16.0312 12.0208C16.0312 12.3315 16.2831 12.5833 16.5938 12.5833H19.7812V15.1023C19.7812 15.2059 19.6973 15.2898 19.5938 15.2898H16.5938C16.2831 15.2898 16.0312 15.5417 16.0312 15.8523C16.0312 16.163 16.2831 16.4148 16.5938 16.4148H19.5938C20.3186 16.4148 20.9062 15.8272 20.9062 15.1023V8.93927C20.9062 8.2144 20.3186 7.62677 19.5938 7.62677H16.5938Z" fill="white"/></svg>`,
    boolean: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.6875 12C1.6875 8.78984 4.28985 6.1875 7.5 6.1875H16.5C19.7102 6.1875 22.3125 8.78984 22.3125 12C22.3125 15.2102 19.7102 17.8125 16.5 17.8125H7.5C4.28985 17.8125 1.6875 15.2102 1.6875 12ZM7.5 7.3125C4.91117 7.3125 2.8125 9.41117 2.8125 12C2.8125 14.5888 4.91117 16.6875 7.5 16.6875H16.5C19.0888 16.6875 21.1875 14.5888 21.1875 12C21.1875 9.41117 19.0888 7.3125 16.5 7.3125H7.5Z" fill="white"/><path d="M19.5 12C19.5 13.6569 18.1569 15 16.5 15C14.8431 15 13.5 13.6569 13.5 12C13.5 10.3431 14.8431 9 16.5 9C18.1569 9 19.5 10.3431 19.5 12Z" fill="white"/></svg>`,
    isodate: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.18616 2.22852C7.49682 2.22852 7.74866 2.48036 7.74866 2.79102V3.90302H14.9956V2.79102C14.9956 2.48036 15.2474 2.22852 15.5581 2.22852C15.8688 2.22852 16.1206 2.48036 16.1206 2.79102V3.90302H18.9942C19.7191 3.90302 20.3067 4.49064 20.3067 5.21552V11.1632C20.3067 11.4739 20.0548 11.7257 19.7442 11.7257C19.4335 11.7257 19.1817 11.4739 19.1817 11.1632V9.48865L3.5625 9.48865V18.7853C3.5625 18.8888 3.64645 18.9728 3.75 18.9728H10.5349C10.8455 18.9728 11.0974 19.2246 11.0974 19.5353C11.0974 19.8459 10.8455 20.0978 10.5349 20.0978H3.75C3.02513 20.0978 2.4375 19.5102 2.4375 18.7853V5.21551C2.4375 4.49064 3.02513 3.90302 3.75 3.90302H6.62366V2.79102C6.62366 2.48036 6.8755 2.22852 7.18616 2.22852ZM14.9956 5.02802V6.13985C14.9956 6.45051 15.2474 6.70235 15.5581 6.70235C15.8688 6.70235 16.1206 6.45051 16.1206 6.13985V5.02802H18.9942C19.0977 5.02802 19.1817 5.11196 19.1817 5.21552V8.36365L3.5625 8.36365V5.21551C3.5625 5.11196 3.64645 5.02802 3.75 5.02802H6.62366V6.13985C6.62366 6.45051 6.8755 6.70235 7.18616 6.70235C7.49682 6.70235 7.74866 6.45051 7.74866 6.13985V5.02802H14.9956Z" fill="white"/><path d="M7.18589 12.0004C7.18589 12.4627 6.81106 12.8376 6.34868 12.8376C5.88631 12.8376 5.51147 12.4627 5.51147 12.0004C5.51147 11.538 5.88631 11.1631 6.34868 11.1631C6.81106 11.1631 7.18589 11.538 7.18589 12.0004Z" fill="white"/><path d="M11.3721 12.0004C11.3721 12.4627 10.9972 12.8376 10.5348 12.8376C10.0725 12.8376 9.69763 12.4627 9.69763 12.0004C9.69763 11.538 10.0725 11.1631 10.5348 11.1631C10.9972 11.1631 11.3721 11.538 11.3721 12.0004Z" fill="white"/><path d="M7.18589 16.1863C7.18589 16.6487 6.81106 17.0235 6.34868 17.0235C5.88631 17.0235 5.51147 16.6487 5.51147 16.1863C5.51147 15.724 5.88631 15.3491 6.34868 15.3491C6.81106 15.3491 7.18589 15.724 7.18589 16.1863Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M16.8141 13.4C14.8129 13.4 13.1906 15.0223 13.1906 17.0235C13.1906 19.0247 14.8129 20.6471 16.8141 20.6471C18.8153 20.6471 20.4376 19.0247 20.4376 17.0235C20.4376 15.0223 18.8153 13.4 16.8141 13.4ZM12.0656 17.0235C12.0656 14.401 14.1915 12.275 16.8141 12.275C19.4366 12.275 21.5626 14.401 21.5626 17.0235C21.5626 19.6461 19.4366 21.7721 16.8141 21.7721C14.1915 21.7721 12.0656 19.6461 12.0656 17.0235Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M16.6307 14.9959C16.9414 14.9959 17.1932 15.2478 17.1932 15.5584V17.2959L17.9186 17.6404C18.1992 17.7737 18.3186 18.1093 18.1853 18.3899C18.0521 18.6705 17.7165 18.7899 17.4359 18.6566L16.3894 18.1595C16.1932 18.0664 16.0682 17.8686 16.0682 17.6514V15.5584C16.0682 15.2478 16.3201 14.9959 16.6307 14.9959Z" fill="white"/></svg>`,
    file: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.25 3.5625C5.20027 3.5625 5.15258 3.58225 5.11742 3.61742C5.08225 3.65258 5.0625 3.70027 5.0625 3.75V20.25C5.0625 20.2997 5.08225 20.3474 5.11742 20.3826C5.15258 20.4177 5.20027 20.4375 5.25 20.4375H18.75C18.7997 20.4375 18.8474 20.4177 18.8826 20.3826C18.9177 20.3474 18.9375 20.2997 18.9375 20.25V8.483L14.017 3.5625H5.25ZM4.32192 2.82192C4.56806 2.57578 4.9019 2.4375 5.25 2.4375H14.25C14.3992 2.4375 14.5423 2.49676 14.6477 2.60225L19.8977 7.85225C20.0032 7.95774 20.0625 8.10082 20.0625 8.25V20.25C20.0625 20.5981 19.9242 20.9319 19.6781 21.1781C19.4319 21.4242 19.0981 21.5625 18.75 21.5625H5.25C4.9019 21.5625 4.56806 21.4242 4.32192 21.1781C4.07578 20.9319 3.9375 20.5981 3.9375 20.25V3.75C3.9375 3.4019 4.07578 3.06806 4.32192 2.82192Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M14.25 2.4375C14.5607 2.4375 14.8125 2.68934 14.8125 3V7.6875H19.5C19.8107 7.6875 20.0625 7.93934 20.0625 8.25C20.0625 8.56066 19.8107 8.8125 19.5 8.8125H14.25C13.9393 8.8125 13.6875 8.56066 13.6875 8.25V3C13.6875 2.68934 13.9393 2.4375 14.25 2.4375Z" fill="white"/></svg>`,
    link: url,
    url: url,
    reference: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.5 3.9375C4.81066 3.9375 5.0625 4.18934 5.0625 4.5V18.9375H19.5C19.8107 18.9375 20.0625 19.1893 20.0625 19.5C20.0625 19.8107 19.8107 20.0625 19.5 20.0625H4.5C4.18934 20.0625 3.9375 19.8107 3.9375 19.5V4.5C3.9375 4.18934 4.18934 3.9375 4.5 3.9375Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M15.3756 7.08021C15.6074 6.87343 15.963 6.89375 16.1698 7.12559L18.4198 9.64832C18.6151 9.86727 18.6093 10.1995 18.4065 10.4115L16.1565 12.7638C15.9417 12.9883 15.5857 12.9962 15.3612 12.7815C15.1367 12.5668 15.1288 12.2107 15.3435 11.9862L16.6836 10.5852H11.3182C9.52012 10.5852 8.0625 12.0428 8.0625 13.8409V15.75C8.0625 16.0607 7.81066 16.3125 7.5 16.3125C7.18934 16.3125 6.9375 16.0607 6.9375 15.75V13.8409C6.9375 11.4215 8.8988 9.46023 11.3182 9.46023H16.7446L15.3302 7.87441C15.1234 7.64256 15.1437 7.28699 15.3756 7.08021Z" fill="white"/></svg>`,
    group: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.8125 3.75C2.8125 3.23223 3.23223 2.8125 3.75 2.8125C4.26777 2.8125 4.6875 3.23223 4.6875 3.75C4.6875 4.26777 4.26777 4.6875 3.75 4.6875C3.23223 4.6875 2.8125 4.26777 2.8125 3.75ZM3.75 1.6875C4.69408 1.6875 5.49001 2.32181 5.73486 3.1875H18.2651C18.51 2.32181 19.3059 1.6875 20.25 1.6875C21.3891 1.6875 22.3125 2.61091 22.3125 3.75C22.3125 4.69408 21.6782 5.49002 20.8125 5.73486V18.2651C21.6782 18.51 22.3125 19.3059 22.3125 20.25C22.3125 21.3891 21.3891 22.3125 20.25 22.3125C19.3059 22.3125 18.51 21.6782 18.2651 20.8125H5.73486C5.49001 21.6782 4.69408 22.3125 3.75 22.3125C2.61091 22.3125 1.6875 21.3891 1.6875 20.25C1.6875 19.3059 2.32181 18.51 3.1875 18.2651V5.73486C2.32181 5.49001 1.6875 4.69408 1.6875 3.75C1.6875 2.61091 2.61091 1.6875 3.75 1.6875ZM20.25 4.6875C20.7678 4.6875 21.1875 4.26777 21.1875 3.75C21.1875 3.23223 20.7678 2.8125 20.25 2.8125C19.7322 2.8125 19.3125 3.23223 19.3125 3.75C19.3125 4.26777 19.7322 4.6875 20.25 4.6875ZM18.2651 4.3125C18.4594 4.99938 19.0006 5.54059 19.6875 5.73486V18.2651C19.0006 18.4594 18.4594 19.0006 18.2651 19.6875H5.73486C5.54059 19.0006 4.99938 18.4594 4.3125 18.2651V5.73486C4.99938 5.54059 5.54059 4.99938 5.73486 4.3125H18.2651ZM19.3125 20.25C19.3125 19.7322 19.7322 19.3125 20.25 19.3125C20.7678 19.3125 21.1875 19.7322 21.1875 20.25C21.1875 20.7678 20.7678 21.1875 20.25 21.1875C19.7322 21.1875 19.3125 20.7678 19.3125 20.25ZM4.6875 20.25C4.6875 19.7322 4.26777 19.3125 3.75 19.3125C3.23223 19.3125 2.8125 19.7322 2.8125 20.25C2.8125 20.7678 3.23223 21.1875 3.75 21.1875C4.26777 21.1875 4.6875 20.7678 4.6875 20.25ZM9.75 7.6875C9.75 6.96263 10.3376 6.375 11.0625 6.375H15.5625C16.2874 6.375 16.875 6.96263 16.875 7.6875V13.6875C16.875 14.4124 16.2874 15 15.5625 15H14.625V15.9375C14.625 16.6624 14.0374 17.25 13.3125 17.25H8.8125C8.08763 17.25 7.5 16.6624 7.5 15.9375V9.1875C7.5 8.46263 8.08763 7.875 8.8125 7.875H9.75V7.6875ZM9.75 9H8.8125C8.70895 9 8.625 9.08395 8.625 9.1875V15.9375C8.625 16.0411 8.70895 16.125 8.8125 16.125H13.3125C13.4161 16.125 13.5 16.0411 13.5 15.9375V15H11.0625C10.3376 15 9.75 14.4124 9.75 13.6875V9ZM11.0625 7.5C10.9589 7.5 10.875 7.58395 10.875 7.6875V13.6875C10.875 13.7911 10.9589 13.875 11.0625 13.875H15.5625C15.6661 13.875 15.75 13.7911 15.75 13.6875V7.6875C15.75 7.58395 15.6661 7.5 15.5625 7.5H11.0625Z" fill="white"/></svg>`,
    global_field: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.375 3C17.3456 3 21.375 7.02944 21.375 12C21.375 16.9706 17.3456 21 12.375 21C7.40444 21 3.375 16.9706 3.375 12C3.375 7.02944 7.40444 3 12.375 3ZM12.375 19.875C12.5009 19.875 12.7226 19.8185 13.0332 19.5032C13.3478 19.184 13.6828 18.6642 13.9882 17.9313C14.1866 17.455 14.3632 16.9113 14.5111 16.3125H10.2389C10.3868 16.9113 10.5634 17.455 10.7618 17.9313C11.0672 18.6642 11.4022 19.184 11.7168 19.5032C12.0274 19.8185 12.2491 19.875 12.375 19.875ZM10.0068 15.1875C9.84289 14.2154 9.75 13.1397 9.75 12C9.75 10.8603 9.84289 9.78464 10.0068 8.8125H14.7432C14.9071 9.78464 15 10.8603 15 12C15 13.1397 14.9071 14.2154 14.7432 15.1875H10.0068ZM15.6673 16.3125C15.3597 17.6622 14.9122 18.8021 14.3716 19.6197C16.2825 19.1203 17.9105 17.9212 18.9653 16.3125H15.6673ZM19.5782 15.1875H15.883C16.0394 14.1967 16.125 13.1223 16.125 12C16.125 10.8777 16.0394 9.80332 15.883 8.8125H19.5782C20.0101 9.78699 20.25 10.8655 20.25 12C20.25 13.1345 20.0101 14.213 19.5782 15.1875ZM8.86698 15.1875H5.17177C4.73991 14.213 4.5 13.1345 4.5 12C4.5 10.8655 4.73991 9.78699 5.17177 8.8125H8.86698C8.7106 9.80332 8.625 10.8777 8.625 12C8.625 13.1223 8.7106 14.1967 8.86698 15.1875ZM5.7847 16.3125H9.08273C9.39032 17.6622 9.83781 18.8021 10.3784 19.6197C8.46751 19.1203 6.83953 17.9212 5.7847 16.3125ZM10.2389 7.6875H14.5111C14.3632 7.08867 14.1866 6.54495 13.9882 6.06873C13.6828 5.33576 13.3478 4.81605 13.0332 4.49677C12.7226 4.18146 12.5009 4.125 12.375 4.125C12.2491 4.125 12.0274 4.18146 11.7168 4.49677C11.4022 4.81605 11.0672 5.33576 10.7618 6.06873C10.5634 6.54495 10.3868 7.08867 10.2389 7.6875ZM15.6673 7.6875H18.9653C17.9105 6.07879 16.2825 4.87965 14.3716 4.38032C14.9122 5.19795 15.3597 6.33778 15.6673 7.6875ZM10.3784 4.38032C9.83781 5.19795 9.39032 6.33778 9.08273 7.6875H5.7847C6.83953 6.07879 8.46751 4.87965 10.3784 4.38032Z" fill="white"/></svg>`,
    custom_field: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.25 3.9375H9.05319C9.16513 3.35112 9.45051 2.80685 9.87868 2.37868C10.4413 1.81607 11.2044 1.5 12 1.5C12.7956 1.5 13.5587 1.81607 14.1213 2.37868C14.5495 2.80685 14.8349 3.35112 14.9468 3.9375H18.75C19.4749 3.9375 20.0625 4.52513 20.0625 5.25V9.05319C20.6489 9.16513 21.1931 9.45051 21.6213 9.87868C22.1839 10.4413 22.5 11.2044 22.5 12C22.5 12.7956 22.1839 13.5587 21.6213 14.1213C21.1931 14.5495 20.6489 14.8349 20.0625 14.9468V18.75C20.0625 19.4749 19.4749 20.0625 18.75 20.0625H14.7137C14.4215 20.0625 14.1613 19.8779 14.0648 19.6021C13.3812 17.6489 10.6188 17.6489 9.93522 19.6021C9.83871 19.8779 9.57846 20.0625 9.28631 20.0625H5.25C4.52513 20.0625 3.9375 19.4749 3.9375 18.75V14.7343C3.9375 14.4269 4.13421 14.154 4.42585 14.0568C6.40245 13.3979 6.40245 10.6021 4.42585 9.94321C4.13421 9.846 3.9375 9.57307 3.9375 9.26566V5.25C3.9375 4.52513 4.52513 3.9375 5.25 3.9375ZM5.25 5.0625C5.14645 5.0625 5.0625 5.14645 5.0625 5.25V8.98259C7.69023 10.1082 7.69023 13.8918 5.0625 15.0174V18.75C5.0625 18.8536 5.14645 18.9375 5.25 18.9375H8.99033C10.1484 16.3704 13.8516 16.3704 15.0097 18.9375H18.75C18.8536 18.9375 18.9375 18.8536 18.9375 18.75V5.25C18.9375 5.14645 18.8536 5.0625 18.75 5.0625H5.25Z" fill="white"/></svg>`,
    experience_container: "",
    empty: "",
    loading: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="${classNames(
        "visual-builder__cursor-icon--loader",
        visualBuilderStyles()["visual-builder__cursor-icon--loader"]
    )}"><path d="M15.5023 18.3501C13.5466 19.6388 11.2007 20.2002 8.87354 19.9364C6.54637 19.6725 4.38563 18.6002 2.76808 16.9065C1.15053 15.2127 0.178807 13.0049 0.0223406 10.6681C-0.134126 8.33122 0.534595 6.0136 1.9119 4.1193C3.2892 2.22501 5.2877 0.874235 7.55893 0.302518C9.83015 -0.2692 12.23 -0.0255895 14.34 0.990871C16.45 2.00733 18.1363 3.73215 19.1048 5.86457C20.0734 7.997 20.2627 10.4017 19.6399 12.6595L17.7119 12.1276C18.2102 10.3214 18.0587 8.3976 17.2839 6.69166C16.509 4.98572 15.16 3.60586 13.472 2.7927C11.784 1.97953 9.86412 1.78464 8.04714 2.24201C6.23016 2.69939 4.63136 3.78001 3.52952 5.29544C2.42768 6.81088 1.8927 8.66498 2.01787 10.5345C2.14305 12.4039 2.92043 14.1702 4.21446 15.5252C5.5085 16.8802 7.23709 17.738 9.09883 17.9491C10.9606 18.1601 12.8373 17.711 14.4018 16.6801L15.5023 18.3501Z" fill="white"/></svg>`,
    taxonomy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 1.52727C0 0.683783 0.683783 0 1.52727 0H22.4727C23.3162 0 24 0.683783 24 1.52727V5.01818C24 5.86167 23.3162 6.54545 22.4727 6.54545H4.8V11.3455H8.72727V10.2545C8.72727 9.41106 9.41106 8.72727 10.2545 8.72727H17.2364C18.0799 8.72727 18.7636 9.41106 18.7636 10.2545V13.7455C18.7636 14.5889 18.0799 15.2727 17.2364 15.2727H10.2545C9.41106 15.2727 8.72727 14.5889 8.72727 13.7455V12.6545H4.8V20.0727H8.72727V18.9818C8.72727 18.1383 9.41106 17.4545 10.2545 17.4545H17.2364C18.0799 17.4545 18.7636 18.1383 18.7636 18.9818V22.4727C18.7636 23.3162 18.0799 24 17.2364 24H10.2545C9.41106 24 8.72727 23.3162 8.72727 22.4727V21.3818H4.14545C3.78396 21.3818 3.49091 21.0888 3.49091 20.7273V6.54545H1.52727C0.683785 6.54545 0 5.86167 0 5.01818V1.52727ZM10.0364 22.4727C10.0364 22.5932 10.134 22.6909 10.2545 22.6909H17.2364C17.3569 22.6909 17.4545 22.5932 17.4545 22.4727V18.9818C17.4545 18.8613 17.3569 18.7636 17.2364 18.7636H10.2545C10.134 18.7636 10.0364 18.8613 10.0364 18.9818V22.4727ZM10.0364 13.7455V10.2545C10.0364 10.134 10.134 10.0364 10.2545 10.0364H17.2364C17.3569 10.0364 17.4545 10.134 17.4545 10.2545V13.7455C17.4545 13.866 17.3569 13.9636 17.2364 13.9636H10.2545C10.134 13.9636 10.0364 13.866 10.0364 13.7455ZM22.4727 5.23636H1.52727C1.40677 5.23636 1.30909 5.13868 1.30909 5.01818V1.52727C1.30909 1.40677 1.40677 1.30909 1.52727 1.30909H22.4727C22.5932 1.30909 22.6909 1.40677 22.6909 1.52727V5.01818C22.6909 5.13868 22.5932 5.23636 22.4727 5.23636Z" fill="white"/></svg>`,
};
const cursor = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M0.0167948 0.602214C-0.0784404 0.246792 0.246794 -0.0784402 0.602216 0.0167948L15.6457 4.04767C16.0914 4.1671 16.1259 4.78625 15.6962 4.95447L8.17161 7.90048C8.04753 7.94906 7.94936 8.04723 7.90078 8.17131L4.95449 15.6962C4.78627 16.1259 4.16712 16.0914 4.04769 15.6457L0.0167948 0.602214Z" fill="#5D50BE"/></svg>`;
interface IGenerateCustomCursor {
    fieldType: FieldDataType | "loading" | "empty";
    customCursor: HTMLDivElement;
    fieldDisabled?: boolean;
}
export function generateCustomCursor({
    fieldType,
    customCursor,
    fieldDisabled = false,
}: IGenerateCustomCursor): void {
    const icon = fieldType ? FieldTypeIconsMap[fieldType] : "";

    const prevDataIcon = customCursor.getAttribute("data-icon");
    if (prevDataIcon === fieldType) {
        return;
    }
    customCursor.innerHTML = `<div class="${classNames(
        "visual-builder__cursor-wrapper",
        {
            "visual-builder__cursor-disabled": fieldDisabled,
            [visualBuilderStyles()["visual-builder__cursor-disabled"]]:
                fieldDisabled,
        }
    )}"><div class="${classNames(
        "visual-builder__cursor-pointer",
        visualBuilderStyles()["visual-builder__cursor-pointer"]
    )}">${cursor}</div><div class="${classNames(
        "visual-builder__cursor-icon",
        visualBuilderStyles()["visual-builder__cursor-icon"]
    )}">${icon}</div>`;
    customCursor.setAttribute("data-icon", fieldType);
}
export function getFieldIcon(fieldSchema: ISchemaFieldMap) {
    const fieldType = getFieldType(fieldSchema);
    return FieldTypeIconsMap[fieldType];
}
