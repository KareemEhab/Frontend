import { useEffect, useMemo, useState } from "react";
import ReactStars from "react-stars";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { getAuthToken } from "../auth/token";
import breadcrumbArrowWhite from "../assets/breadcrumb-arrow-white.svg";
import { useCart } from "../cart/CartContext";
import { displayRating } from "../lib/courseDisplayRating";
import { resolveMediaUrl } from "../lib/resolveMediaUrl";
import type { ApiCourse } from "../components/TopCoursesSection";

const TAX_AMOUNT = 20;

function CartLineCourse({
  course,
  onRemove,
}: {
  course: ApiCourse;
  onRemove: (id: string) => Promise<void>;
}) {
  const img = resolveMediaUrl(course.image);
  const ratingValue = displayRating(course.id);

  return (
    <div className="flex w-full justify-between gap-4 rounded-lg border border-solid border-[#E2E8F0] p-4 font-sans">
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="relative w-30 shrink-0 self-stretch sm:w-35">
          <img src={img} alt="" className="h-full w-full rounded-sm object-cover" />
          {course.discount > 0 ? (
            <span className="absolute top-1.5 right-1.5 rounded-sm bg-[#F232BD] px-2 py-0.5 font-sans text-[0.75rem] font-bold leading-3.75 text-white">
              -${course.discount}
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="font-sans text-[1.125rem] font-semibold leading-[160%] text-black">{course.title}</h2>
          <p className="mt-2 font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155]">By {course.author}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center">
              <ReactStars
                count={5}
                value={ratingValue}
                half={false}
                edit={false}
                size={20}
                color1="#E2E8F0"
                color2="#EAB308"
                char="★"
              />
            </div>
            <span className="font-sans text-[0.875rem] font-normal leading-[150%] text-[rgba(0,0,0,0.12)]" aria-hidden>
              |
            </span>
            <div className="flex flex-wrap items-center gap-2 font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155]">
              <span>{course.hours} Total Hours.</span>
              <span>{course.lectures} Lectures.</span>
              <span>{course.level}</span>
            </div>
          </div>
          <button
            type="button"
            className="mt-2 w-fit cursor-pointer border-none bg-transparent p-0 font-sans text-[0.875rem] font-normal leading-[150%] text-[#DC2626] transition-opacity hover:opacity-80"
            onClick={() => {
              void onRemove(course.id);
            }}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="shrink-0 self-start pt-0 text-right font-sans text-[1.5rem] font-semibold leading-[120%] text-black">
        ${course.price.toFixed(1)}
      </div>
    </div>
  );
}

export function CartPage() {
  const { courseIds, removeCourseId } = useCart();
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loggedIn = Boolean(getAuthToken());

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    (async () => {
      if (courseIds.length === 0) {
        setCourses([]);
        setLoadError(null);
        return;
      }
      try {
        const results = await Promise.all(
          courseIds.map((id) => api.get<ApiCourse>(`/api/courses/${encodeURIComponent(id)}`)),
        );
        if (!cancelled) {
          setCourses(results.map((r) => r.data));
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) setLoadError(parseApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loggedIn, courseIds]);

  const totals = useMemo(() => {
    let originalSum = 0;
    let discountSum = 0;
    for (const c of courses) {
      originalSum += c.price + c.discount;
      discountSum += c.discount;
    }
    const afterDiscount = courses.reduce((s, c) => s + c.price, 0);
    const tax = courses.length > 0 ? TAX_AMOUNT : 0;
    const grandTotal = courses.length > 0 ? afterDiscount + tax : 0;
    return { originalSum, discountSum, afterDiscount, grandTotal, tax };
  }, [courses]);

  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: "/cart" }} />;
  }

  const crumbClass = "font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155] transition-colors hover:text-[#0F172A] hover:underline";

  return (
    <section className="px-12.5 pt-6.25 pb-12.5 font-sans">
      <div className="mx-auto flex max-w-360 flex-col gap-15 lg:flex-row lg:justify-between">
        <div className="min-w-0 flex-1">
          <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className={crumbClass}>
              Categories
            </Link>
            <img src={breadcrumbArrowWhite} alt="" width={24} height={24} className="h-2.5 w-auto shrink-0" />
            <Link to="/" className={crumbClass}>
              Details
            </Link>
            <img src={breadcrumbArrowWhite} alt="" width={24} height={24} className="h-2.5 w-auto shrink-0" />
            <span className="font-sans text-[0.875rem] font-normal leading-[150%] text-[#2563EB]" aria-current="page">
              Shopping Cart
            </span>
          </nav>

          <h1 className="mt-2 font-sans text-[2rem] font-semibold leading-[130%] text-[#0F172A]">
            Shopping Cart
          </h1>

          <div className="mt-2.25 h-px w-full bg-[#E2E8F0]" role="separator" />

          <p className="mt-2.25 font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155]">
            {courseIds.length} Course(s) in cart
          </p>

          {loadError ? (
            <p className="mt-4 font-sans text-[0.875rem] text-red-600" role="alert">
              {loadError}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-4">
            {courses.map((c) => (
              <CartLineCourse key={c.id} course={c} onRemove={removeCourseId} />
            ))}
            {courseIds.length === 0 && !loadError ? (
              <p className="font-sans text-[0.875rem] text-[#64748B]">Your cart is empty.</p>
            ) : null}
          </div>
        </div>

        <aside className="w-full shrink-0 lg:w-[min(100%,22.5rem)]">
          <h2 className="font-sans text-[1.25rem] font-semibold leading-[150%] text-[#2437AC]">Order Details</h2>

          <div className="mt-2 rounded-lg border border-solid border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-sans text-[1rem] font-normal leading-[160%] text-[#0F172A]">Price</span>
                <span className="font-sans text-[1.125rem] font-semibold leading-[160%] text-[#0F172A]">
                  ${totals.originalSum.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-sans text-[1rem] font-normal leading-[160%] text-[#0F172A]">Discount</span>
                <span className="font-sans text-[1.125rem] font-semibold leading-[160%] text-[#0F172A]">
                  -${totals.discountSum.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-sans text-[1rem] font-normal leading-[160%] text-[#0F172A]">Tax</span>
                <span className="font-sans text-[1.125rem] font-semibold leading-[160%] text-[#0F172A]">
                  ${totals.tax.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 h-px w-full bg-[#E2E8F0]" role="separator" />

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="font-sans text-[1.25rem] font-semibold leading-[150%] text-[#0F172A]">Total</span>
              <span className="font-sans text-[1.25rem] font-semibold leading-[150%] text-[#0F172A]">
                ${totals.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full cursor-pointer rounded-sm border-none bg-[#00B8FF] py-3.25 font-sans text-[0.875rem] font-medium leading-[160%] text-white transition-opacity hover:opacity-90"
            onClick={() => navigate("/checkout")}
            disabled={courseIds.length === 0}
          >
            Proceed To Checkout
          </button>
        </aside>
      </div>
    </section>
  );
}
