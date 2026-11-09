import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import { getAuthToken } from "../auth/token";

export const PENDING_CART_STORAGE_KEY = "workshop_pending_cart_add";

type PendingCartPayload = {
  id: string;
  title: string;
};

type CartContextValue = {
  courseIds: string[];
  itemCount: number;
  /** Returns true if the id was newly added, false if it was already in the cart. */
  addCourseId: (courseId: string) => Promise<boolean>;
  removeCourseId: (courseId: string) => Promise<void>;
  setCourseIds: (ids: string[]) => void;
  refresh: () => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [courseIds, setCourseIdsState] = useState<string[]>([]);
  const loggedIn = Boolean(getAuthToken());

  const setCourseIds = useCallback(
    (ids: string[]) => {
      const unique = [...new Set(ids.filter((x) => typeof x === "string" && x.length > 0))];
      setCourseIdsState(unique);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!getAuthToken()) {
      setCourseIdsState([]);
      return;
    }
    const res = await api.get<{ courseIds: string[] }>("/api/cart");
    const ids = Array.isArray(res.data?.courseIds) ? res.data.courseIds : [];
    setCourseIds(ids.filter((x) => typeof x === "string" && x.length > 0));
  }, []);

  const clearCart = useCallback(async () => {
    if (!getAuthToken()) {
      setCourseIdsState([]);
      return;
    }
    await api.delete("/api/cart");
    setCourseIdsState([]);
  }, []);

  const addCourseId = useCallback(
    async (courseId: string) => {
      const current = courseIds;
      if (current.includes(courseId)) return false;
      const res = await api.post<{ courseIds: string[] }>("/api/cart/items", { courseId });
      const ids = Array.isArray(res.data?.courseIds) ? res.data.courseIds : [];
      setCourseIds(ids);
      return true;
    },
    [courseIds, setCourseIds],
  );

  const removeCourseId = useCallback(
    async (courseId: string) => {
      const res = await api.delete<{ courseIds: string[] }>(`/api/cart/items/${encodeURIComponent(courseId)}`);
      const ids = Array.isArray(res.data?.courseIds) ? res.data.courseIds : [];
      setCourseIds(ids);
    },
    [setCourseIds],
  );

  useEffect(() => {
    // Keep state in sync across auth changes (login/register/logout flows call refresh/clear too).
    if (loggedIn) refresh().catch(() => {});
    else setCourseIdsState([]);
  }, [loggedIn, refresh]);

  const value = useMemo<CartContextValue>(
    () => ({
      courseIds,
      itemCount: courseIds.length,
      addCourseId,
      removeCourseId,
      setCourseIds,
      refresh,
      clearCart,
    }),
    [courseIds, addCourseId, removeCourseId, setCourseIds, refresh, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function readPendingCartAdd(): PendingCartPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_CART_STORAGE_KEY);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as { id?: unknown; title?: unknown };
    if (typeof o.id !== "string" || typeof o.title !== "string") return null;
    return { id: o.id, title: o.title };
  } catch {
    return null;
  }
}

export function clearPendingCartAdd(): void {
  sessionStorage.removeItem(PENDING_CART_STORAGE_KEY);
}

export function storePendingCartAdd(payload: PendingCartPayload): void {
  sessionStorage.setItem(PENDING_CART_STORAGE_KEY, JSON.stringify(payload));
}
