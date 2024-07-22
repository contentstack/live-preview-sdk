export function normalizeNonBreakingSpace(text: string): string {
    // replace non-breaking space with space and normalize all whitespace chars (not \n \r)
    return text.replace("&nbsp;", " ").replace(/[^\S\r\n]/gm, " ");
}
