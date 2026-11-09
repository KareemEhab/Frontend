import { useEffect, useMemo, useState } from "react";
import ReactStars from "react-stars";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { parseApiError } from "../api/errors";
import { displayRating } from "../lib/courseDisplayRating";
import { resolveMediaUrl } from "../lib/resolveMediaUrl";
import { useAuthenticatedAddToCart } from "../cart/useAuthenticatedAddToCart";
import cardCartIcon from "../assets/card-cart.svg";

export type ApiCategory = {
  id: string;
  name: string;
};

export type ApiCourse = {
  id: string;
  hours: number;
  image: string;
  level: string;
  price: number;
  title: string;
  author: string;
  category: string;
  discount: number;
  lectures: number;
  addToCart: boolean;
  categoryID: number;
  description: string;
  ratingCount: number;
  showOnHomepage: boolean;
  languages?: string[] | string;
};

function categoryMatchesCourse(cat: ApiCategory, course: ApiCourse): boolean {
  const n = Number(cat.id);
  if (!Number.isNaN(n) && cat.id.trim() !== "") return course.categoryID === n;
  return String(course.categoryID) === String(cat.id);
}

function categoryTagStyles(category: string): { bg: string; text: string } {
  const c = category.toLowerCase();
  if (c.includes("cloud")) return { bg: "bg-orange-500", text: "text-white" };
  if (c.includes("data")) return { bg: "bg-violet-500", text: "text-white" };
  if (c.includes("devops")) return { bg: "bg-emerald-600", text: "text-white" };
  return { bg: "bg-sky-400", text: "text-white" };
}

/** Backend has no average rating; order by engagement (rating count). */
function compareTopRated(a: ApiCourse, b: ApiCourse): number {
  if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
  return a.title.localeCompare(b.title);
}

const MAX_TOP_COURSES = 4;

/** Exclude seed/API "All" so it is not duplicated next to the synthetic All tab. */
function isRealCategoryTab(cat: ApiCategory): boolean {
  if (cat.id === "0") return false;
  if (cat.name.trim().toLowerCase() === "all") return false;
  return true;
}

const tabButtonClass =
  "inline-flex h-[3.125rem] w-[9.8125rem] shrink-0 items-center justify-center truncate rounded-[0.5rem] px-[0.25rem] font-sans text-[1rem] font-semibold leading-[1.25rem] transition-colors";

function CourseCard({ course, onCartClick }: { course: ApiCourse; onCartClick: (c: ApiCourse) => void }) {
  const img = resolveMediaUrl(course.image);
  const tag = categoryTagStyles(course.category);
  const ratingValue = displayRating(course.id);
  const cardShellClass =
    "rounded-[1rem] border border-solid border-[#E2E8F0] bg-white p-[1rem] font-sans transition-[box-shadow,border-color] duration-300 ease-out hover:border-[#CBD5E1] hover:shadow-[0_0.25rem_1.25rem_rgba(15,23,42,0.1)]";

  return (
    <article className={cardShellClass}>
      <div className="relative">
        <Link to={`/courses/${course.id}`} className="block text-inherit no-underline">
          <div className="relative overflow-hidden rounded-lg">
            <img src={img} alt="" className="aspect-4/3 w-full object-cover" />
            {course.discount > 0 ? (
              <span className="absolute top-2.5 right-2.5 rounded-sm bg-[#F232BD] px-2 py-0.5 font-sans text-[0.75rem] font-bold leading-3.75 text-white">
                -${course.discount}
              </span>
            ) : null}
          </div>
        </Link>
        {course.addToCart ? (
          <button
            type="button"
            className="absolute bottom-3.5 left-3.5 z-10 inline-flex cursor-pointer items-center justify-center rounded-sm border-none bg-transparent p-0"
            aria-label={`Add ${course.title} to cart`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCartClick(course);
            }}
          >
            <img src={cardCartIcon} alt="" width={22} height={22} className="block h-5.5 w-5.5" />
          </button>
        ) : null}
      </div>

      <Link to={`/courses/${course.id}`} className="mt-4 block text-inherit no-underline">
        <div className="flex items-start justify-between gap-2">
          <span className="font-sans text-[0.875rem] font-bold leading-[150%] text-[#00B8FF]">
            ${course.price.toFixed(1)}
          </span>
          <span
            className={`max-w-21.25 shrink-0 truncate rounded-[0.625rem] px-0.25 py-1.5 text-center font-sans text-[0.75rem] font-semibold leading-[100%] ${tag.bg} ${tag.text}`}
            title={course.category}
          >
            {course.category}
          </span>
        </div>

        <h3 className="mt-3 font-sans text-[1.125rem] font-semibold leading-[160%] text-[#0F172A]">{course.title}</h3>

        <p className="mt-1.5 font-sans text-[0.875rem] font-normal leading-[150%] text-slate-600">
          By {course.author}
        </p>

        <div className="mt-2 flow-root">
          <div className="pointer-events-none inline-flex items-center gap-[0.15625rem]">
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
            <span className="font-sans text-[0.75rem] font-semibold leading-[100%] text-[#334155]">
              ({course.ratingCount} Ratings)
            </span>
          </div>
        </div>

        <p className="mt-2 font-sans text-[0.875rem] font-normal leading-[150%] text-[#334155]">
          {course.hours} Total Hours. {course.lectures} Lectures. {course.level}
        </p>
      </Link>
    </article>
  );
}

export function TopCoursesSection() {
  const addToCartAuth = useAuthenticatedAddToCart();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catRes, courseRes] = await Promise.all([
          api.get<{ Categories: ApiCategory[] }>("/api/categories"),
          api.get<{ Courses: ApiCourse[] }>("/api/courses"),
        ]);
        if (cancelled) return;
        setCategories([...(catRes.data.Categories ?? [])].sort((a, b) => Number(a.id) - Number(b.id)));
        setCourses([...(courseRes.data.Courses ?? [])].sort((a, b) => a.title.localeCompare(b.title)));
        setError(null);
      } catch (e) {
        if (!cancelled) setError(parseApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabCategories = useMemo(() => categories.filter(isRealCategoryTab), [categories]);

  const displayedCourses = useMemo(() => {
    if (selectedCategoryId === null) {
      return [...courses].sort(compareTopRated).slice(0, MAX_TOP_COURSES);
    }
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (!cat) return [...courses].sort(compareTopRated).slice(0, MAX_TOP_COURSES);
    return [...courses]
      .filter((co) => categoryMatchesCourse(cat, co))
      .sort(compareTopRated)
      .slice(0, MAX_TOP_COURSES);
  }, [courses, categories, selectedCategoryId]);

  return (
    <section className="bg-white p-10 max-md:p-6">
      <div className="mx-auto max-w-360">
        <h2 className="text-center font-sans text-[1.5rem] font-semibold leading-[140%] text-[#0F172A]">Top Courses</h2>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4.5">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={[
              tabButtonClass,
              selectedCategoryId === null
                ? "bg-[#00B8FF] text-white"
                : "bg-[#94A3B8] text-white hover:bg-[#64748B]",
            ].join(" ")}
          >
            All
          </button>
          {tabCategories.map((cat) => {
            const active = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={[
                  tabButtonClass,
                  active ? "bg-[#00B8FF] text-white" : "bg-[#94A3B8] text-white hover:bg-[#64748B]",
                ].join(" ")}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="mt-6 text-center font-sans text-[0.875rem] text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-4">
          {displayedCourses.map((course) => (
            <CourseCard key={course.id} course={course} onCartClick={(c) => addToCartAuth({ id: c.id, title: c.title })} />
          ))}
        </div>

        {!error && displayedCourses.length === 0 ? (
          <p className="mt-8 text-center font-sans text-[0.875rem] text-slate-600">No courses match this category.</p>
        ) : null}
      </div>
    </section>
  );
}
