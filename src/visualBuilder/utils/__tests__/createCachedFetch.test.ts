import { createCachedFetch } from "../createCachedFetch";

describe("createCachedFetch", () => {
    // Helper to create a controlled promise
    const createControlledPromise = <T>(_value?: T) => {
        let resolve: (value: T) => void;
        let reject: (reason: any) => void;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve: resolve!, reject: reject! };
    };

    it("should cache results for identical arguments", async () => {
        const fetchFn = vi.fn().mockResolvedValue("cached result");
        const cachedFn = createCachedFetch(fetchFn);

        const result1 = await cachedFn("arg1", "arg2");
        const result2 = await cachedFn("arg1", "arg2");

        expect(result1).toBe("cached result");
        expect(result2).toBe("cached result");
        expect(fetchFn).toHaveBeenCalledTimes(1);
        expect(fetchFn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should make separate calls for different arguments", async () => {
        const fetchFn = vi
            .fn()
            .mockResolvedValueOnce("result1")
            .mockResolvedValueOnce("result2");
        const cachedFn = createCachedFetch(fetchFn);

        const result1 = await cachedFn("arg1");
        const result2 = await cachedFn("arg2");

        expect(result1).toBe("result1");
        expect(result2).toBe("result2");
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("should handle concurrent calls with the same arguments", async () => {
        // Create a controlled promise to manually resolve the fetch
        const { promise, resolve } = createControlledPromise<string>();
        const fetchFn = vi.fn().mockReturnValue(promise);
        const cachedFn = createCachedFetch(fetchFn);

        // Start two concurrent requests
        const request1 = cachedFn("concurrent");
        const request2 = cachedFn("concurrent");

        // The fetch function should only be called once
        expect(fetchFn).toHaveBeenCalledTimes(1);

        // Resolve the underlying fetch
        resolve("shared result");

        // Both requests should resolve with the same result
        const [result1, result2] = await Promise.all([request1, request2]);
        expect(result1).toBe("shared result");
        expect(result2).toBe("shared result");
    });

    it("should propagate errors and not cache failed results", async () => {
        const error = new Error("fetch failed");
        const fetchFn = vi
            .fn()
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce("result after error");
        const cachedFn = createCachedFetch(fetchFn);

        // First call should reject
        await expect(cachedFn("error-test")).rejects.toThrow("fetch failed");

        // Second call should retry fetch and succeed
        const result = await cachedFn("error-test");
        expect(result).toBe("result after error");
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("should use the custom UID resolver when provided", async () => {
        const fetchFn = vi.fn().mockResolvedValue("custom uid result");
        // Create custom resolver that only uses the first argument
        const uidResolver = (arg1: string) => arg1;
        const cachedFn = createCachedFetch(fetchFn, uidResolver);

        await cachedFn("same", "different1");
        await cachedFn("same", "different2");

        // Should only call once since our UID resolver only cares about first arg
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it("should clear the cache when clearCache is called", async () => {
        const fetchFn = vi
            .fn()
            .mockResolvedValueOnce("first call")
            .mockResolvedValueOnce("after clear");
        const cachedFn = createCachedFetch(fetchFn);

        // Make initial call
        const result1 = await cachedFn("clear-test");
        expect(result1).toBe("first call");

        // Clear the cache
        cachedFn.clearCache();

        // Make same call again - should fetch again
        const result2 = await cachedFn("clear-test");
        expect(result2).toBe("after clear");
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("should clear pending promises when clearCache is called", async () => {
        // Create a controlled promise
        const { promise, resolve } = createControlledPromise<string>();
        const fetchFn = vi.fn().mockReturnValue(promise);
        const cachedFn = createCachedFetch(fetchFn);

        // Start a request
        const pendingRequest = cachedFn("pending");

        // Clear cache while request is pending
        cachedFn.clearCache();

        // Setup new mock for next call
        fetchFn.mockResolvedValueOnce("new result");

        // New request should cause a new fetch
        const newRequest = cachedFn("pending");

        // Resolve the original promise
        resolve("pending result");

        // Check both results
        const pendingResult = await pendingRequest;
        const newResult = await newRequest;

        expect(pendingResult).toBe("pending result");
        expect(newResult).toBe("new result");
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("should handle errors in concurrent requests", async () => {
        // Create a controlled promise
        const { promise, reject } = createControlledPromise<string>();
        const fetchFn = vi.fn().mockReturnValue(promise);
        const cachedFn = createCachedFetch(fetchFn);

        // Start two concurrent requests
        const request1 = cachedFn("error-concurrent");
        const request2 = cachedFn("error-concurrent");

        // Reject the promise
        const error = new Error("concurrent error");
        reject(error);

        // Both requests should fail with the same error
        await expect(request1).rejects.toThrow("concurrent error");
        await expect(request2).rejects.toThrow("concurrent error");

        // Setup next call to succeed
        fetchFn.mockResolvedValueOnce("after error");

        // Next call should retry
        const result = await cachedFn("error-concurrent");
        expect(result).toBe("after error");
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });
});
