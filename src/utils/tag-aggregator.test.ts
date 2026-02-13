import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
// @ts-expect-error: extension required for node runtime
import { aggregateTags } from './tag-aggregator.ts';

// Mock types
type MockSupabaseClient = any; // eslint-disable-line @typescript-eslint/no-explicit-any

describe('aggregateTags', () => {
    test('should return aggregated tags from RPC if successful', async () => {
        const mockClient = {
            rpc: mock.fn(async () => ({
                data: [
                    { tag: '#test', count: 10 },
                    { tag: '@user', count: 5 }
                ],
                error: null
            })),
            from: mock.fn()
        };

        const result = await aggregateTags(mockClient as MockSupabaseClient, 'user-id');

        assert.deepStrictEqual(result, [
            { tag: '#test', count: 10, type: 'hashtag' },
            { tag: '@user', count: 5, type: 'mention' }
        ]);
        assert.strictEqual(mockClient.rpc.mock.callCount(), 1);
        assert.strictEqual(mockClient.from.mock.callCount(), 0);
    });

    test('should fallback to existing implementation if RPC fails', async () => {
        const mockClient = {
            rpc: mock.fn(async () => ({ data: null, error: { message: 'failed' } })),
            from: mock.fn(() => ({
                select: mock.fn(() => ({
                    eq: mock.fn(async () => ({
                        data: [
                            { tags: ['#fallback', '@fallback'] },
                            { tags: ['#fallback'] }
                        ]
                    }))
                }))
            }))
        };

        const result = await aggregateTags(mockClient as MockSupabaseClient, 'user-id');

        assert.deepStrictEqual(result, [
            { tag: '#fallback', count: 2, type: 'hashtag' },
            { tag: '@fallback', count: 1, type: 'mention' }
        ]);
        assert.strictEqual(mockClient.rpc.mock.callCount(), 1);
        assert.strictEqual(mockClient.from.mock.callCount(), 1);
    });
});
