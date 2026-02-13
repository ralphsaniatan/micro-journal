import dns from 'dns';
import net from 'net';

/**
 * Checks if a URL is safe to request (SSRF protection).
 * Validates protocol and ensures hostname does not resolve to a private/internal IP.
 */
export async function isSafeUrl(url: string): Promise<boolean> {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return false;
        }

        let hostname = parsedUrl.hostname;

        // Strip brackets for IPv6 literals (e.g. [::1] -> ::1)
        if (hostname.startsWith('[') && hostname.endsWith(']')) {
            hostname = hostname.slice(1, -1);
        }

        // Check if hostname is explicitly localhost
        if (hostname === 'localhost') {
            return false;
        }

        // If hostname is an IP address, validate it directly
        if (net.isIP(hostname)) {
            return isPublicIP(hostname);
        }

        // Resolve hostname
        try {
            const lookupResult = await dns.promises.lookup(hostname, { all: true });

            // If it resolves to nothing, it's technically "safe" (unreachable),
            // but for our purpose, we can consider it valid only if we have IPs and they are all public.
            if (!lookupResult || lookupResult.length === 0) {
                return false;
            }

            for (const { address } of lookupResult) {
                if (!isPublicIP(address)) {
                    return false;
                }
            }

            return true;
        } catch (e) {
            // DNS resolution failed or hostname invalid
            return false;
        }
    } catch (e) {
        // URL parsing failed
        return false;
    }
}

function isPublicIP(ip: string): boolean {
    const version = net.isIP(ip);
    if (version === 4) {
        // IPv4 checks
        const parts = ip.split('.').map(Number);
        if (parts.length !== 4) return false;

        // 0.0.0.0/8 (Current network)
        if (parts[0] === 0) return false;

        // 10.0.0.0/8 (Private)
        if (parts[0] === 10) return false;

        // 100.64.0.0/10 (Carrier-grade NAT)
        if (parts[0] === 100 && (parts[1] >= 64 && parts[1] <= 127)) return false;

        // 127.0.0.0/8 (Loopback)
        if (parts[0] === 127) return false;

        // 169.254.0.0/16 (Link-local)
        if (parts[0] === 169 && parts[1] === 254) return false;

        // 172.16.0.0/12 (Private)
        if (parts[0] === 172 && (parts[1] >= 16 && parts[1] <= 31)) return false;

        // 192.0.0.0/24 (IETF Protocol Assignments)
        if (parts[0] === 192 && parts[1] === 0 && parts[2] === 0) return false;

        // 192.0.2.0/24 (TEST-NET-1)
        if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return false;

        // 192.88.99.0/24 (6to4 Relay Anycast)
        if (parts[0] === 192 && parts[1] === 88 && parts[2] === 99) return false;

        // 192.168.0.0/16 (Private)
        if (parts[0] === 192 && parts[1] === 168) return false;

        // 198.18.0.0/15 (Network Benchmark)
        if (parts[0] === 198 && (parts[1] >= 18 && parts[1] <= 19)) return false;

        // 198.51.100.0/24 (TEST-NET-2)
        if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return false;

        // 203.0.113.0/24 (TEST-NET-3)
        if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return false;

        // 224.0.0.0/4 (Multicast) -> 224.0.0.0 - 239.255.255.255
        if (parts[0] >= 224) return false;

        return true;
    } else if (version === 6) {
        // IPv6 checks

        // ::1 (Loopback)
        if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') return false;

        // :: (Unspecified)
        if (ip === '::' || ip === '0:0:0:0:0:0:0:0') return false;

        // fc00::/7 (Unique Local)
        // fd00::/8 is also ULA.
        if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) return false;

        // fe80::/10 (Link-local)
        // fe8, fe9, fea, feb
        const firstHeppet = ip.split(':')[0].toLowerCase();
        if (['fe8', 'fe9', 'fea', 'feb'].some(prefix => firstHeppet.startsWith(prefix))) return false;

        // IPv4 mapped: ::ffff:1.2.3.4 or ::ffff:7f00:1 (hex)
        if (ip.toLowerCase().startsWith('::ffff:')) {
            const suffix = ip.substring(7);
            if (suffix.includes('.')) {
                // Dot-decimal notation
                if (net.isIPv4(suffix)) {
                    return isPublicIP(suffix);
                }
            } else {
                // Hex notation (normalized)
                const parts = suffix.split(':');
                if (parts.length === 2) {
                    const high = parseInt(parts[0], 16);
                    const low = parseInt(parts[1], 16);

                    if (!isNaN(high) && !isNaN(low)) {
                         const p1 = (high >> 8) & 255;
                         const p2 = high & 255;
                         const p3 = (low >> 8) & 255;
                         const p4 = low & 255;

                         const ipv4 = `${p1}.${p2}.${p3}.${p4}`;
                         return isPublicIP(ipv4);
                    }
                }
            }
        }

        return true;
    }
    return false;
}
