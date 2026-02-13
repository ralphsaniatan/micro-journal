import { test } from 'node:test';
import assert from 'node:assert';
import { fetchRecursiveParents } from './entry';
import type { Entry } from '../types/entry';

// Mock Supabase Client
const createMockSupabase = (entries: Entry[]) => {
    const entriesMap = new Map(entries.map(e => [e.id, e]));

    return {
        from: (table: string) => {
            if (table !== 'entries') throw new Error(`Unexpected table: ${table}`);
            return {
                select: (query: string) => {
                    return {
                        in: async (field: string, ids: string[]) => {
                            if (field !== 'id') throw new Error(`Unexpected field: ${field}`);
                            // Simulate fetching
                            const data = ids.map(id => entriesMap.get(id)).filter(e => e !== undefined);
                            return { data };
                        }
                    };
                }
            };
        }
    } as any;
};

test('fetchRecursiveParents fetches all ancestors', async () => {
    const root: Entry = { id: '1', parent_id: null, content: 'Root', user_id: 'u1', created_at: '', tags: [], media_urls: [], is_deleted: false, edited_at: null, thread_index: null };
    const child1: Entry = { id: '2', parent_id: '1', content: 'Child 1', user_id: 'u1', created_at: '', tags: [], media_urls: [], is_deleted: false, edited_at: null, thread_index: null };
    const child2: Entry = { id: '3', parent_id: '2', content: 'Child 2', user_id: 'u1', created_at: '', tags: [], media_urls: [], is_deleted: false, edited_at: null, thread_index: null };
    const leaf: Entry = { id: '4', parent_id: '3', content: 'Leaf', user_id: 'u1', created_at: '', tags: [], media_urls: [], is_deleted: false, edited_at: null, thread_index: null };

    const allEntries = [root, child1, child2, leaf];
    const supabase = createMockSupabase(allEntries);

    // Start with the leaf
    const initialEntries = [leaf];

    const result = await fetchRecursiveParents(supabase, initialEntries);

    assert.strictEqual(result.length, 4);
    assert.ok(result.some(e => e.id === '1'));
    assert.ok(result.some(e => e.id === '2'));
    assert.ok(result.some(e => e.id === '3'));
    assert.ok(result.some(e => e.id === '4'));
});

test('fetchRecursiveParents handles missing parents gracefully', async () => {
    const orphan: Entry = { id: '2', parent_id: '999', content: 'Orphan', user_id: 'u1', created_at: '', tags: [], media_urls: [], is_deleted: false, edited_at: null, thread_index: null };

    // 999 is missing from here
    const allEntries = [orphan];
    const supabase = createMockSupabase(allEntries);

    const initialEntries = [orphan];

    const result = await fetchRecursiveParents(supabase, initialEntries);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, '2');
});

test('fetchRecursiveParents stops at null parent', async () => {
    const root: Entry = { id: '1', parent_id: null, content: 'Root', user_id: 'u1', created_at: '', tags: [], media_urls: [], is_deleted: false, edited_at: null, thread_index: null };
    const child: Entry = { id: '2', parent_id: '1', content: 'Child', user_id: 'u1', created_at: '', tags: [], media_urls: [], is_deleted: false, edited_at: null, thread_index: null };

    const allEntries = [root, child];
    const supabase = createMockSupabase(allEntries);

    const initialEntries = [child];

    const result = await fetchRecursiveParents(supabase, initialEntries);

    assert.strictEqual(result.length, 2);
    assert.ok(result.some(e => e.id === '1'));
    assert.ok(result.some(e => e.id === '2'));
});
