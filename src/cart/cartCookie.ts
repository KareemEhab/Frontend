const CART_COOKIE_NAME = "workshop_cart_course_ids";
const ONE_YEAR_S = 60 * 60 * 24 * 365;

function parseCookieIds(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
}

export function readCartCourseIds(): string[] {
  if (typeof document === "undefined") return [];
  const match = document.cookie.match(new RegExp(`(?:^|; )${CART_COOKIE_NAME}=([^;]*)`));
  return parseCookieIds(match?.[1]);
}

export function writeCartCourseIds(ids: string[]): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(ids));
  document.cookie = `${CART_COOKIE_NAME}=${value};path=/;max-age=${ONE_YEAR_S};SameSite=Lax`;
}
