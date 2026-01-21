"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function NavigationPrefetcher() {
    const router = useRouter();

    useEffect(() => {
        const routes = [
            "/settings",
            "/calendar",
            "/tags",
            "/mentions"
        ];

        // Prefetch routes with low priority background task if possible, 
        // or just spread them out to avoid main thread blocking
        const prefetchRoutes = async () => {
            for (const route of routes) {
                router.prefetch(route);
                // Small delay to yield to main thread
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        };

        if (typeof window !== "undefined") {
            // Use requestIdleCallback if available, otherwise just run
            if ((window as any).requestIdleCallback) {
                (window as any).requestIdleCallback(prefetchRoutes);
            } else {
                setTimeout(prefetchRoutes, 1000);
            }
        }
    }, [router]);

    return null;
}
