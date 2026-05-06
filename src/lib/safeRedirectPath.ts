/** Allow only same-origin relative paths (prevents open redirects). */
export function safeInternalPath(raw: string | null | undefined, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}
