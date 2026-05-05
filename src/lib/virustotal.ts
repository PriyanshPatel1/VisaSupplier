/**
 * VirusTotal file scanning utility.
 *
 * Uploads a file buffer to VirusTotal and polls for scan results.
 * Used before storing uploaded files in Cloudinary.
 *
 * Requires: VIRUSTOTAL_API_KEY env variable.
 * If not set, scanning is skipped (logs a warning in production).
 *
 * VT free tier: 4 lookups/min, 500/day — sufficient for most use cases.
 * For higher volume, upgrade to VT Enterprise or use ClamAV locally.
 */

import { logger } from "./logger";

const VT_BASE = "https://www.virustotal.com/api/v3";
const vtLogger = logger.child({ module: "virustotal" });

export interface ScanResult {
  clean: boolean;
  skipped: boolean;
  threatName?: string;
  positives?: number;
  total?: number;
  scanId?: string;
}

/** Upload buffer to VirusTotal and return scan ID */
async function uploadToVT(buffer: Buffer, filename: string, apiKey: string): Promise<string> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)]);
  form.append("file", blob, filename);

  const res = await fetch(`${VT_BASE}/files`, {
    method: "POST",
    headers: { "x-apikey": apiKey },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`VT upload failed ${res.status}: ${body}`);
  }

  const data = await res.json() as { data: { id: string } };
  return data.data.id;
}

/** Poll VT for analysis results (up to maxAttempts × intervalMs) */
async function pollAnalysis(
  scanId: string,
  apiKey: string,
  maxAttempts = 10,
  intervalMs = 3000
): Promise<ScanResult> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));

    const res = await fetch(`${VT_BASE}/analyses/${scanId}`, {
      headers: { "x-apikey": apiKey },
    });

    if (!res.ok) continue;

    const data = await res.json() as {
      data: {
        attributes: {
          status: string;
          stats: { malicious: number; suspicious: number; undetected: number; harmless: number };
          results: Record<string, { category: string; result: string | null }>;
        };
      };
    };

    const attrs = data.data.attributes;

    if (attrs.status !== "completed") continue;

    const { malicious, suspicious } = attrs.stats;
    const total = Object.keys(attrs.results).length;
    const positives = malicious + suspicious;

    if (positives > 0) {
      // Find the first threat name
      const threat = Object.values(attrs.results).find(
        (r) => r.category === "malicious" || r.category === "suspicious"
      );
      return { clean: false, skipped: false, threatName: threat?.result ?? "Unknown threat", positives, total, scanId };
    }

    return { clean: true, skipped: false, positives: 0, total, scanId };
  }

  // Timed out — treat as clean but log
  vtLogger.warn({ scanId }, "VT scan timed out — treating file as clean");
  return { clean: true, skipped: true, scanId };
}

/**
 * Scan a file buffer with VirusTotal.
 * Returns { clean: true } if safe, { clean: false } if malicious.
 * Returns { skipped: true } if API key not configured or on timeout.
 */
export async function scanFile(buffer: Buffer, filename: string): Promise<ScanResult> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      vtLogger.warn("VIRUSTOTAL_API_KEY not set — file scan skipped in production");
    }
    return { clean: true, skipped: true };
  }

  try {
    vtLogger.info({ filename, size: buffer.length }, "Scanning file");
    const scanId = await uploadToVT(buffer, filename, apiKey);
    const result = await pollAnalysis(scanId, apiKey);

    if (!result.clean) {
      vtLogger.warn({ filename, threatName: result.threatName, positives: result.positives }, "Threat detected");
    } else {
      vtLogger.info({ filename, scanId: result.scanId }, "File clean");
    }

    return result;
  } catch (err) {
    vtLogger.error({ err, filename }, "VT scan error — treating as clean");
    return { clean: true, skipped: true };
  }
}
