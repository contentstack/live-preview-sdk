export class PublicLogger {
    private static logEvent(
        logCallback:
            | Console["log"]
            | Console["warn"]
            | Console["error"]
            | Console["debug"]
            | Console["info"],
        message: any[]
    ): void {
        if (process?.env?.NODE_ENV !== "test") {
            logCallback("Live_Preview_SDK:", ...message);
        }
    }

    public static error(...data: any[]): void {
        this.logEvent(console.error, data);
    }

    public static warn(...data: any[]): void {
        this.logEvent(console.warn, data);
    }

    public static debug(...data: any[]): void {
        this.logEvent(console.debug, data);
    }
}
