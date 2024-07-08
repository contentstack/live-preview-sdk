export function normalizeNonBreakingSpace(text: string): string {
    return text.replace("&nbsp;", " ").replace(/\s+/g, " ");
}
