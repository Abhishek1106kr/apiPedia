import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Blocks the playground from being used as an open proxy into private
// infrastructure (SSRF). This is a necessary safeguard for any "run this
// HTTP request on our servers" feature, not an optional hardening pass —
// see docs/00-master-prompt.md security requirements.
const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  const [a, b] = parts;
  if (a === 127) return true; // loopback
  if (a === 10) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 169 && b === 254) return true; // link-local (incl. cloud metadata: 169.254.169.254)
  if (a === 0) return true;
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" || // loopback
    normalized.startsWith("fc") || // unique local
    normalized.startsWith("fd") || // unique local
    normalized.startsWith("fe80") // link-local
  );
}

export async function assertUrlIsSafe(rawUrl: string): Promise<void> {
  const url = new URL(rawUrl);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Unsupported protocol: ${url.protocol}`);
  }

  const hostname = url.hostname;
  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) {
    throw new Error(`Requests to "${hostname}" are not allowed.`);
  }

  // If the hostname is already a literal IP, check it directly; otherwise
  // resolve it and check the resolved address — this stops DNS rebinding
  // to a private IP via a public-looking hostname.
  const directIpVersion = isIP(hostname);
  const ip = directIpVersion ? hostname : (await lookup(hostname)).address;

  if (isIP(ip) === 4 ? isPrivateIPv4(ip) : isPrivateIPv6(ip)) {
    throw new Error(`Requests to private/internal addresses are not allowed (resolved "${hostname}" -> ${ip}).`);
  }
}
