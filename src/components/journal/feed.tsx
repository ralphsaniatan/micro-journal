import { type Entry } from "@/types/entry";
import { EntryCard } from "./entry-card";
import React from "react";

export function Feed({ entries, currentUserId, tagBaseUrl }: { entries: Entry[], currentUserId?: string, tagBaseUrl?: string }) {
    // Build a map for children lookup
    const childrenMap = new Map<string, Entry[]>();
    entries.forEach(e => {
        if (e.parent_id) {
            const list = childrenMap.get(e.parent_id) || [];
            list.push(e);
            childrenMap.set(e.parent_id, list);
        }
    });

    // Helper to flatten a thread (DFS) - returns the full linear conversation
    const flattenThread = (entry: Entry): Entry[] => {
        const flat: Entry[] = [];
        const traverse = (current: Entry) => {
            flat.push(current);
            const children = childrenMap.get(current.id) || [];
            // Sort children strictly by creation time
            children.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            children.forEach(child => {
                traverse(child);
            });
        };
        traverse(entry);
        return flat;
    };

    // Helper to search for latest activity (sorting roots)
    const getLatestActivity = (entry: Entry): number => {
        let max = new Date(entry.created_at).getTime();
        const children = childrenMap.get(entry.id) || [];
        for (const child of children) {
            const childMax = getLatestActivity(child);
            if (childMax > max) max = childMax;
        }
        return max;
    };

    const entryIds = new Set(entries.map(e => e.id));
    // Root = No parent, OR Parent is missing from this dataset (e.g. search result)
    const roots = entries.filter((e) => !e.parent_id || !entryIds.has(e.parent_id));
    const sortedRoots = [...roots].sort((a, b) => getLatestActivity(b) - getLatestActivity(a));

    return (
        <div className="pb-20">
            {sortedRoots.map(root => {
                const flatThread = flattenThread(root);
                const totalCount = flatThread.length;

                return (
                    <div key={root.id} className="border-b border-gray-800">
                        {flatThread.map((entry, index) => {
                            const prevEntry = flatThread[index - 1];
                            const nextEntry = flatThread[index + 1];

                            // Logic for X-style connecting lines
                            // Connect up if parent is immediately above in this flattened list
                            const hasParent = prevEntry && entry.parent_id === prevEntry.id;

                            // Connect down if next item is a child of this one
                            const hasReply = nextEntry && nextEntry.parent_id === entry.id;

                            return (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    hasParent={!!hasParent}
                                    hasReply={!!hasReply}
                                    threadIndex={index + 1}
                                    totalCount={totalCount > 1 ? totalCount : undefined}
                                    currentUserId={currentUserId}
                                    tagBaseUrl={tagBaseUrl}
                                />
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}
