const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function resolveMediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseURL}${path}`;
}
