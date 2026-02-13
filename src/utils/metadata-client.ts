import { fetchBatchUrlMetadata } from "@/app/actions";

export interface LinkMetadata {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    url: string;
}

const metadataCache = new Map<string, LinkMetadata | null>();
const pendingPromises = new Map<string, Array<(data: LinkMetadata | null) => void>>();
const batchQueue: string[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

const BATCH_DELAY = 50; // ms to wait for more requests

async function flushQueue() {
    if (batchQueue.length === 0) return;

    const urlsToFetch = Array.from(new Set(batchQueue));
    batchQueue.length = 0;
    batchTimeout = null;

    try {
        const results = await fetchBatchUrlMetadata(urlsToFetch);

        // Process successful results
        Object.entries(results).forEach(([url, data]) => {
            const metadata = data as LinkMetadata;
            metadataCache.set(url, metadata);
            resolvePending(url, metadata);
        });

        // Process failed/missing results
        urlsToFetch.forEach(url => {
            if (!results[url]) {
                metadataCache.set(url, null); // Cache null so we don't retry immediately
                resolvePending(url, null);
            }
        });

    } catch (e) {
        console.error("Batch metadata fetch failed", e);
        // Fail all pending
        urlsToFetch.forEach(url => {
            resolvePending(url, null);
        });
    }
}

function resolvePending(url: string, data: LinkMetadata | null) {
    const resolvers = pendingPromises.get(url);
    if (resolvers) {
        resolvers.forEach(resolve => resolve(data));
        pendingPromises.delete(url);
    }
}

export function getMetadata(url: string): Promise<LinkMetadata | null> {
    if (!url) return Promise.resolve(null);

    // Return cached result if available
    if (metadataCache.has(url)) {
        return Promise.resolve(metadataCache.get(url)!);
    }

    // If already pending, return a new promise that resolves when the pending one does
    return new Promise((resolve) => {
        if (!pendingPromises.has(url)) {
            pendingPromises.set(url, []);
            batchQueue.push(url);
        }
        pendingPromises.get(url)!.push(resolve);

        if (!batchTimeout) {
            batchTimeout = setTimeout(flushQueue, BATCH_DELAY);
        }
    });
}
