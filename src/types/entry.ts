export type Entry = {
    id: string;
    user_id: string;
    content: string;
    parent_id: string | null;
    thread_index: number | null;
    media_urls: string[]; // Handled as jsonb in DB, array here
    tags: string[];
    is_deleted: boolean;
    created_at: string;
    edited_at: string | null;
    author?: {
        username: string | null;
        avatar_url: string | null;
    };
};

export const MOCK_ENTRIES: Entry[] = [
    {
        id: "1",
        user_id: "user_123",
        content: "Just started using this new micro-journaling app. It's pretty sleek. #new #journal",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        tags: ["#new", "#journal"],
        parent_id: null,
        thread_index: null,
        media_urls: [],
        is_deleted: false,
        edited_at: null,
    },
    {
        id: "2",
        user_id: "user_123",
        content: "Thinking about the design of the universe today. Why is math so effective? @Einstein",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        tags: ["@Einstein"],
        parent_id: null,
        thread_index: null,
        media_urls: [],
        is_deleted: false,
        edited_at: null,
    },
    {
        id: "3",
        user_id: "user_123",
        parent_id: "2",
        thread_index: 1,
        content: "It seems like a language we discovered, not one we invented.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), // 23 hours ago
        tags: [],
        media_urls: [],
        is_deleted: false,
        edited_at: null,
    },
    {
        id: "4",
        user_id: "user_123",
        parent_id: "2",
        thread_index: 2,
        content: "But then again, maybe our brains just process patterns that way.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
        tags: [],
        media_urls: [],
        is_deleted: false,
        edited_at: null,
    },
];
