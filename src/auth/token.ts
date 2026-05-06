const COOKIE_NAME = "auth_token";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthToken(): string | null {
  const fromCookie = readCookie(COOKIE_NAME);
  if (fromCookie) return fromCookie;
  const legacy = typeof localStorage !== "undefined" ? localStorage.getItem(COOKIE_NAME) : null;
  if (legacy) {
    setAuthToken(legacy);
    return legacy;
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(COOKIE_NAME);
  }
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax`;
}

export function clearAuthToken(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(COOKIE_NAME);
  }
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
