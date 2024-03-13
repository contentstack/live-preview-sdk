import { PublicLogger } from "../logger";

describe("PublicLogger", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    describe("if NODE_ENV is not set to test", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "dev";
        });

        test("debug message", () => {
            jest.spyOn(global.console, "debug");
            jest.spyOn(PublicLogger, "debug");
            PublicLogger.debug(["test debug message"]);

            expect(PublicLogger.debug).toBeCalledTimes(1);
            expect(PublicLogger.debug).toBeCalledWith(["test debug message"]);
            expect(global.console.debug).toBeCalledWith("Live_Preview_SDK:", [
                "test debug message",
            ]);
        });

        test("warn message", () => {
            jest.spyOn(global.console, "warn");
            jest.spyOn(PublicLogger, "warn");
            PublicLogger.warn(["test warn message"]);

            expect(PublicLogger.warn).toBeCalledTimes(1);
            expect(PublicLogger.warn).toBeCalledWith(["test warn message"]);
            expect(global.console.warn).toBeCalledWith("Live_Preview_SDK:", [
                "test warn message",
            ]);
        });

        test("error message", () => {
            jest.spyOn(global.console, "error");
            jest.spyOn(PublicLogger, "error");
            PublicLogger.error(["test error message"]);

            expect(PublicLogger.error).toBeCalledTimes(1);
            expect(PublicLogger.error).toBeCalledWith(["test error message"]);
            expect(global.console.error).toBeCalledWith("Live_Preview_SDK:", [
                "test error message",
            ]);
        });
    });

    describe("if NODE_ENV is set to test", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "test";
        });

        test("debug message", () => {
            jest.spyOn(global.console, "debug");
            jest.spyOn(PublicLogger, "debug");
            PublicLogger.debug(["test debug message"]);
            expect(PublicLogger.debug).toBeCalledWith(["test debug message"]);
        });

        test("warn message", () => {
            jest.spyOn(global.console, "warn");
            jest.spyOn(PublicLogger, "warn");
            PublicLogger.warn(["test warn message"]);
            expect(PublicLogger.warn).toBeCalledWith(["test warn message"]);
        });

        test("error message", () => {
            jest.spyOn(global.console, "error");
            jest.spyOn(PublicLogger, "error");
            PublicLogger.error(["test error message"]);
            expect(PublicLogger.error).toBeCalledWith(["test error message"]);
        });
    });
});
