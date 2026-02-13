"use server";

import { createClient } from "@/utils/supabase/server";
import { type Entry } from "@/types/entry";
import { aggregateTags } from "../utils/tag-aggregator";
import { revalidatePath } from "next/cache";

export async function getEntries(tag?: string, page = 0, limit = 12): Promise<Entry[]> {
    const supabase = await createClient();
    const safeLimit = Math.min(limit, 50);

    const from = page * safeLimit;
    const to = from + safeLimit - 1;

    let query = supabase
        .from("entries")
        .select(`
            *,
            author:profiles(username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (tag) {
        query = query.contains('tags', [tag]);
    }

    const { data: initialData, error } = await query;
    if (error) {
        console.error("Error fetching entries:", error);
        return [];
    }

    let entries = (initialData as Entry[]) || [];

    // If filtering, we should try to fetch the context (parents)
    if (tag && entries.length > 0) {
        const entryIds = new Set(entries.map(e => e.id));
        const parentIdsToFetch = new Set<string>();

        entries.forEach(e => {
            if (e.parent_id && !entryIds.has(e.parent_id)) {
                parentIdsToFetch.add(e.parent_id);
            }
        });

        if (parentIdsToFetch.size > 0) {
            const { data: parents } = await supabase
                .from("entries")
                .select(`
                    *,
                    author:profiles(username, avatar_url)
                `)
                .in("id", Array.from(parentIdsToFetch));

            if (parents) {
                // Add parents to the list. 
                // Note: we're not doing full recursive thread reconstruction, just 1 level up.
                // This acts as context.
                entries = [...entries, ...(parents as Entry[])];
            }
        }
    }

    return entries;
}

export async function fetchUrlMetadata(url: string) {
    if (!url.startsWith('http')) return null;
    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const html = await res.text();

        // Simple regex extraction
        const getMeta = (prop: string) => {
            const match = html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`, 'i')) ||
                html.match(new RegExp(`<meta name="${prop}" content="([^"]*)"`, 'i'));
            return match ? match[1] : null;
        };

        const title = getMeta('og:title') || getMeta('twitter:title') || html.match(/<title>([^<]*)<\/title>/i)?.[1];
        const description = getMeta('og:description') || getMeta('description');
        const image = getMeta('og:image') || getMeta('twitter:image');

        if (!title && !image) return null;

        return { title, description, image, url };
    } catch (e) {
        console.error("Metadata fetch failed", e);
        return null;
    }
}

export async function getAllTags(): Promise<Array<{ tag: string, count: number, type: 'hashtag' | 'mention' }>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return aggregateTags(supabase, user.id);
}

export async function getEntryDates(): Promise<string[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("entries")
        .select('created_at')
        .eq('user_id', user.id);

    if (!data) return [];

    return data.map(d => d.created_at);
}

export async function getEntryById(id: string): Promise<Entry | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("entries")
        .select(`
            *,
            author:profiles(username, avatar_url)
        `)
        .eq("id", id)
        .single();

    return data as Entry;
}

export async function createEntry(formData: FormData) {
    const supabase = await createClient();
    const content = formData.get("content") as string;
    const parentId = formData.get("parent_id") as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    if (!content || content.length > 240) throw new Error("Content invalid");

    const tags = (content.match(/([#@][\w]+)/g) || []);
    const mediaUrlsJson = formData.get("media_urls") as string;
    const media_urls = mediaUrlsJson ? JSON.parse(mediaUrlsJson) : [];

    const entryData: Partial<Entry> = {
        user_id: user.id,
        content,
        tags,
        media_urls,
        parent_id: parentId || null,
    };

    const { error } = await supabase.from("entries").insert(entryData);
    if (error) throw new Error("Failed to create entry");

    revalidatePath("/");
}

export async function deleteEntry(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("entries")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/");
}

export async function updateEntry(id: string, content: string, createdAt?: string, mediaUrls?: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const tags = (content.match(/([#@][\w]+)/g) || []);

    const updates: any = {
        content,
        tags,
        updated_at: new Date().toISOString()
    };

    if (createdAt) {
        updates.created_at = createdAt;
    }
    if (mediaUrls) {
        updates.media_urls = mediaUrls;
    }

    const { error } = await supabase
        .from("entries")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/");
}
