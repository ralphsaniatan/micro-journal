import { test, describe } from 'node:test';
import assert from 'node:assert';
import { isSafeUrl } from './security';

describe('isSafeUrl', () => {
    test('should allow valid public URLs', async () => {
        assert.strictEqual(await isSafeUrl('https://google.com'), true);
        assert.strictEqual(await isSafeUrl('http://example.com'), true);
    });

    test('should reject invalid protocols', async () => {
        assert.strictEqual(await isSafeUrl('ftp://example.com'), false);
        assert.strictEqual(await isSafeUrl('file:///etc/passwd'), false);
        assert.strictEqual(await isSafeUrl('javascript:alert(1)'), false);
    });

    test('should reject localhost', async () => {
        assert.strictEqual(await isSafeUrl('http://localhost'), false);
        assert.strictEqual(await isSafeUrl('http://localhost:3000'), false);
    });

    test('should reject private IPv4 addresses', async () => {
        assert.strictEqual(await isSafeUrl('http://127.0.0.1'), false);
        assert.strictEqual(await isSafeUrl('http://10.0.0.1'), false);
        assert.strictEqual(await isSafeUrl('http://192.168.1.1'), false);
        assert.strictEqual(await isSafeUrl('http://172.16.0.1'), false); // 172.16 - 172.31
        assert.strictEqual(await isSafeUrl('http://172.31.255.255'), false);
        assert.strictEqual(await isSafeUrl('http://169.254.1.1'), false);
    });

    test('should reject private IPv6 addresses', async () => {
        assert.strictEqual(await isSafeUrl('http://[::1]'), false);
        assert.strictEqual(await isSafeUrl('http://[fc00::1]'), false);
        assert.strictEqual(await isSafeUrl('http://[fe80::1]'), false);
    });

    test('should reject IPv4 mapped IPv6 addresses', async () => {
         assert.strictEqual(await isSafeUrl('http://[::ffff:127.0.0.1]'), false);
         assert.strictEqual(await isSafeUrl('http://[::ffff:10.0.0.1]'), false);
         // Note: 8.8.8.8 is Google DNS, definitely public
         assert.strictEqual(await isSafeUrl('http://[::ffff:8.8.8.8]'), true);
    });

    test('should allow public IPs', async () => {
        assert.strictEqual(await isSafeUrl('http://8.8.8.8'), true);
        assert.strictEqual(await isSafeUrl('http://1.1.1.1'), true);
    });

    test('should reject 0.0.0.0', async () => {
        assert.strictEqual(await isSafeUrl('http://0.0.0.0'), false);
    });
});
