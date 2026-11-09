import { toast } from "sonner";
import { clearPendingCartAdd, readPendingCartAdd } from "./CartContext";

/** After successful auth, add pending course and notify (login / register). */
export async function flushPendingCartAfterAuth(addCourseId: (id: string) => Promise<boolean>): Promise<void> {
  const pending = readPendingCartAdd();
  if (!pending) return;
  clearPendingCartAdd();
  await addCourseId(pending.id);
  toast.success(`${pending.title} added to cart`);
}
