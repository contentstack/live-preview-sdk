import { debounce } from "lodash-es";

export const pasteAsPlainText = debounce(
    (e: Event) => {
        e.preventDefault();
        const clipboardData = (e as ClipboardEvent).clipboardData;
        document.execCommand(
            "inserttext",
            false,
            clipboardData?.getData("text/plain")
        );
    },
    100,
    { leading: true }
);
