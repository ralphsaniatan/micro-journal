"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Profile = {
    id: string;
    username: string | null;
    avatar_url: string | null;
    updated_at: string | null;
};

// --- Profile Actions ---

export async function getProfile(): Promise<Profile | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) return null;
    return data;
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const username = formData.get("username") as string;
    const avatarUrl = formData.get("avatar_url") as string;

    const updates: any = {
        username,
        updated_at: new Date().toISOString(),
    };

    if (avatarUrl) {
        updates.avatar_url = avatarUrl;
    }

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

    if (error) throw error;
    revalidatePath("/settings");
    revalidatePath("/"); // Update header avatar
}

// --- Sharing Actions ---

export async function createShareLink(label: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
        .from("shared_links")
        .insert({
            user_id: user.id,
            label,
        })
        .select("*")
        .single();

    if (error) throw error;
    revalidatePath("/settings");
    return data;
}

export async function revokeShareLink(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("shared_links")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // Security check

    if (error) throw error;
    revalidatePath("/settings");
}

export async function getShareLinks() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Fetch links and their view counts
    const { data, error } = await supabase
        .from("shared_links")
        .select(`
      *,
      shared_views (count)
    `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform count object
    return data.map((link: any) => ({
        ...link,
        view_count: link.shared_views[0]?.count || 0
    }));
}

export async function getLinkHistory(linkId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify ownership
    const { data: link } = await supabase
        .from("shared_links")
        .select("id")
        .eq("id", linkId)
        .eq("user_id", user.id)
        .single();

    if (!link) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("shared_views")
        .select("*")
        .eq("link_id", linkId)
        .order("viewed_at", { ascending: false });

    if (error) throw error;
    return data;
}
