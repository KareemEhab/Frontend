import { useEffect, useState } from "react";
import ReactStars from "react-stars";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { useAuthenticatedAddToCart } from "../cart/useAuthenticatedAddToCart";
import authorFallback from "../assets/author.png";
import globeIcon from "../assets/globe.svg";
import linksPng from "../assets/links.png";
import rightArrowIcon from "../assets/right-arrow.svg";
import { displayRating } from "../lib/courseDisplayRating";
import { resolveMediaUrl } from "../lib/resolveMediaUrl";
import type { ApiCourse } from "../components/TopCoursesSection";

type ApiCourseDetail = ApiCourse & {
  languages?: string[] | string;
};

const breadcrumbTextClass =
  "font-sans text-[0.875rem] font-normal leading-[150%] transition-colors";

function formatLanguages(raw: ApiCourseDetail["languages"]): string {
  if (raw == null) return "English";
  if (Array.isArray(raw)) {
    const parts = raw.map((s) => String(s).trim()).filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "English";
  }
  const s = String(raw).trim();
  return s.length > 0 ? s : "English";
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addToCartAuth = useAuthenticatedAddToCart();
  const [course, setCourse] = useState<ApiCourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroBroken, setHeroBroken] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Course not found.");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiCourseDetail>(`/api/courses/${encodeURIComponent(id)}`);
        if (!cancelled) {
          setCourse(res.data);
          setHeroBroken(false);
        }
      } catch (e) {
        if (!cancelled) setError(parseApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] px-[2.5rem] pt-[2.8125rem] pb-[7.8125rem]">
        <p className="mx-auto max-w-[90rem] font-sans text-[0.875rem] text-[#334155]">Loading…</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="bg-[#F8FAFC] px-[2.5rem] pt-[2.8125rem] pb-[7.8125rem]">
        <div className="mx-auto max-w-[90rem] font-sans text-[0.875rem] text-red-600" role="alert">
          {error ?? "Course not found."}
        </div>
        <Link
          to="/"
          className="mx-auto mt-[1rem] block max-w-[90rem] font-sans text-[0.875rem] font-medium text-[#2563EB] underline-offset-2 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const ratingValue = displayRating(course.id);
  const heroSrc = heroBroken ? authorFallback : resolveMediaUrl(course.image) || authorFallback;
  const originalPrice = course.discount > 0 ? course.price + course.discount : null;
  const discountLabel =
    course.discount > 0
      ? course.discount % 1 === 0
        ? String(course.discount)
        : course.discount.toFixed(1)
      : null;

  return (
    <section className="bg-[#F8FAFC] px-[2.5rem] pt-[2.8125rem] pb-[7.8125rem]">
      <div className="mx-auto grid max-w-[90rem] gap-[2rem] lg:grid-cols-[minmax(0,1fr)_min(100%,22.5rem)] lg:gap-[2.5rem]">
        <div className="rounded-[inherit] bg-[#F8FAFC] p-[1.25rem]">
          <nav className="flex flex-wrap items-center gap-[0.5rem]" aria-label="Breadcrumb">
            <Link
              to="/"
              className={`${breadcrumbTextClass} cursor-pointer text-[#334155] hover:text-[#0F172A] hover:underline`}
            >
              Home
            </Link>
            <img src={rightArrowIcon} alt="" width={6} height={10} className="shrink-0" />
            <span className={`${breadcrumbTextClass} text-[#2563EB]`} aria-current="page">
              {course.title}
            </span>
          </nav>

          <div className="mt-[2.5rem] flex flex-col">
            <h1 className="mb-[2.25rem] font-sans text-[2.5rem] font-bold leading-[140%] tracking-[-0.02em] text-[#0F172A]">
              {course.title}
            </h1>
            <p className="mb-[1.5rem] font-sans text-[1rem] font-normal leading-[160%] text-[#334155]">
              {course.description}
            </p>

            <div className="mb-[1.5rem] flex flex-wrap items-center gap-[0.5rem]">
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
              <span className="font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155]" aria-hidden>
                |
              </span>
              <div className="flex flex-wrap items-center gap-[0.5rem] font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155]">
                <span>{course.hours} Total Hours.</span>
                <span>{course.lectures} Lectures.</span>
                <span>{course.level}</span>
              </div>
            </div>

            <div className="mb-[1.5rem] flex items-center gap-[0.5rem]">
              <img
                src={authorFallback}
                alt=""
                width={40}
                height={40}
                className="h-[2.5rem] w-[2.5rem] shrink-0 rounded-full object-cover"
              />
              <p className="font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155]">
                Created by <span className="text-[#2563EB]">{course.author}</span>
              </p>
            </div>

            <div className="flex items-center gap-[0.75rem] font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155]">
              <img src={globeIcon} alt="" width={20} height={20} className="h-[1.25rem] w-[1.25rem] shrink-0" />
              <span>{formatLanguages(course.languages)}</span>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[1rem] border border-solid border-[#E2E8F0] bg-white p-[1.5rem] lg:sticky lg:top-[1rem]">
          <img
            src={heroSrc}
            alt=""
            className="w-full rounded-[0.5rem] object-cover"
            onError={() => setHeroBroken(true)}
          />

          <div className="mt-[2rem] flex flex-wrap items-baseline gap-[0.125rem]">
            <span className="font-sans text-[1.5rem] font-semibold leading-[140%] text-[#0F172A]">
              ${course.price.toFixed(1)}
            </span>
            {originalPrice != null ? (
              <>
                <span className="font-sans text-[1.125rem] font-semibold leading-[160%] text-[#94A3B8] line-through">
                  ${originalPrice.toFixed(1)}
                </span>
                <span className="font-sans text-[1.25rem] font-semibold leading-[150%] text-[#16A34A]">
                  -${discountLabel}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-[1.5rem] flex flex-col gap-[1rem]">
            <button
              type="button"
              className="w-full cursor-pointer rounded-[0.25rem] border-none bg-[#00B8FF] py-[0.8125rem] font-sans text-[0.875rem] font-medium leading-[160%] text-white transition-opacity hover:opacity-90"
              onClick={() => addToCartAuth({ id: course.id, title: course.title })}
            >
              Add To Cart
            </button>
            <button
              type="button"
              className="w-full cursor-pointer rounded-[0.25rem] border border-solid border-[#00B8FF] bg-transparent py-[0.8125rem] font-sans text-[0.875rem] font-medium leading-[160%] text-[#00B8FF] transition-colors hover:bg-[#00B8FF]/5"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-[1.75rem] ml-[-1.5rem] h-px w-[calc(100%+3rem)] bg-[#E2E8F0]" role="separator" />

          <p className="mt-[1.5rem] font-sans text-[1rem] font-medium leading-[160%] text-[#0F172A]">Share</p>
          <div className="mt-[0.5rem]">
            <img src={linksPng} alt="" className="max-w-full object-contain object-left" />
          </div>
        </aside>
      </div>
    </section>
  );
}
