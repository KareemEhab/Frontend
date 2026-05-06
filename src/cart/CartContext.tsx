import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { readCartCourseIds, writeCartCourseIds } from "./cartCookie";

export const PENDING_CART_STORAGE_KEY = "workshop_pending_cart_add";

type PendingCartPayload = {
  id: string;
  title: string;
};

type CartContextValue = {
  courseIds: string[];
  itemCount: number;
  /** Returns true if the id was newly added, false if it was already in the cart. */
  addCourseId: (courseId: string) => boolean;
  removeCourseId: (courseId: string) => void;
  setCourseIds: (ids: string[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [courseIds, setCourseIdsState] = useState<string[]>(() => readCartCourseIds());

  const persist = useCallback((ids: string[]) => {
    writeCartCourseIds(ids);
    setCourseIdsState(ids);
  }, []);

  const addCourseId = useCallback((courseId: string) => {
    const current = readCartCourseIds();
    if (current.includes(courseId)) return false;
    persist([...current, courseId]);
    return true;
  }, [persist]);

  const removeCourseId = useCallback(
    (courseId: string) => {
      const current = readCartCourseIds();
      persist(current.filter((id) => id !== courseId));
    },
    [persist],
  );

  const setCourseIds = useCallback(
    (ids: string[]) => {
      const unique = [...new Set(ids.filter((x) => typeof x === "string" && x.length > 0))];
      persist(unique);
    },
    [persist],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      courseIds,
      itemCount: courseIds.length,
      addCourseId,
      removeCourseId,
      setCourseIds,
    }),
    [courseIds, addCourseId, removeCourseId, setCourseIds],
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
