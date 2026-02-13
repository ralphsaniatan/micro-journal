import { SupabaseClient } from '@supabase/supabase-js';

export type TagStat = {
    tag: string;
    count: number;
    type: 'hashtag' | 'mention';
};

export async function aggregateTags(supabase: SupabaseClient, userId: string): Promise<TagStat[]> {
    // Try RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_tag_counts');

    if (!rpcError && rpcData) {
        return (rpcData as { tag: string; count: number }[]).map((row) => ({
            tag: row.tag,
            count: Number(row.count),
            type: row.tag.startsWith('@') ? 'mention' : 'hashtag'
        }));
    }

    // Fallback: fetch all tags and aggregate in memory
    const { data } = await supabase
        .from("entries")
        .select('tags')
        .eq('user_id', userId);

    if (!data) return [];

    const tagCounts = new Map<string, number>();

    data.forEach((row) => {
        const tags = row.tags as string[] | null;
        if (tags && Array.isArray(tags)) {
            tags.forEach((tag: string) => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        }
    });

    const result = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({
            tag,
            count,
            type: (tag.startsWith('@') ? 'mention' : 'hashtag') as 'hashtag' | 'mention'
        }))
        .sort((a, b) => b.count - a.count);

    return result;
}
