// Centralized flag helper. Keep the source ASCII-only to avoid mojibake in SSR output.
export const FLAGS: Record<string, string> = {
  UK: "\u{1F1EC}\u{1F1E7}", // alias for GB (legacy data compatibility)
};

export function getFlag(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (FLAGS[normalized]) return FLAGS[normalized];

  if (/^[A-Z]{2}$/.test(normalized)) {
    return Array.from(normalized)
      .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
      .join("");
  }

  return "\u{1F310}";
}
