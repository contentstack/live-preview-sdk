/**
 * Creates a cached async fetch function with support for any number of arguments
 * @param fetchFn - The async function to cache
 * @param uidResolver - Function that generates a unique ID from the arguments passed to fetchFn
 * @returns A cached version of the fetch function with the same signature
 */
export function createCachedFetch<TArgs extends any[], TResult>(
    fetchFn: (...args: TArgs) => Promise<TResult>,
    uidResolver: (...args: TArgs) => string = (...args) => JSON.stringify(args)
): {
    (...args: TArgs): Promise<TResult>;
    clearCache: () => void;
} {
    // Cache storage
    const cache = new Map<string, TResult>();
    // Track in-flight requests
    const pendingPromises = new Map<string, Promise<TResult>>();

    /**
     * The cached fetch function
     * @param args - Arguments to pass to the original fetch function
     * @returns Promise that resolves with the data
     */
    async function cachedFetch(...args: TArgs): Promise<TResult> {
        // Generate unique ID for these arguments
        const uid = uidResolver(...args);

        // Return cached value if available
        if (cache.has(uid)) {
            return cache.get(uid)!;
        }

        // Return existing promise if request is already in progress
        if (pendingPromises.has(uid)) {
            return pendingPromises.get(uid)!;
        }

        // Create new promise for this request
        const promise = fetchFn(...args)
            .then((data) => {
                // Store result in cache
                cache.set(uid, data);
                // Remove from pending
                pendingPromises.delete(uid);
                return data;
            })
            .catch((error) => {
                // Clean up on error
                pendingPromises.delete(uid);
                throw error;
            });

        // Store the promise
        pendingPromises.set(uid, promise);
        return promise;
    }

    // Add clearCache method to the function
    cachedFetch.clearCache = () => {
        cache.clear();
        pendingPromises.clear();
    };

    return cachedFetch;
}
