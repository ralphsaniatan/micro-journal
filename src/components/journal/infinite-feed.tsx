"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Feed } from "./feed";
import { type Entry } from "@/types/entry";
import { Loader2 } from "lucide-react";

interface InfiniteFeedProps {
    initialEntries: Entry[];
    loader: (page: number) => Promise<Entry[]>;
    currentUserId?: string;
    tagBaseUrl?: string;
}

export function InfiniteFeed({ initialEntries, loader, currentUserId, tagBaseUrl }: InfiniteFeedProps) {
    const [entries, setEntries] = useState<Entry[]>(initialEntries);
    const [page, setPage] = useState(1); // Start asking for page 1 (since 0 is initial)
    const [hasMore, setHasMore] = useState(true);
    const [isPending, startTransition] = useTransition();
    const observerTarget = useRef<HTMLDivElement>(null);

    // If initial entries are less than limit (25), we assume no more data?
    // Or we just try to fetch next page.
    useEffect(() => {
        setEntries(initialEntries);
        setPage(1);
        setHasMore(initialEntries.length >= 12);
    }, [initialEntries]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isPending) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, isPending]);

    const loadMore = () => {
        startTransition(async () => {
            const newEntries = await loader(page);
            if (newEntries.length === 0) {
                setHasMore(false);
            } else {
                setEntries((prev) => [...prev, ...newEntries]);
                setPage((p) => p + 1);
                if (newEntries.length < 12) {
                    setHasMore(false);
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <Feed entries={entries} currentUserId={currentUserId} tagBaseUrl={tagBaseUrl} />

            {hasMore && (
                <div ref={observerTarget} className="flex justify-center p-4">
                    {isPending && <Loader2 className="h-6 w-6 animate-spin text-gray-500" />}
                </div>
            )}

            {!hasMore && entries.length > 0 && (
                <div className="text-center text-gray-600 text-sm py-8 space-y-2">
                    <p>You've reached the start of the dump.</p>
                    <p className="text-[12px] opacity-60">Vibecoded by Ralph for Ralph © 2025</p>
                </div>
            )}
        </div>
    );
}
