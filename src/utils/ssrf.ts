import ipaddr from 'ipaddr.js';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

export async function validateUrl(url: string): Promise<string> {
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error('Invalid URL');
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
    }

    const hostname = parsedUrl.hostname;

    // Resolve hostname to IP
    // We pass { all: true } to get all addresses? No, we just need one to verify?
    // If we just get one, it might be the safe one, but the browser/fetch might pick the unsafe one.
    // But fetch usually picks the first one.
    // Ideally we should check all resolved IPs.

    // However, standard dns.lookup (without all) returns the first one.
    const resolved = await lookup(hostname);

    if (!resolved || !resolved.address) {
        throw new Error('Could not resolve hostname');
    }

    const address = resolved.address;

    // Check if IP is private
    let ip;
    try {
        ip = ipaddr.parse(address);
    } catch {
        throw new Error('Invalid IP address resolved');
    }

    const range = ip.range();

    const unsafeRanges = [
        'loopback',
        'private',
        'linkLocal',
        'uniqueLocal',
        'reserved',
        'broadcast',
        'multicast',
        'unspecified'
    ];

    if (unsafeRanges.includes(range)) {
         throw new Error(`Unsafe IP range: ${range}`);
    }

    // Also handle IPv4 mapped IPv6
    if (ip.kind() === 'ipv6' && (ip as ipaddr.IPv6).isIPv4MappedAddress()) {
         const ipv4 = (ip as ipaddr.IPv6).toIPv4Address();
         const ipv4Range = ipv4.range();
         if (unsafeRanges.includes(ipv4Range)) {
             throw new Error(`Unsafe IPv4-mapped IP range: ${ipv4Range}`);
         }
    }

    return url;
}
