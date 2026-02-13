import { type Entry } from "@/types/entry";

export async function createEntryInternal(formData: FormData, supabase: any) {
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
}
