/**
 * Helper to process array mapping in chunks during idle frames using requestIdleCallback,
 * falling back to setTimeout if requestIdleCallback is not available.
 * This prevents blocking the main JavaScript thread on CPU-heavy operations (like decryption).
 */
export const mapInIdle = async <T, R>(
    items: T[],
    batchSize: number,
    processor: (item: T) => Promise<R>
): Promise<R[]> => {
    const results: R[] = [];
    let index = 0;

    const runBatch = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            const process = async () => {
                try {
                    const end = Math.min(index + batchSize, items.length);
                    const batch: Promise<R>[] = [];
                    for (let i = index; i < end; i++) {
                        batch.push(processor(items[i]));
                    }
                    const batchResults = await Promise.all(batch);
                    results.push(...batchResults);
                    index = end;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(() => process());
            } else {
                setTimeout(process, 1);
            }
        });
    };

    while (index < items.length) {
        await runBatch();
    }

    return results;
};
