import axios from "axios";

export function parseApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
    return err.message || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
