
import { validateUrl } from './ssrf';

async function runTests() {
    console.log("Running SSRF validation tests...");
    let passed = 0;
    let failed = 0;

    const testCases = [
        { url: 'https://google.com', expected: true, name: 'Public URL (google.com)' },
        { url: 'http://example.com', expected: true, name: 'Public URL (example.com)' },
        { url: 'http://localhost', expected: false, name: 'Localhost hostname' },
        { url: 'http://127.0.0.1', expected: false, name: 'Loopback IPv4' },
        { url: 'http://[::1]', expected: false, name: 'Loopback IPv6' },
        { url: 'http://192.168.1.1', expected: false, name: 'Private IPv4 (192.168)' },
        { url: 'http://10.0.0.1', expected: false, name: 'Private IPv4 (10.)' },
        { url: 'http://172.16.0.1', expected: false, name: 'Private IPv4 (172.16)' },
        { url: 'http://169.254.169.254', expected: false, name: 'Link-local IPv4' },
        { url: 'http://0.0.0.0', expected: false, name: '0.0.0.0' },
        { url: 'ftp://google.com', expected: false, name: 'Invalid Protocol (ftp)' },
        // { url: 'http://127.0.0.1.nip.io', expected: false, name: 'DNS Rebinding / Public DNS pointing to Local' } // This requires network call and might be flaky or blocked by DNS resolver in sandbox? But let's try 127.0.0.1.nip.io if we have internet.
    ];

    for (const test of testCases) {
        try {
            await validateUrl(test.url);
            if (test.expected) {
                console.log(`✅ Passed: ${test.name}`);
                passed++;
            } else {
                console.error(`❌ Failed: ${test.name} - Expected to throw error but succeeded`);
                failed++;
            }
        } catch (e: unknown) {
            if (!test.expected) {
                const message = e instanceof Error ? e.message : String(e);
                console.log(`✅ Passed: ${test.name} - Caught expected error: ${message}`);
                passed++;
            } else {
                const message = e instanceof Error ? e.message : String(e);
                console.error(`❌ Failed: ${test.name} - Expected success but failed: ${message}`);
                failed++;
            }
        }
    }

    // Test a known public DNS that resolves to localhost if possible?
    // 127.0.0.1.nip.io usually resolves to 127.0.0.1.
    try {
        await validateUrl('http://127.0.0.1.nip.io');
        console.error(`❌ Failed: nip.io localhost - Expected to throw error but succeeded`);
        failed++;
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.log(`✅ Passed: nip.io localhost - Caught expected error: ${message}`);
        passed++;
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) process.exit(1);
}

runTests().catch(e => {
    console.error("Test runner failed:", e);
    process.exit(1);
});
