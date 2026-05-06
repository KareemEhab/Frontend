import { toast } from "sonner";
import { clearPendingCartAdd, readPendingCartAdd } from "./CartContext";

/** After successful auth, add pending course and notify (login / register). */
export function flushPendingCartAfterAuth(addCourseId: (id: string) => boolean): void {
  const pending = readPendingCartAdd();
  if (!pending) return;
  clearPendingCartAdd();
  addCourseId(pending.id);
  toast.success(`${pending.title} added to cart`);
}
