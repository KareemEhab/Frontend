import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAuthToken } from "../auth/token";
import { storePendingCartAdd, useCart } from "./CartContext";

type CourseRef = { id: string; title: string };

export function useAuthenticatedAddToCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addCourseId } = useCart();

  return useCallback(
    (course: CourseRef) => {
      if (!getAuthToken()) {
        storePendingCartAdd({ id: course.id, title: course.title });
        navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
        return;
      }
      const added = addCourseId(course.id);
      if (added) {
        toast.success(`${course.title} added to cart`);
      } else {
        toast.info(`${course.title} is already in your cart`);
      }
    },
    [addCourseId, navigate, location.pathname, location.search],
  );
}
