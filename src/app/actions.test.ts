
import { describe, it, mock, afterEach } from 'node:test';
import assert from 'node:assert';
import { fetchUrlMetadata } from './actions';

describe('fetchUrlMetadata', () => {
    afterEach(() => {
        mock.restoreAll();
    });

    it('returns null for non-http URLs', async () => {
        const result = await fetchUrlMetadata('ftp://example.com');
        assert.strictEqual(result, null);
    });

    it('returns null when fetch fails', async () => {
        // Mock fetch to reject
        mock.method(global, 'fetch', () => Promise.reject(new Error('Network error')));

        // Use a try-catch in case the function throws (it shouldn't, but good to be safe)
        // The implementation catches errors and returns null
        const result = await fetchUrlMetadata('https://example.com');
        assert.strictEqual(result, null);
    });

    it('returns null when no relevant metadata found', async () => {
        mock.method(global, 'fetch', () => Promise.resolve(new Response('<html><body>No meta here</body></html>')));
        const result = await fetchUrlMetadata('https://example.com');
        assert.strictEqual(result, null);
    });

    it('extracts OpenGraph metadata correctly', async () => {
        const html = `
            <html>
                <head>
                    <meta property="og:title" content="OG Title" />
                    <meta property="og:description" content="OG Description" />
                    <meta property="og:image" content="https://example.com/og.jpg" />
                </head>
            </html>
        `;
        mock.method(global, 'fetch', () => Promise.resolve(new Response(html)));

        const result = await fetchUrlMetadata('https://example.com');
        assert.deepStrictEqual(result, {
            title: 'OG Title',
            description: 'OG Description',
            image: 'https://example.com/og.jpg',
            url: 'https://example.com'
        });
    });

    it('extracts Twitter metadata correctly', async () => {
        const html = `
            <html>
                <head>
                    <meta name="twitter:title" content="Twitter Title" />
                    <meta name="twitter:description" content="Twitter Description" />
                    <meta name="twitter:image" content="https://example.com/twitter.jpg" />
                </head>
            </html>
        `;
        mock.method(global, 'fetch', () => Promise.resolve(new Response(html)));

        const result = await fetchUrlMetadata('https://example.com');
        assert.deepStrictEqual(result, {
            title: 'Twitter Title',
            description: 'Twitter Description',
            image: 'https://example.com/twitter.jpg',
            url: 'https://example.com'
        });
    });

    it('extracts standard metadata correctly', async () => {
        const html = `
            <html>
                <head>
                    <title>Standard Title</title>
                    <meta name="description" content="Standard Description" />
                </head>
            </html>
        `;
        mock.method(global, 'fetch', () => Promise.resolve(new Response(html)));

        const result = await fetchUrlMetadata('https://example.com');
        assert.deepStrictEqual(result, {
            title: 'Standard Title',
            description: 'Standard Description',
            image: null,
            url: 'https://example.com'
        });
    });

    it('prioritizes OpenGraph over Twitter over standard metadata', async () => {
         const html = `
            <html>
                <head>
                    <title>Standard Title</title>
                    <meta property="og:title" content="OG Title" />
                    <meta name="twitter:title" content="Twitter Title" />

                    <meta name="description" content="Standard Description" />
                    <meta property="og:description" content="OG Description" />
                </head>
            </html>
        `;
        mock.method(global, 'fetch', () => Promise.resolve(new Response(html)));

        const result = await fetchUrlMetadata('https://example.com');

        assert.strictEqual(result?.title, 'OG Title');
        assert.strictEqual(result?.description, 'OG Description');
    });

    it('handles missing description gracefully', async () => {
        const html = `
            <html>
                <head>
                    <title>Just Title</title>
                </head>
            </html>
        `;
        mock.method(global, 'fetch', () => Promise.resolve(new Response(html)));

        const result = await fetchUrlMetadata('https://example.com');
        assert.deepStrictEqual(result, {
            title: 'Just Title',
            description: null,
            image: null,
            url: 'https://example.com'
        });
    });
});
