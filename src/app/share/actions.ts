"use server";

import { createClient } from "@supabase/supabase-js"; // Admin client for bypassing RLS
import { cookies } from "next/headers";

// Use Admin Client for Guest Access (since they are not logged in)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Need to ensure this env var exists
);

export async function verifyToken(token: string) {
    // We can use the anon public client for reading public data IF we set RLS to allow public select on shared_links where token = x
    // But strictly speaking, it's safer to use Admin here or proper RLS.
    // Given we didn't set public RLS, we likely need Admin or a specific query.

    // Let's use Admin to find the link.
    const { data, error } = await supabaseAdmin
        .from("shared_links")
        .select("id, user_id, label")
        .eq("token", token)
        .single();

    if (error || !data) return null;
    return data;
}

export async function recordView(token: string, viewerName: string) {
    const link = await verifyToken(token);
    if (!link) throw new Error("Invalid Link");

    // Enforce Name Matching (Case Insensitive)
    const normalizedInput = viewerName.trim().toLowerCase();
    const normalizedLabel = link.label.trim().toLowerCase();

    if (normalizedInput !== normalizedLabel) {
        throw new Error("Incorrect Name. Please enter the name exactly as it appears on your invitation.");
    }

    // Insert into shared_views
    const { error } = await supabaseAdmin
        .from("shared_views")
        .insert({
            link_id: link.id,
            viewer_name: viewerName
        });

    if (error) throw error;

    // Set Cookie to remember session
    (await cookies()).set(`journal_guest_${token}`, viewerName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
    });
}

export async function getSharedEntries(token: string, tag?: string, page = 0, limit = 12) {
    const link = await verifyToken(token);
    if (!link) return null;

    const safeLimit = Math.min(limit, 50);

    const from = page * safeLimit;
    const to = from + safeLimit - 1;

    console.log(`[getSharedEntries] Fetching for Token=${token?.substring(0, 5)}... Tag=${tag} Page=${page}. Time: ${new Date().toISOString()}`);

    let query = supabaseAdmin
        .from("entries")
        .select("*")
        .eq("user_id", link.user_id)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (tag) {
        query = query.contains("tags", [tag]);
    }

    const { data: entriesData, error } = await query;

    if (error) throw error;

    // Fetch profile for header info AND entry author
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", link.user_id)
        .single();

    // Attach author to entries manually
    const entries = entriesData?.map(e => ({
        ...e,
        author: profile
    }));

    return { entries, owner: profile };
}


export async function getSharedFeed(token: string, tag: string | undefined, page: number) {
    const data = await getSharedEntries(token, tag, page);
    return data?.entries || [];
}

export async function getSharedTags(token: string) {
    const link = await verifyToken(token);
    if (!link) return [];

    const { data: entries } = await supabaseAdmin
        .from("entries")
        .select("tags")
        .eq("user_id", link.user_id);

    if (!entries) return [];

    const tagCounts: Record<string, number> = {};
    entries.forEach(e => {
        if (Array.isArray(e.tags)) {
            e.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    return Object.entries(tagCounts)
        .map(([tag, count]) => ({
            tag,
            count,
            type: tag.startsWith('@') ? 'mention' : 'hashtag'
        }))
        .sort((a, b) => b.count - a.count);
}
