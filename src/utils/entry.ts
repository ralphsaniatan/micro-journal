import type { Entry } from "../types/entry";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchRecursiveParents(supabase: SupabaseClient, entries: Entry[]): Promise<Entry[]> {
    if (!entries || entries.length === 0) return entries;

    const allEntries = new Map<string, Entry>();

    // Initialize map with current entries
    entries.forEach(e => allEntries.set(e.id, e));

    let currentEntries = [...entries];

    while (true) {
        const parentIdsToFetch = new Set<string>();

        for (const entry of currentEntries) {
            if (entry.parent_id && !allEntries.has(entry.parent_id)) {
                parentIdsToFetch.add(entry.parent_id);
            }
        }

        if (parentIdsToFetch.size === 0) {
            break;
        }

        const { data: parents } = await supabase
            .from("entries")
            .select(`
                *,
                author:profiles(username, avatar_url)
            `)
            .in("id", Array.from(parentIdsToFetch));

        if (!parents || parents.length === 0) {
            break;
        }

        const newParents = parents as Entry[];
        // Only process new entries in next iteration that we haven't seen before
        // (though by definition of parentIdsToFetch they shouldn't be seen, but good to be safe)
        const unseenParents = newParents.filter(p => !allEntries.has(p.id));

        if (unseenParents.length === 0) {
            break;
        }

        unseenParents.forEach(p => allEntries.set(p.id, p));
        currentEntries = unseenParents;
    }

    return Array.from(allEntries.values());
}
